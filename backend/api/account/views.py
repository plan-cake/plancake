import logging
from datetime import datetime, timedelta

import bcrypt
from device_detector import DeviceDetector
from django.db import transaction
from django.db.models import Q
from rest_framework.response import Response

from api.account.serializers import (
    ActiveSessionListSerializer,
    PasswordChangeSerializer,
    PasswordSerializer,
    SessionIdSerializer,
)
from api.auth.utils import list_failed_criteria, validate_password
from api.availability.serializers import DisplayNameSerializer
from api.decorators import (
    api_endpoint,
    require_account_auth,
    validate_json_input,
    validate_output,
)
from api.models import UserSession
from api.settings import (
    ACCOUNT_COOKIE_NAME,
    LONG_SESS_EXP_SECONDS,
    SESS_EXP_SECONDS,
)
from api.utils import (
    MessageOutputSerializer,
    delete_session_cookie,
    prune_account_sessions,
)

logger = logging.getLogger("api")


@api_endpoint("POST")
@require_account_auth
@validate_json_input(DisplayNameSerializer)
@validate_output(MessageOutputSerializer)
def set_default_name(request):
    """
    Sets the default display name for the authenticated user account.
    """
    user = request.user
    display_name = request.validated_data["display_name"]

    user.default_display_name = display_name
    user.save()

    return Response(
        {"message": ["Default name set successfully."]},
        status=200,
    )


@api_endpoint("POST")
@require_account_auth
@validate_output(MessageOutputSerializer)
def remove_default_name(request):
    """
    Removes the default display name for the authenticated user account.
    """
    user = request.user

    user.default_display_name = None
    user.save()

    return Response(
        {"message": ["Default name removed successfully."]},
        status=200,
    )


@api_endpoint("GET")
@require_account_auth
@validate_output(ActiveSessionListSerializer)
def get_active_sessions(request):
    """
    Retrieves all active sessions for the authenticated user account, with device and
    client info when available.

    The current session is included and marked with `is_current` set to `true`.
    """
    user = request.user
    sessions = UserSession.objects.filter(
        (
            Q(is_extended=True)
            & Q(
                last_used__gte=datetime.now() - timedelta(seconds=LONG_SESS_EXP_SECONDS)
            )
        )
        | (
            Q(is_extended=False)
            & Q(last_used__gte=datetime.now() - timedelta(seconds=SESS_EXP_SECONDS))
        ),
        user_account=user,
    ).order_by("-last_used")

    active_sessions = []

    for session in sessions:
        session_data = {
            "public_id": session.public_id,
            "last_used": session.last_used,
            "is_current": session.session_token
            == request.COOKIES.get(ACCOUNT_COOKIE_NAME),
        }
        if session.user_agent_raw is not None:
            device = DeviceDetector(session.user_agent_raw).parse()
            session_data["device_type"] = device.device_type() or None
            session_data["os_name"] = device.os_name() or None
            session_data["os_version"] = device.os_version() or None
            session_data["client_name"] = device.client_name() or None
            session_data["client_version"] = device.client_version() or None
        active_sessions.append(session_data)

    return Response({"sessions": active_sessions}, status=200)


@api_endpoint("POST")
@require_account_auth
@validate_json_input(SessionIdSerializer)
@validate_output(MessageOutputSerializer)
def terminate_session(request):
    """
    Terminates a specific session for the authenticated user account, identified by its
    public session ID.
    """
    user = request.user
    public_id = request.validated_data["session_id"]

    try:
        session = UserSession.objects.get(user_account=user, public_id=public_id)
        if session.session_token == request.COOKIES.get(ACCOUNT_COOKIE_NAME):
            return Response(
                {"error": {"session_id": ["Cannot terminate the current session."]}},
                status=400,
            )
        session.delete()
        return Response({"message": ["Session terminated successfully."]}, status=200)
    except UserSession.DoesNotExist:
        return Response({"error": {"session_id": ["Session not found."]}}, status=404)


@api_endpoint("POST")
@require_account_auth
@validate_output(MessageOutputSerializer)
def prune_sessions(request):
    """
    Terminates all sessions for the authenticated user account except the current one.
    """
    prune_account_sessions(request)

    return Response({"message": ["Sessions pruned successfully."]}, status=200)


@api_endpoint("POST")
@require_account_auth
@validate_json_input(PasswordChangeSerializer)
@validate_output(MessageOutputSerializer)
def change_password(request):
    """
    Changes the password for the currently-authenticated user account after verifying the
    current password.

    If `prune_sessions` is true, all active sessions for this account EXCEPT the current
    one will be removed for security.
    """
    password = request.validated_data.get("password")
    new_password = request.validated_data.get("new_password")
    prune_sessions = request.validated_data.get("prune_sessions")

    user = request.user

    if not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        logger.info(
            "Password change failed for %s: Incorrect current password.", user.email
        )
        return Response({"error": {"password": ["Incorrect password."]}}, status=400)

    # Check if the new password is actually new
    if password == new_password:
        logger.info("Password change failed: New password was not new.")
        return Response(
            {
                "error": {
                    "new_password": [
                        "New password must be different from current password."
                    ]
                }
            },
            status=400,
        )

    is_strong, criteria = validate_password(new_password)
    if not is_strong:
        logger.info("Password change failed for %s: Invalid new password.", user.email)
        return Response(
            {"error": {"new_password": list_failed_criteria(criteria)}}, status=400
        )

    with transaction.atomic():
        user.password_hash = bcrypt.hashpw(
            new_password.encode(), bcrypt.gensalt()
        ).decode()
        user.save()

        if prune_sessions:
            prune_account_sessions(request)

    return Response({"message": ["Password changed successfully."]}, status=200)


@api_endpoint("POST")
@require_account_auth
@validate_json_input(PasswordSerializer)
@validate_output(MessageOutputSerializer)
def delete_account(request):
    """
    Deletes the currently-authenticated user account after verifying the password.
    """
    password = request.validated_data.get("password")
    user = request.user

    if not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        logger.info("Account deletion failed for %s: Incorrect password.", user.email)
        return Response({"error": {"password": ["Incorrect password."]}}, status=400)

    user.delete()

    response = Response({"message": ["Account deleted successfully."]}, status=200)
    delete_session_cookie(response, ACCOUNT_COOKIE_NAME)
    return response
