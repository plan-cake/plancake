import logging
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.db.models import Q
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.throttling import SimpleRateThrottle

from api.availability.utils import get_weekday_date
from api.models import UserAccount, UserEvent, UserSession
from api.settings import (
    ACCOUNT_COOKIE_NAME,
    COOKIE_DOMAIN,
    DEBUG,
    GUEST_COOKIE_NAME,
    LONG_SESS_EXP_SECONDS,
    SESS_EXP_SECONDS,
    TEST_ENVIRONMENT,
    ThrottleScope,
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
    Retrieves a session by its token, ensuring it is still valid.
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


def get_event_type(date_type):
    match date_type:
        case UserEvent.EventType.SPECIFIC:
            return "Date"
        case UserEvent.EventType.GENERIC:
            return "Week"


class EventBounds:
    def __init__(
        self,
        start_date: datetime.date,
        end_date: datetime.date,
        start_time: datetime.time,
        end_time: datetime.time,
    ):
        self.start_date = start_date
        self.end_date = end_date
        self.start_time = start_time
        self.end_time = end_time


def get_event_bounds(event: UserEvent) -> EventBounds:
    """
    Finds the start and end date/time bounds for an event.

    For query efficiency, the event's timeslots should be prefetched.
    """
    all_timeslots: list[datetime] = []
    event_time_zone = ZoneInfo(event.time_zone)

    event_type = get_event_type(event.date_type)
    match event.date_type:
        case UserEvent.EventType.SPECIFIC:
            # Sort the timeslots by the EVENT'S time zone to get the creator's min/max
            all_timeslots = [
                ts.utc_timeslot.astimezone(event_time_zone)
                for ts in event.date_timeslots.all()
            ]
        case UserEvent.EventType.GENERIC:
            all_timeslots = [
                get_weekday_date(ts.weekday, ts.local_timeslot)
                for ts in event.weekday_timeslots.all()
            ]

    if not all_timeslots:
        logger.critical(
            f"Event {event.id} has no timeslots when formatting for dashboard."
        )
        raise ValueError("Event has no timeslots.")

    # Earliest weekday is also sorted by date
    start_date = min(ts.date() for ts in all_timeslots)
    end_date = max(ts.date() for ts in all_timeslots)
    start_time = min(ts.time() for ts in all_timeslots)
    end_time = max(ts.time() for ts in all_timeslots)
    # End time should be 15 minutes after the last timeslot
    end_time = (datetime.combine(datetime.min, end_time) + timedelta(minutes=15)).time()

    # datetime.combine has no time zone info, so we include the event's time zone to
    # make sure it doesn't convert twice
    start_datetime = datetime.combine(start_date, start_time).replace(
        tzinfo=event_time_zone
    )
    end_datetime = datetime.combine(end_date, end_time).replace(tzinfo=event_time_zone)
    if event.date_type == UserEvent.EventType.SPECIFIC:
        # Convert to UTC for date events, not week events since those stay in local time
        start_datetime = start_datetime.astimezone(ZoneInfo("UTC"))
        end_datetime = end_datetime.astimezone(ZoneInfo("UTC"))

    return EventBounds(
        start_date=start_datetime.date(),
        end_date=end_datetime.date(),
        start_time=start_datetime.time(),
        end_time=end_datetime.time(),
    )


def format_event_info(event: UserEvent, include_participants: bool = False) -> dict:
    """
    Formats event information.

    For query efficiency, the event's timeslots should be prefetched.

    If `include_participants` is `True`, the event's participants should also be
    prefetched.
    """
    bounds = get_event_bounds(event)

    data = {
        "title": event.title,
        "event_type": get_event_type(event.date_type),
        "start_date": bounds.start_date,
        "end_date": bounds.end_date,
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
            acct_token = request.COOKIES.get(ACCOUNT_COOKIE_NAME)
            guest_token = request.COOKIES.get(GUEST_COOKIE_NAME)
            if acct_token:
                session = get_session(acct_token)
                if session:
                    user = session.user_account
            if not user and guest_token:
                session = get_session(guest_token)
                if session:
                    user = session.user_account

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
    """
    UserSession.objects.filter(user_account=request.user).exclude(
        session_token=request.COOKIES.get(ACCOUNT_COOKIE_NAME)
    ).delete()


def get_client_ip(request) -> str | None:
    """
    Extracts the client's IP address, accounting for possible proxy headers.
    """
    x_forwarded_for = request.META.get("HTTP_X_FORWARDED_FOR")
    if x_forwarded_for:
        # If there are multiple, the first is the original client
        ip = x_forwarded_for.split(",")[0].strip()
    else:
        # Direct connection
        ip = request.META.get("REMOTE_ADDR")

    return ip if ip else None


def get_client_user_agent(request) -> str | None:
    """
    Extracts the client's user agent string.
    """
    return request.META.get("HTTP_USER_AGENT", None)
