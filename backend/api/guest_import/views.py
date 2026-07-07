import logging

from rest_framework.response import Response

from api.decorators import (
    api_endpoint,
    require_account_auth,
    validate_output,
)
from api.guest_import.serializers import GuestDataSerializer, GuestDataSummarySerializer
from api.guest_import.utils import get_guest_account
from api.models import (
    EventParticipant,
    UserEvent,
)

logger = logging.getLogger("api")


@api_endpoint("GET")
@require_account_auth
@validate_output(GuestDataSummarySerializer)
def get_summary(request):
    """
    Returns counts of events created and participated in by the guest user.
    """
    response = Response()

    guest_user = get_guest_account(request, response)

    if guest_user is None:
        response.data = {
            "created_events": 0,
            "participated_events": 0,
        }
        response.status_code = 200
        return response

    events = UserEvent.objects.filter(
        user_account=guest_user, url_code__isnull=False
    ).count()

    participations = EventParticipant.objects.filter(
        user_account=guest_user,
        user_event__url_code__isnull=False,
    ).count()

    response.data = {
        "created_events": events,
        "participated_events": participations,
    }
    response.status_code = 200

    return response


@api_endpoint("GET")
@require_account_auth
@validate_output(GuestDataSerializer)
def get_data(request):
    """
    Returns brief information about events created and participated in by the guest user.
    """
    response = Response()

    guest_user = get_guest_account(request, response)
    account_user = request.user

    if guest_user is None:
        response.data = {
            "created_events": [],
            "participated_events": [],
        }
        response.status_code = 200
        return response

    events = UserEvent.objects.filter(
        user_account=guest_user, url_code__isnull=False
    ).select_related("url_code")
    created_events = [
        {
            "url_code": event.url_code.url_code,
            "title": event.title,
        }
        for event in events
    ]

    participations = EventParticipant.objects.filter(
        user_account=guest_user,
        user_event__url_code__isnull=False,
    ).select_related("user_event__url_code")
    participated_events = [
        {
            "url_code": participation.user_event.url_code.url_code,
            "title": participation.user_event.title,
            "guest_display_name": participation.display_name,
            "account_display_name": None,
        }
        for participation in participations
    ]

    conflicts = EventParticipant.objects.filter(
        user_account=account_user,
        user_event__in=participations.values_list("user_event", flat=True),
    ).select_related("user_event__url_code")
    for conflict in conflicts:
        for participation in participated_events:
            if participation["url_code"] == conflict.user_event.url_code.url_code:
                participation["account_display_name"] = conflict.display_name

    response.data = {
        "created_events": created_events,
        "participated_events": participated_events,
    }
    response.status_code = 200

    return response
