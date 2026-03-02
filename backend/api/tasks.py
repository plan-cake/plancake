from datetime import datetime, timedelta

from celery import shared_task
from django.db.models import Q

from api.models import PasswordResetToken, UnverifiedUserAccount, UserSession
from api.settings import (
    EMAIL_CODE_EXP_SECONDS,
    LONG_SESS_EXP_SECONDS,
    PWD_RESET_EXP_SECONDS,
    SESS_EXP_SECONDS,
)


def session_cleanup():
    """
    Cleans up sessions that are older than the expiration time for their corresponding
    type.

    Session lifetime is defined for each type in `settings.py`.
    """
    UserSession.objects.filter(
        (
            Q(is_extended=True)
            & Q(last_used__lt=datetime.now() - timedelta(seconds=LONG_SESS_EXP_SECONDS))
        )
        | (
            Q(is_extended=False)
            & Q(last_used__lt=datetime.now() - timedelta(seconds=SESS_EXP_SECONDS))
        )
    ).delete()


def unverified_user_cleanup():
    """
    Removes expired unverified users.
    """
    UnverifiedUserAccount.objects.filter(
        created_at__lt=datetime.now() - timedelta(seconds=EMAIL_CODE_EXP_SECONDS)
    ).delete()


def password_reset_token_cleanup():
    """
    Removes expired password reset tokens.
    """
    PasswordResetToken.objects.filter(
        created_at__lt=datetime.now() - timedelta(seconds=PWD_RESET_EXP_SECONDS)
    ).delete()


@shared_task
def daily_duties():
    """
    Performs daily duties, including:
    - Cleaning up expired data in the database.
    """
    session_cleanup()
    unverified_user_cleanup()
    password_reset_token_cleanup()
