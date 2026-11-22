import json
import logging
import uuid
from abc import ABC, abstractmethod
from dataclasses import dataclass
from datetime import date, datetime, time, timedelta
from enum import Enum
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

import requests
from django.core.mail import EmailMultiAlternatives
from django.db import transaction
from django.db.models import Prefetch, Q, prefetch_related_objects
from ipware import get_client_ip
from redis import Redis
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle

from api.models import (
    EventCalendarTimeslot,
    EventDateTimeslot,
    EventWeekdayTimeslot,
    UserAccount,
    UserEvent,
    UserSession,
)
from api.redis_pools import sync_pool
from api.settings import (
    ACCOUNT_COOKIE_NAME,
    BASE_URL,
    COOKIE_DOMAIN,
    DEBUG,
    EMAIL_BRIDGE_SECRET,
    GUEST_COOKIE_NAME,
    LONG_SESS_EXP_SECONDS,
    SEND_EMAILS,
    SESS_EXP_SECONDS,
    SESS_TOUCH_INTERVAL_SECONDS,
    TEST_ENVIRONMENT,
    ThrottleScope,
    ThrottleScopes,
)

logger = logging.getLogger("api")


class APIMetadata:
    """
    Holds metadata to be used for documentation.
    """

    def __init__(self):
        self.method = None
        self.input_type = None
        self.input_serializer_class = None
        self.output_serializer_class = None
        self.rate_limit = None
        self.min_auth_required = None
        self.captcha_required = False


def get_metadata(func):
    """
    For use with documentation.

    Returns the APIMetadata class for the provided function, to be added to. If it doesn't
    exist, one will be created.
    """
    if not hasattr(func, "metadata"):
        func.metadata = APIMetadata()
    return func.metadata


def get_session(token):
    """
    Retrieves a session (and the associated user account) by its token, ensuring it is
    still valid.
    """
    return (
        UserSession.objects.filter(session_token=token)
        .filter(
            (
                Q(is_extended=True)
                & Q(
                    last_used__gte=datetime.now()
                    - timedelta(seconds=LONG_SESS_EXP_SECONDS)
                )
            )
            | (
                Q(is_extended=False)
                & Q(last_used__gte=datetime.now() - timedelta(seconds=SESS_EXP_SECONDS))
            )
        )
        .select_related("user_account")
        .first()
    )


def set_session_cookie(response, key, value, is_extended):
    """
    Given a response, sets a session cookie with appropriate parameters.

    Mostly just to avoid repeating this 8-line block of code.

    The TEST_ENVIRONMENT environment variable determines the `secure` and `samesite`
    parameters for testing to allow proper cookie functionality in different testing
    environments.
    """

    # Delete the legacy "Host-Only" cookie if it exists
    response.delete_cookie(key)

    response.set_cookie(
        key=key,
        value=value,
        httponly=True,
        secure=False if DEBUG and TEST_ENVIRONMENT == "Local" else True,
        samesite="None" if DEBUG and TEST_ENVIRONMENT == "Codespaces" else "Lax",
        max_age=LONG_SESS_EXP_SECONDS if is_extended else SESS_EXP_SECONDS,
        domain=COOKIE_DOMAIN,
    )


def delete_session_cookie(response, key):
    """
    Given a response, deletes a session cookie.

    The domain needs to be specified to delete the right cookie.
    """
    response.delete_cookie(key, domain=COOKIE_DOMAIN)


def generic_error_response():
    return Response(
        {"error": {"general": ["An unknown error has occurred."]}}, status=500
    )


class MessageOutputSerializer(serializers.Serializer):
    message = serializers.ListField(child=serializers.CharField())


class TimeZoneField(serializers.CharField):
    def to_internal_value(self, data):
        value = super().to_internal_value(data)
        try:
            ZoneInfo(value)
        except ZoneInfoNotFoundError:
            raise serializers.ValidationError("Invalid time zone.")
        return value


def event_lookup(event_code: str):
    """
    Looks up an event by its URL code.
    """
    return UserEvent.objects.get(url_code__url_code__iexact=event_code)


def get_event_type(date_type):
    match date_type:
        case UserEvent.EventType.SPECIFIC:
            return "Date"
        case UserEvent.EventType.GENERIC:
            return "Week"
        case UserEvent.EventType.CALENDAR:
            return "Calendar"


class EventRange:
    def __init__(
        self,
        dates: list[date],
        start_time: time,
        end_time: time,
    ):
        self.dates = dates
        self.start_time = start_time
        self.end_time = end_time


