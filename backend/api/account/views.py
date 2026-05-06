import logging
import random
import string
from datetime import datetime, timedelta

import bcrypt
from device_detector import DeviceDetector
from django.core.mail import send_mail
from django.db import transaction
from django.db.models import Q
from rest_framework.response import Response

from api.account.serializers import (
    ActiveSessionListSerializer,
    AuthedPasswordResetCodeSerializer,
    AuthedPasswordResetSerializer,
    SessionIdSerializer,
)
from api.auth.serializers import PasswordChangeSerializer, PasswordSerializer
from api.auth.utils import list_failed_criteria, validate_password
from api.availability.serializers import DisplayNameSerializer
from api.decorators import (
    api_endpoint,
    require_account_auth,
    validate_json_input,
    validate_output,
)
from api.models import AuthedPasswordResetCode, UserSession
from api.settings import (
    ACCOUNT_COOKIE_NAME,
    AUTHED_PWD_RESET_EXP_SECONDS,
    LONG_SESS_EXP_SECONDS,
    SEND_EMAILS,
    SESS_EXP_SECONDS,
    ThrottleScopes,
)
from api.utils import (
    MessageOutputSerializer,
    check_rate_limit,
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
@validate_output(MessageOutputSerializer)
def start_authed_password_reset(request):
    """
    Starts the authed password reset flow by generating a 6-digit reset code and sending
    it to the user's email.
    """
    user = request.user

    # Check the rate limit
    check_rate_limit(request, ThrottleScopes.PASSWORD_RESET)

    # Generate the 6-digit reset code
    reset_code = "".join(random.SystemRandom().choices(string.digits, k=6))

    AuthedPasswordResetCode.objects.update_or_create(
        user_account=user,
        defaults={"reset_code": reset_code, "created_at": datetime.now()},
    )
    logger.debug("Authed password reset code for %s: %s", user.email, reset_code)

    if SEND_EMAILS:
        send_mail(
            subject="Plancake - Password Reset Code",
            message=f"Your password reset code is: {reset_code}.\n\nNot you? You should change your password immediately to protect your account.",
            from_email=None,  # Use the default from settings
            recipient_list=[user.email],
            fail_silently=False,
        )

    return Response(
        {"message": ["An email has been sent to your address with the reset code."]},
        status=200,
    )


@api_endpoint("POST")
@require_account_auth
@validate_json_input(AuthedPasswordResetCodeSerializer)
@validate_output(MessageOutputSerializer)
def check_authed_password_reset_code(request):
    """
    Checks the provided authed password reset code.
    """
    user = request.user
    reset_code = request.validated_data["reset_code"]

    check_rate_limit(request, ThrottleScopes.CODE_CHECK)

    try:
        AuthedPasswordResetCode.objects.get(
            user_account=user,
            reset_code=reset_code,
            created_at__gte=datetime.now()
            - timedelta(seconds=AUTHED_PWD_RESET_EXP_SECONDS),
        )
    except AuthedPasswordResetCode.DoesNotExist:
        return Response(
            {"error": {"reset_code": ["Invalid reset code."]}},
            status=400,
        )

    return Response(
        {"message": ["Reset code is valid."]},
        status=200,
    )


@api_endpoint("POST")
@require_account_auth
@validate_json_input(AuthedPasswordResetSerializer)
@validate_output(MessageOutputSerializer)
def authed_password_reset(request):
    """
    Resets the user's password using the provided authed reset code.
    """
    user = request.user
    reset_code = request.validated_data["reset_code"]
    new_password = request.validated_data["new_password"]
    prune_sessions = request.validated_data["prune_sessions"]

    check_rate_limit(request, ThrottleScopes.CODE_CHECK)

    is_strong, criteria = validate_password(new_password)
    if not is_strong:
        logger.info("Password reset failed: Invalid new password.")
        return Response(
            {"error": {"new_password": list_failed_criteria(criteria)}}, status=400
        )

    try:
        with transaction.atomic():
            # Check the authed reset code
            reset_code_obj = AuthedPasswordResetCode.objects.get(
                user_account=user,
                reset_code=reset_code,
                created_at__gte=datetime.now()
                - timedelta(seconds=AUTHED_PWD_RESET_EXP_SECONDS),
            )

            # Check if the new password is actually new
            if bcrypt.checkpw(new_password.encode(), user.password_hash.encode()):
                logger.info("Authed password reset failed: New password was not new.")
                return Response(
                    {
                        "error": {
                            "new_password": [
                                "New password must be different from old password."
                            ]
                        }
                    },
                    status=400,
                )

            user.password_hash = bcrypt.hashpw(
                new_password.encode(), bcrypt.gensalt()
            ).decode()
            user.save()
            reset_code_obj.delete()

            if prune_sessions:
                prune_account_sessions(request)

    except AuthedPasswordResetCode.DoesNotExist:
        return Response(
            {"error": {"reset_code": ["Invalid reset code."]}},
            status=400,
        )

    return Response({"message": ["Password reset successfully."]}, status=200)


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
