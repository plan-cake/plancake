import logging

from django.db.models import Exists, OuterRef, Prefetch, Q, prefetch_related_objects
from rest_framework import serializers
from rest_framework.response import Response

from api.decorators import api_endpoint, check_auth, validate_output
from api.models import (
    EventCalendarTimeslot,
    EventDateTimeslot,
    EventParticipant,
    EventWeekdayTimeslot,
    UserEvent,
)
from api.utils import TimeZoneField, format_event_info

logger = logging.getLogger("api")


class DashboardEventSerializer(serializers.Serializer):
    title = serializers.CharField(required=True, max_length=255)
    event_type = serializers.ChoiceField(
        required=True, choices=["Date", "Week", "Calendar"]
    )
    dates = serializers.ListField(
        child=serializers.DateField(), required=True, allow_empty=False
    )
    start_time = serializers.TimeField(required=True)
    end_time = serializers.TimeField(required=True)
    time_zone = TimeZoneField(required=True)
    participants = serializers.ListField(
        child=serializers.CharField(max_length=25), required=True, allow_empty=True
    )
    event_code = serializers.CharField(required=True, max_length=255)


class DashboardSerializer(serializers.Serializer):
    created_events = serializers.ListField(
        child=DashboardEventSerializer(), required=True
    )
    participated_events = serializers.ListField(
        child=DashboardEventSerializer(), required=True
    )


@api_endpoint("GET")
@check_auth
@validate_output(DashboardSerializer)
def get_dashboard(request):
    """
    Returns dashboard data for the current user. This includes events that the user
    created and ones that the user participated in.

    The events are sorted by their creation date descending, meaning the most recent
    events appear first.

    Events that no longer have a URL code from inactivity will not be included.
    """
    user = request.user

    if not user:
        return Response(
            {
                "created_events": [],
                "participated_events": [],
            },
            status=200,
        )

    # Create a queryset to be used as a subquery
    is_participant = EventParticipant.objects.filter(
        user_event=OuterRef("pk"), user_account=user
    )
    events = (
        UserEvent.objects.filter(
            Q(user_account=user) | Q(Exists(is_participant)),
            url_code__isnull=False,
        )
        .order_by("-created_at")
        .select_related("url_code")
        .prefetch_related(
            Prefetch(
                "participants",
                queryset=EventParticipant.objects.order_by("created_at"),
            ),
        )
    )

    # Only prefetch the relevant timeslots for each event
    events = list(events)
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

    # Events that the user both created and participated in only count as created
    my_events = []
    their_events = []
    for event in events:
        event_info = format_event_info(event, include_participants=True)
        if event.user_account_id == user.user_account_id:
            my_events.append(event_info)
        else:
            their_events.append(event_info)

    return Response(
        {"created_events": my_events, "participated_events": their_events}, status=200
    )