def get_event_range(event: UserEvent) -> EventRange:
    """
    Finds the list of dates and start/end times for an event.

    For query efficiency, the event's timeslots should be prefetched.
    """
    times: set[time] = set()
    dates: set[date] = set()
    event_time_zone = ZoneInfo(event.time_zone)

    match event.date_type:
        case UserEvent.EventType.SPECIFIC:
            # Convert the timeslots to the EVENT'S time zone to get dates/times relative
            # to the creator
            for ts in event.date_timeslots.all():
                current = ts.utc_timeslot.astimezone(event_time_zone)
                times.add(current.time())
                dates.add(current.date())
        case UserEvent.EventType.GENERIC:
            for ts in event.weekday_timeslots.all():
                current = get_weekday_date(ts.weekday, ts.local_timeslot)
                times.add(current.time())
                dates.add(current.date())
        case UserEvent.EventType.CALENDAR:
            for ts in event.calendar_timeslots.all():
                current = to_datetime(ts.date)
                dates.add(current.date())

    if not dates or (event.date_type != UserEvent.EventType.CALENDAR and not times):
        logger.critical(
            f"Event {event.user_event_id} has no timeslots when formatting for dashboard."
        )
        raise ValueError("Event has no timeslots.")

    if event.date_type == UserEvent.EventType.CALENDAR:
        return EventRange(
            dates=sorted(dates),
            start_time=time(hour=0, minute=0, second=0),
            end_time=time(hour=0, minute=0, second=0),
        )
    else:
        start_time = min(times)
        end_time = max(times)
        # End time is 15 minutes after the last timeslot
        end_time = (datetime.combine(date.min, end_time) + timedelta(minutes=15)).time()

        # Dates and times are left in the event's time zone, and the frontend handles the
        # conversion
        return EventRange(
            dates=sorted(dates),
            start_time=start_time,
            end_time=end_time,
        )


def prefetch_timeslots(events: list[UserEvent]):
    """
    Prefetches the ordered timeslots for already-fetched events.

    Only the tables that the events actually need are queried.
    """
    timeslot_prefetches = {
        UserEvent.EventType.SPECIFIC: Prefetch(
            "date_timeslots",
            queryset=EventDateTimeslot.objects.order_by("utc_timeslot"),
        ),
        UserEvent.EventType.GENERIC: Prefetch(
            "weekday_timeslots",
            queryset=EventWeekdayTimeslot.objects.order_by("weekday", "local_timeslot"),
        ),
        UserEvent.EventType.CALENDAR: Prefetch(
            "calendar_timeslots",
            queryset=EventCalendarTimeslot.objects.order_by("date"),
        ),
    }
    for event_type, prefetch in timeslot_prefetches.items():
        events_of_type = [event for event in events if event.date_type == event_type]
        prefetch_related_objects(events_of_type, prefetch)


def format_event_info(event: UserEvent, include_participants: bool = False) -> dict:
    """
    Formats event information.

    For query efficiency, the event's timeslots should be prefetched.

    If `include_participants` is `True`, the event's participants should also be
    prefetched.
    """
    bounds = get_event_range(event)

    data = {
        "title": event.title,
        "event_type": get_event_type(event.date_type),
        "dates": bounds.dates,
        "start_time": bounds.start_time,
        "end_time": bounds.end_time,
        "time_zone": event.time_zone,
        "event_code": event.url_code.url_code if event.url_code else None,
    }

    if include_participants:
        data["participants"] = [
            participant.display_name for participant in event.participants.all()
        ]

    return data


class PlancakeThrottle(SimpleRateThrottle):
    """
    Custom throttle class that allows for dynamic rate limit scopes and integration with
    the custom authentication system.
    """

    def __init__(self, scope):
        self.scope = scope.key
        super().__init__()

    def get_cache_key(self, request, view):
        user = None
        if isinstance(request.user, UserAccount):
            user = request.user
        else:
            auth = authenticate(request, touch=False)
            if auth.session:
                user = auth.session.user_account

        # If the user is either logged in or using a guest account, use their ID
        if user:
            return self.cache_format % {
                "scope": self.scope,
                "ident": user.user_account_id,
            }

        # Otherwise, just use the IP address
        return self.cache_format % {
            "scope": self.scope,
            "ident": self.get_ident(request),
        }


class RateLimitError(Exception):
    def __init__(self, message, response):
        self.response = response
        super().__init__(message)


def check_rate_limit(request, throttle_scope: ThrottleScope) -> None:
    """
    Checks if a request should be allowed based on the provided throttle scope. If not,
    raises a RateLimitError with the Response to be sent back to the user.

    **Be careful that this error is not caught in a generic exception handler.** It should
    be uncaught and allowed to propagate past the view function.
    """
    throttler = PlancakeThrottle(throttle_scope)
    if not throttler.allow_request(request, None):
        msg = throttle_scope.message
        if "{rate}" in msg:
            msg = msg.replace("{rate}", throttler.get_rate())
        logger.warning(msg)
        response = Response(
            {"error": {"general": [msg]}},
            status=429,
        )
        wait_time = throttler.wait()
        if wait_time is not None:
            response["Retry-After"] = str(wait_time)

        raise RateLimitError(
            message=msg,
            response=response,
        )


