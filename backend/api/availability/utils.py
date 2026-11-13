from django.db.models import Q

from api.models import (
    EventCalendarAvailability,
    EventCalendarTimeslot,
    EventDateAvailability,
    EventDateTimeslot,
    EventParticipant,
    EventWeekdayAvailability,
    EventWeekdayTimeslot,
    UserEvent,
)
from api.utils import get_weekday_date, to_datetime


def get_timeslots(event):
    timeslots = []
    if event.date_type == UserEvent.EventType.SPECIFIC:
        timeslots = EventDateTimeslot.objects.filter(user_event=event).order_by(
            "utc_timeslot"
        )
    elif event.date_type == UserEvent.EventType.GENERIC:
        timeslots = EventWeekdayTimeslot.objects.filter(user_event=event).order_by(
            "weekday", "local_timeslot"
        )
    elif event.date_type == UserEvent.EventType.CALENDAR:
        timeslots = EventCalendarTimeslot.objects.filter(user_event=event).order_by(
            "date"
        )

    return timeslots


def check_name_available(event, user, display_name):
    if user:
        existing_participant = EventParticipant.objects.filter(
            ~Q(user_account=user),
            user_event=event,
            display_name__iexact=display_name,
        ).first()
    else:
        existing_participant = EventParticipant.objects.filter(
            user_event=event,
            display_name__iexact=display_name,
        ).first()
    return existing_participant is None


def timeslot_key(event_type, timeslot) -> str:
    """
    Formats a timeslot of the given event type as the ISO string used for availability.
    """
    match event_type:
        case UserEvent.EventType.SPECIFIC:
            return timeslot.utc_timeslot.isoformat()
        case UserEvent.EventType.GENERIC:
            weekday_date = get_weekday_date(timeslot.weekday, timeslot.local_timeslot)
            return weekday_date.isoformat()
        case UserEvent.EventType.CALENDAR:
            return to_datetime(timeslot.date).isoformat()


# The availability model for each event type, and its associated name for relationships.
AVAILABILITY_MODELS = {
    UserEvent.EventType.SPECIFIC: (
        EventDateAvailability,
        "event_date_timeslot",
    ),
    UserEvent.EventType.GENERIC: (
        EventWeekdayAvailability,
        "event_weekday_timeslot",
    ),
    UserEvent.EventType.CALENDAR: (
        EventCalendarAvailability,
        "event_calendar_timeslot",
    ),
}
