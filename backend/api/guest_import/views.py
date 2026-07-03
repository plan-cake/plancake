import logging

from django.db.models import Q
from rest_framework import serializers
from rest_framework.response import Response

from api.decorators import (
    api_endpoint,
    require_account_auth,
    validate_output,
)
from api.guest_import.utils import get_guest_account
from api.models import (
    EventParticipant,
    UserEvent,
)

logger = logging.getLogger("api")


class GuestDataSummarySerializer(serializers.Serializer):
    created_events = serializers.IntegerField()
    participated_events = serializers.IntegerField()


@api_endpoint("GET")
@require_account_auth
@validate_output(GuestDataSummarySerializer)
def get_summary(request):
    """
    Returns a count of events created and participated in by the guest user.
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

    created_events = UserEvent.objects.filter(
        user_account=guest_user, url_code__isnull=False
    ).count()
    participations = EventParticipant.objects.filter(
        user_account=guest_user,
        user_event__url_code__isnull=False,
    ).count()

    return Response(
        {"created_events": created_events, "participated_events": participations},
        status=200,
    )