def prune_account_sessions(request):
    """
    Deletes all of the current account's sessions except for the current one.

    This function depends on the user being authenticated and existing in the request
    object.
    """
    UserSession.objects.filter(user_account=request.user).exclude(
        session_token=request.COOKIES.get(ACCOUNT_COOKIE_NAME)
    ).delete()


def get_client_ip_address(request) -> str | None:
    """
    Extracts the client's IP address, accounting for possible proxy headers.
    """
    client_ip, _ = get_client_ip(request)
    return client_ip if client_ip else None


def get_client_user_agent(request) -> str | None:
    """
    Extracts the client's user agent string.
    """
    return request.META.get("HTTP_USER_AGENT", None)


def update_session_metadata(request, session: UserSession):
    """
    Updates the session's metadata (IP address, user agent, and last used time) based on
    the incoming request.

    The write is skipped if the metadata is unchanged and the session was last used
    within `SESS_TOUCH_INTERVAL_SECONDS`.
    """
    ip_address = get_client_ip_address(request)
    user_agent_raw = get_client_user_agent(request)
    touch_due = session.last_used < datetime.now() - timedelta(
        seconds=SESS_TOUCH_INTERVAL_SECONDS
    )

    if (
        touch_due
        or session.ip_address != ip_address
        or session.user_agent_raw != user_agent_raw
    ):
        session.ip_address = ip_address
        session.user_agent_raw = user_agent_raw
        session.save(update_fields=["ip_address", "user_agent_raw", "last_used"])


@dataclass
class AuthResult:
    """
    The outcome of checking a request's session cookies.
    """

    session: UserSession | None = None
    # The name of the cookie that holds the session's token, to refresh it later
    cookie_name: str | None = None
    # Whether an account session token was sent but is no longer valid
    account_expired: bool = False


def touch_session(request, token):
    """
    Returns the valid session for a token, updating its metadata, or `None` if the session
    doesn't exist or has expired.
    """
    session = get_session(token)
    if session:
        update_session_metadata(request, session)
    return session


def authenticate(request, allow_guest=True, touch=True):
    """
    Finds the session for a request from its cookies, checking the account session first
    and falling back to the guest session if `allow_guest` is true.

    If `touch` is true, the session's metadata is updated (see `update_session_metadata`).
    Use `touch=False` for lookups that shouldn't count as session activity.

    This does NOT create a guest account, or make the user available on the request.
    """

    def find(token):
        return touch_session(request, token) if touch else get_session(token)

    acct_token = request.COOKIES.get(ACCOUNT_COOKIE_NAME)
    if acct_token:
        logger.debug("Account session token: %s", acct_token)
        session = find(acct_token)
        if session:
            return AuthResult(session, ACCOUNT_COOKIE_NAME)
        if touch:
            logger.info("Account session expired.")

    # At this point the account session either expired or did not exist
    result = AuthResult(account_expired=bool(acct_token))
    if not allow_guest:
        return result

    guest_token = request.COOKIES.get(GUEST_COOKIE_NAME)
    if guest_token:
        logger.debug("Guest session token: %s", guest_token)
        session = find(guest_token)
        if session:
            result.session = session
            result.cookie_name = GUEST_COOKIE_NAME
        else:
            logger.info("Guest session expired.")
    return result


def create_guest_session(request):
    """
    Creates a new guest account with an extended session, subject to the guest account
    creation rate limit.
    """
    check_rate_limit(request, ThrottleScopes.GUEST_ACCOUNT_CREATION)
    with transaction.atomic():
        guest_account = UserAccount.objects.create(is_guest=True)
        guest_session = UserSession.objects.create(
            session_token=str(uuid.uuid4()),
            user_account=guest_account,
            is_extended=True,
        )
    logger.debug("New guest session token: %s", guest_session.session_token)
    return guest_session


def finalize_auth_response(response, auth: AuthResult):
    """
    Refreshes the session token cookie on the response, and if the account session
    expired, deletes its cookie and adds a message saying so.
    """
    if auth.session:
        set_session_cookie(
            response,
            auth.cookie_name,
            auth.session.session_token,
            auth.session.is_extended,
        )
    if auth.account_expired:
        response.data.setdefault("message", []).append("Account session expired.")
        delete_session_cookie(response, ACCOUNT_COOKIE_NAME)
    return response


class LiveUpdateAction(str, Enum):
    """
    Enum for the type of live update action being performed.
    """

    ADD = "add"
    UPDATE = "update"
    REMOVE = "remove"
    EVENT_EDIT = "event_edit"


