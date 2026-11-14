import logging

from api.settings import GUEST_COOKIE_NAME
from api.utils import set_session_cookie, touch_session

logger = logging.getLogger("api")


def get_guest_account(request, response):
    """
    Returns the guest account associated with the request, refreshing the session token
    cookie and updating the metadata on the session.

    If there is no guest account, this will return `None`.

    This does NOT make the guest user available on the `request` object.
    """
    guest_token = request.COOKIES.get(GUEST_COOKIE_NAME)
    if not guest_token:
        return None

    logger.debug("Guest session token: %s", guest_token)
    session = touch_session(request, guest_token)
    if not session:
        logger.info("Guest session expired.")
        return None

    set_session_cookie(response, GUEST_COOKIE_NAME, session.session_token, True)
    return session.user_account
