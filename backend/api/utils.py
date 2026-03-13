import functools
import logging
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from django.db.models import Q
from rest_framework import serializers
from rest_framework.response import Response

from api.availability.utils import get_weekday_date
from api.models import UserEvent, UserSession
from api.settings import (
    COOKIE_DOMAIN,
    DEBUG,
    GENERIC_ERR_RESPONSE,
    LONG_SESS_EXP_SECONDS,
    REST_FRAMEWORK,
    SESS_EXP_SECONDS,
    TEST_ENVIRONMENT,
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


def validate_error_format(data, input_serializer_class):
    """
    A helper function to make sure that error messages are returned in whatever crazy
    format I decided to use for this project.

    Expected format:
    ```
    {
        "error": {
            "general/[input serializer field name]": [
                "Error message",
                ...
            ],
            ...
        }
    }
    ```
    """

    def log_error_msg_error(message):
        logger.error("Error message validation error: %s", message)

    if not isinstance(data, dict):
        log_error_msg_error("Response must be a dictionary.")

    if "error" not in data or not isinstance(data["error"], dict):
        log_error_msg_error("Response must contain an 'error' dictionary.")

    if input_serializer_class:
        for field_name, value in data["error"].items():
            if field_name not in input_serializer_class().fields:
                if field_name != "general":
                    log_error_msg_error(
                        f"{field_name} must be a field name from the input serializer."
                    )
            if not isinstance(value, list):
                log_error_msg_error(f"{field_name} must be a list.")
            if not all(isinstance(item, str) for item in value):
                log_error_msg_error(f"All items in {field_name} must be strings.")
    else:
        for field_name, value in data["error"].items():
            if field_name != "general":
                log_error_msg_error(
                    f"{field_name} must be named 'general' if no input serializer is provided."
                )
            if not isinstance(value, list):
                log_error_msg_error(f"{field_name} must be a list.")


class MessageOutputSerializer(serializers.Serializer):
    message = serializers.ListField(child=serializers.CharField())


def validate_output(serializer_class):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(request, *args, **kwargs):
            response = func(request, *args, **kwargs)
            if isinstance(response, Response):
                if 200 <= response.status_code < 300:
                    serializer = serializer_class(data=response.data)
                    if serializer.is_valid():
                        response.data = serializer.validated_data
                        return response
                    else:
                        logger.error("Output validation failed: %s", serializer.errors)
                        return GENERIC_ERR_RESPONSE
                else:
                    validate_error_format(
                        response.data, get_metadata(wrapper).input_serializer_class
                    )
                    # If the format is bad, just print errors to the log and move on
                    # We don't want errors causing errors to cause problems in prod
                    return response
            else:
                logger.critical("Response is not a valid Response object.")
                return GENERIC_ERR_RESPONSE

        get_metadata(wrapper).output_serializer_class = serializer_class
        return wrapper

    return decorator


def get_rate_limit(scope):
    return REST_FRAMEWORK.get("DEFAULT_THROTTLE_RATES", {}).get(scope, None)


def rate_limit(
    throttle_class, error_message="Rate limit ({rate}) exceeded. Try again later."
):
    """
    A decorator that takes a throttle class and limits the endpoint accordingly.

    An optional message can be passed, which can include the `{rate}` placeholder to
    dynamically insert the rate limit value.
    """

    def decorator(func):
        @functools.wraps(func)
        def wrapper(request, *args, **kwargs):
            throttle = throttle_class()
            if not throttle.allow_request(request, None):
                msg = error_message
                if "{rate}" in msg:
                    msg = msg.replace("{rate}", throttle.get_rate())
                logger.warning(msg)
                return Response(
                    {"error": {"general": [msg]}},
                    status=429,
                )
            return func(request, *args, **kwargs)

        get_metadata(wrapper).rate_limit = get_rate_limit(throttle_class.scope)
        return wrapper

    return decorator


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

    if event.duration is not None:
        data["duration"] = event.duration

    return data