class LiveUpdateData(ABC):
    """
    Base class for data to be sent in a live update.
    """

    @abstractmethod
    def __init__(self, action: LiveUpdateAction):
        self.action = action

    @abstractmethod
    def to_dict(self):
        pass


class LiveUpdateAddUpdateData(LiveUpdateData):
    """
    Data for a live update when a participant is added or updated.
    """

    def __init__(
        self,
        action: LiveUpdateAction,
        public_id: str,
        display_name: str,
        joined_at: str,
        updated_at: str,
        time_zone: str,
        availability: list[str],
    ):
        if action not in (LiveUpdateAction.ADD, LiveUpdateAction.UPDATE):
            raise ValueError("Action must be either ADD or UPDATE for this data class.")
        self.action = action
        self.public_id = public_id
        self.display_name = display_name
        self.joined_at = joined_at
        self.updated_at = updated_at
        self.time_zone = time_zone
        self.availability = availability

    def to_dict(self):
        return {
            "action": self.action,
            "public_id": self.public_id,
            "display_name": self.display_name,
            "joined_at": self.joined_at,
            "updated_at": self.updated_at,
            "time_zone": self.time_zone,
            "availability": self.availability,
        }


class LiveUpdateRemoveData(LiveUpdateData):
    """
    Data for a live update when a participant is removed.
    """

    def __init__(self, public_id: str):
        self.public_id = public_id

    def to_dict(self):
        return {
            "action": LiveUpdateAction.REMOVE,
            "public_id": self.public_id,
        }


class LiveUpdateEventEditData(LiveUpdateData):
    """
    Data for a live update when an event is edited.
    """

    def __init__(self):
        pass

    def to_dict(self):
        return {
            "action": LiveUpdateAction.EVENT_EDIT,
        }


class LiveUpdateEvent:
    def __init__(
        self,
        user_id: int,
        event_code: str,
        data: LiveUpdateData,
    ):
        self.user_id = user_id
        self.event_code = event_code
        self.data = data

    def dumps(self):
        return json.dumps(
            {
                "user_id": self.user_id,
                "event_code": self.event_code,
                "data": self.data.to_dict(),
            }
        )


def live_update_channel(event_code: str) -> str:
    """
    Returns the Redis channel for an event's live updates.

    URL codes are case-insensitive, so the channel is lowercased to make every
    capitalization of a code share it.
    """
    return f"event_{event_code.lower()}"


def notify_live_update(event: LiveUpdateEvent):
    Redis(connection_pool=sync_pool).publish(
        live_update_channel(event.event_code),
        event.dumps(),
    )


def to_datetime(date):
    """
    Converts a date object to a datetime object at midnight.

    If the input is already a datetime object, it is returned unchanged.
    """
    if isinstance(date, datetime):
        return date
    return datetime(date.year, date.month, date.day)


def get_weekday_date(weekday, timeslot):
    """
    Places a weekday (0 = Sunday) and time of day on a reference week, January 1-7, 2012,
    which starts on a Sunday.
    """
    return datetime(2012, 1, weekday + 1, timeslot.hour, timeslot.minute)


class EmailTemplateKey(str, Enum):
    EMAIL_IN_USE = "email_in_use"
    EMAIL_VERIFICATION = "email_verification"
    PASSWORD_RESET = "password_reset"
    PASSWORD_RESET_CODE = "password_reset_code"


def send_templated_email(to_email, template_key: EmailTemplateKey, context) -> bool:
    """
    Fetches rendered HTML from Next.js and sends it as an email.

    Returns True if the email was sent successfully, False otherwise.

    This function will check the SEND_EMAILS environment variable, and if set to False
    then the email will not be sent and True will be returned every time.
    """
    if not SEND_EMAILS:
        return True

    url = BASE_URL
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {EMAIL_BRIDGE_SECRET}",
    }
    payload = {
        "template_key": template_key,
        "context": context,
    }

    html_content = None
    text_fallback = None
    msg_subject = None
    success = False

    try:
        response = requests.post(
            url + "/api/render-email/", json=payload, headers=headers, timeout=5
        )

        if response.status_code == 200:
            data = response.json()
            html_content = data.get("html")
            text_fallback = data.get("text")
            msg_subject = data.get("subject")
            success = True
            logger.info(f"Successfully rendered email for template '{template_key}'")
        else:
            logger.error(
                f"Failed to render email for template '{template_key}'. "
                f"Status code: {response.status_code}, Response: {response.text}"
            )
    except requests.RequestException as e:
        logger.error(f"Error rendering email for template '{template_key}': {e}")

    try:
        if html_content:
            EmailMultiAlternatives(
                subject=msg_subject,
                body=text_fallback,
                alternatives=[(html_content, "text/html")],
                to=[to_email],
            ).send()
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        success = False

    return success
