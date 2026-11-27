import random
import string
from datetime import datetime, timedelta

from django.db import transaction
from rest_framework.response import Response

from api.models import PasswordResetCode
from api.settings import MAX_VERIFICATION_CODE_ATTEMPTS, PWD_RESET_CODE_EXP_SECONDS


def validate_password(password):
    MIN_LENGTH = 8
    SPECIAL_CHARACTERS = """!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"""

    LENGTH_CRIT = f"be at least {MIN_LENGTH} characters long"
    LOWER_CRIT = "contain at least one lowercase letter"
    UPPER_CRIT = "contain at least one uppercase letter"
    DIGIT_CRIT = "contain at least one digit"
    SPECIAL_CRIT = "contain at least one special character"

    is_strong = True
    criteria = {
        LENGTH_CRIT: True,
        LOWER_CRIT: True,
        UPPER_CRIT: True,
        DIGIT_CRIT: True,
        SPECIAL_CRIT: True,
    }
    if len(password) < MIN_LENGTH:
        criteria[LENGTH_CRIT] = False
        is_strong = False
    if not any(char.islower() for char in password):
        criteria[LOWER_CRIT] = False
        is_strong = False
    if not any(char.isupper() for char in password):
        criteria[UPPER_CRIT] = False
        is_strong = False
    if not any(char.isdigit() for char in password):
        criteria[DIGIT_CRIT] = False
        is_strong = False
    if not any(char in SPECIAL_CHARACTERS for char in password):
        criteria[SPECIAL_CRIT] = False
        is_strong = False

    return is_strong, criteria


def list_failed_criteria(criteria):
    return [f"Password must {crit}." for crit, passed in criteria.items() if not passed]


def generate_verification_code():
    """
    Generates a random 6-digit code.
    """
    return "".join(random.SystemRandom().choices(string.digits, k=6))


def invalid_verification_code_response():
    return Response({"error": {"verification_code": ["Invalid code."]}}, status=400)


def attempt_verification_code(queryset, code):
    """
    `queryset` must be filtered to the unexpired code row (either `UnverifiedUserAccount`
    or `PasswordResetCode`) for the user's account.

    Returns the row if `code` matches, else `None`. A wrong guess increments
    `failed_attempts`, and deletes the row once the max attempts is reached.
    """
    with transaction.atomic():
        ver_code_obj = queryset.select_for_update().first()
        if ver_code_obj is None:
            return None
        if ver_code_obj.verification_code == code:
            return ver_code_obj
        ver_code_obj.failed_attempts += 1
        if ver_code_obj.failed_attempts >= MAX_VERIFICATION_CODE_ATTEMPTS:
            ver_code_obj.delete()
        else:
            ver_code_obj.save(update_fields=["failed_attempts"])
        return None


def password_reset_code_queryset(email):
    return PasswordResetCode.objects.select_related("user_account").filter(
        user_account__email=email,
        created_at__gte=datetime.now() - timedelta(seconds=PWD_RESET_CODE_EXP_SECONDS),
    )
