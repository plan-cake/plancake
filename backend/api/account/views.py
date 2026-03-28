import logging
import random
import string
from datetime import datetime, timedelta

from django.core.mail import send_mail
from rest_framework import serializers
from rest_framework.response import Response

from api.availability.serializers import DisplayNameSerializer
from api.decorators import (
    api_endpoint,
    require_account_auth,
    validate_json_input,
    validate_output,
)
from api.models import AuthedPasswordResetCode
from api.settings import AUTHED_PWD_RESET_EXP_SECONDS, SEND_EMAILS, ThrottleScopes
from api.utils import MessageOutputSerializer, check_rate_limit

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
    reset_code = serializers.CharField(required=True, max_length=6)


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
