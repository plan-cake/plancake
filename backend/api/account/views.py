import logging
import random
import string
from datetime import datetime, timedelta

import bcrypt
from django.core.mail import send_mail
from django.db import transaction
from rest_framework import serializers
from rest_framework.response import Response

from api.auth.utils import list_failed_criteria, validate_password
from api.availability.serializers import DisplayNameSerializer
from api.decorators import (
    api_endpoint,
    require_account_auth,
    validate_json_input,
    validate_output,
)
from api.models import AuthedPasswordResetCode
from api.settings import AUTHED_PWD_RESET_EXP_SECONDS, SEND_EMAILS, ThrottleScopes
from api.utils import MessageOutputSerializer, check_rate_limit, prune_account_sessions

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


class AuthedPasswordResetCodeSerializer(serializers.Serializer):
    reset_code = serializers.RegexField(
        regex=r"^\d{6}$",
        required=True,
        min_length=6,
        max_length=6,
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


class AuthedPasswordResetSerializer(AuthedPasswordResetCodeSerializer):
    new_password = serializers.CharField(required=True)
    prune_sessions = serializers.BooleanField(default=False, required=False)


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
