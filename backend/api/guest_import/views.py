import logging

from django.core.exceptions import ObjectDoesNotExist
from django.db import transaction
from rest_framework.response import Response

from api.decorators import (
    api_endpoint,
    require_account_auth,
    validate_json_input,
    validate_output,
)
from api.guest_import.serializers import (
    GuestDataSerializer,
    GuestDataSummarySerializer,
    GuestImportDataSerializer,
)
from api.guest_import.utils import get_guest_account
from api.models import (
    EventParticipant,
    UserEvent,
)
from api.utils import MessageOutputSerializer

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

    events = UserEvent.objects.filter(user_account=guest_user).count()

    participations = EventParticipant.objects.filter(user_account=guest_user).count()

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

    def get_url_code(event):
        try:
            return event.url_code.url_code
        except ObjectDoesNotExist:
            return None

    events = UserEvent.objects.filter(user_account=guest_user).select_related(
        "url_code"
    )
    created_events = [
        {
            "url_code": get_url_code(event),
            "public_id": event.public_id,
            "title": event.title,
        }
        for event in events
    ]

    participations = EventParticipant.objects.filter(
        user_account=guest_user,
    ).select_related("user_event__url_code")
    participated_events = [
        {
            "url_code": get_url_code(participation.user_event),
            "public_id": participation.user_event.public_id,
            "title": participation.user_event.title,
            "guest_display_name": participation.display_name,
            "account_display_name": None,
        }
        for participation in participations
    ]

    conflicts = EventParticipant.objects.filter(
        user_account=account_user,
        user_event__in=participations.values_list("user_event", flat=True),
    )
    for conflict in conflicts:
        for participation in participated_events:
            if participation["public_id"] == conflict.user_event.public_id:
                participation["account_display_name"] = conflict.display_name
    logger.info(
        "%s conflicted events found during guest import for user: %s",
        len(conflicts),
        account_user.email,
    )

    response.data = {
        "created_events": created_events,
        "participated_events": participated_events,
    }
    response.status_code = 200

    return response


@api_endpoint("POST")
@require_account_auth
@validate_json_input(GuestImportDataSerializer)
@validate_output(MessageOutputSerializer)
def import_data(request):
    """
    Transfers ownership of events and availabilities created by the guest to the account.

    The body of the request should contain a mapping of event URL codes to the user's
    chosen submission to keep, for each event the guest had submitted availability to. If
    there is no conflict, "guest" should be specified.

    Every conflicted submission that is not kept will be deleted when calling this
    endpoint.
    """
    availability_choices = request.data.get("availability_choices", {})

    response = Response()

    guest_user = get_guest_account(request, response)
    account_user = request.user

    def no_data_found():
        response.data = {
            "error": {"general": ["No guest data found."]},
        }
        response.status_code = 400
        return response

    if guest_user is None:
        return no_data_found()

    with transaction.atomic():
        # Check if the guest has any data to import
        guest_events = UserEvent.objects.filter(user_account=guest_user)
        guest_submissions = EventParticipant.objects.filter(
            user_account=guest_user
        ).select_related("user_event")
        if not guest_events.exists() and not guest_submissions.exists():
            logger.warning(
                "No guest data found for import attempt for user: %s",
                account_user.email,
            )
            return no_data_found()

        # Check if all the guest user's submissions are accounted for in the choices
        if set(availability_choices.keys()) != set(
            str(submission.user_event.public_id) for submission in guest_submissions
        ):
            logger.warning(
                "Availability choices do not match guest submissions for user: %s",
                account_user.email,
            )
            response.data = {
                "error": {
                    "availability_choices": [
                        "Availability choices do not match guest submissions.",
                    ]
                }
            }
            response.status_code = 400
            return response

        # Transfer event ownership
        UserEvent.objects.filter(user_account=guest_user).update(
            user_account=account_user
        )

        # === DELETE DISCARDED SUBMISSIONS ===
        account_chosen = []
        guest_chosen = []
        for public_id, choice in availability_choices.items():
            match choice:
                case "account":
                    account_chosen.append(public_id)
                case "guest":
                    guest_chosen.append(public_id)

        # Start by removing the guest's submissions from events that have "account" specified
        EventParticipant.objects.filter(
            user_account=guest_user, user_event__public_id__in=account_chosen
        ).delete()
        # Then remove the account's submissions from events that have "guest" specified
        EventParticipant.objects.filter(
            user_account=account_user, user_event__public_id__in=guest_chosen
        ).delete()

        # Then of all the remaining guest submissions transfer ownership to the account
        EventParticipant.objects.filter(user_account=guest_user).update(
            user_account=account_user
        )

    response.data = {"message": ["Guest data imported successfully."]}
    response.status_code = 200

    return response
