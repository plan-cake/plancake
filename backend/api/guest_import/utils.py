import logging

from django.db import transaction

from api.models import UserSession
from api.settings import GUEST_COOKIE_NAME
from api.utils import get_session, set_session_cookie, update_session_metadata

logger = logging.getLogger("api")


def get_guest_account(request, response):
    """
    Returns the guest account associated with the request, refreshing the session token
    cookie and updating the metadata on the session.

    If there is no guest account, this will return `None`.

    This does NOT make the guest user available on the `request` object.
    """
    guest_token = request.COOKIES.get(GUEST_COOKIE_NAME)

    if guest_token:
        logger.debug("Guest session token: %s", guest_token)
        try:
            with transaction.atomic():
                session = get_session(guest_token)
                if not session:
                    raise UserSession.DoesNotExist

                update_session_metadata(request, session)

            set_session_cookie(response, GUEST_COOKIE_NAME, session.session_token, True)
            return session.user_account
        except UserSession.DoesNotExist:
            logger.info("Guest session expired.")

    return None
