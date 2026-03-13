import functools
import logging
import uuid

from django.db import DatabaseError, transaction
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle

from api.availability.utils import get_weekday_date
from api.models import UserAccount, UserSession
from api.settings import ACCOUNT_COOKIE_NAME, GENERIC_ERR_RESPONSE, GUEST_COOKIE_NAME
from api.utils import (
    delete_session_cookie,
    get_metadata,
    get_session,
    set_session_cookie,
)

logger = logging.getLogger("api")


def api_endpoint(method):
    """
    Defines an API endpoint that uses a single method type.

    **This must be the outer-most decorator for the view function to work properly.**
    """

    def decorator(func):
        drf_view = api_view([method])(func)
        metadata = get_metadata(func)
        metadata.method = method
        drf_view.metadata = metadata
        # Check if the endpoint has an output serializer
        if not metadata.output_serializer_class:
            logger.warning(
                "No output serializer defined for function: %s",
                func.__name__,
            )
        return drf_view

    return decorator


def check_auth(func):
    """
    A decorator to check if the user is authenticated based on their cookies.

    If the user is not authenticated, a guest account will NOT be created for them.

    The `user` object is made available in the `request` argument if authenticated.
    Otherwise, `request.user` will be `None`.

    If authenticated, this refreshes the session token cookie with the response.
    """

    @functools.wraps(func)
    def wrapper(request, *args, **kwargs):
        acct_token = request.COOKIES.get(ACCOUNT_COOKIE_NAME)
        acct_sess_expired = False
        if acct_token:
            logger.debug("Account session token: %s", acct_token)
            try:
                with transaction.atomic():
                    session = get_session(acct_token)
                    if not session:
                        # To break out of the rest of the logic
                        raise UserSession.DoesNotExist
                    session.save()  # To update last_used to now

                # At this point the account is authenticated
                request.user = session.user_account

                response = func(request, *args, **kwargs)
                # Intercept the response to refresh the session token cookie
                set_session_cookie(
                    response,
                    ACCOUNT_COOKIE_NAME,
                    session.session_token,
                    session.is_extended,
                )
                return response
            except UserSession.DoesNotExist:
                logger.info("Account session expired.")
                acct_sess_expired = True
            except DatabaseError as e:
                logger.db_error(e)
                return GENERIC_ERR_RESPONSE
            except Exception as e:
                logger.error(e)
                return GENERIC_ERR_RESPONSE

        # At this point the account session either expired or did not exist
        guest_token = request.COOKIES.get(GUEST_COOKIE_NAME)

        if guest_token:
            logger.debug("Guest session token: %s", guest_token)
            # Make sure the guest session token exists (it should)
            try:
                with transaction.atomic():
                    session = get_session(guest_token)
                    if not session:
                        raise UserSession.DoesNotExist
                    session.save()  # Update last_used

                request.user = session.user_account
                # Run the function
                response = func(request, *args, **kwargs)
                set_session_cookie(
                    response, GUEST_COOKIE_NAME, session.session_token, True
                )
            except UserSession.DoesNotExist:
                logger.info("Guest session expired.")
                # Do NOT create a new guest account
                request.user = None
                # Run the function
                response = func(request, *args, **kwargs)
            except Exception as e:
                logger.error(e)
                return GENERIC_ERR_RESPONSE
        else:
            # Do NOT create a new guest account
            request.user = None
            # Run the function
            response = func(request, *args, **kwargs)

        # Make sure to return a message if the account session expired
        if acct_sess_expired:
            SESS_EXP_MSG = "Account session expired."
            if "message" in response.data:
                response.data["message"].append(SESS_EXP_MSG)
            else:
                response.data["message"] = [SESS_EXP_MSG]
            delete_session_cookie(response, ACCOUNT_COOKIE_NAME)
        return response

    return wrapper


class GuestAccountCreationThrottle(AnonRateThrottle):
    scope = "guest_account_creation"


def require_auth(func):
    """
    A decorator to check if the user is authenticated (either with an account or as a
    guest) based on their cookies.

    If the user is not authenticated, a guest account will be created for them. If the
    supplied guest account/session does not exist, a new one will be created.

    The `user` object is made available in the `request` argument after authentication.

    If authenticated, this refreshes the session token cookie with the response.
    """

    @functools.wraps(func)
    def wrapper(request, *args, **kwargs):
        acct_token = request.COOKIES.get(ACCOUNT_COOKIE_NAME)
        acct_sess_expired = False
        if acct_token:
            logger.debug("Account session token: %s", acct_token)
            try:
                with transaction.atomic():
                    session = get_session(acct_token)
                    if not session:
                        # To break out of the rest of the logic
                        raise UserSession.DoesNotExist
                    session.save()  # To update last_used to now

                # At this point the account is authenticated
                request.user = session.user_account

                response = func(request, *args, **kwargs)
                # Intercept the response to refresh the session token cookie
                set_session_cookie(
                    response,
                    ACCOUNT_COOKIE_NAME,
                    session.session_token,
                    session.is_extended,
                )
                return response
            except UserSession.DoesNotExist:
                logger.info("Account session expired.")
                acct_sess_expired = True
            except DatabaseError as e:
                logger.db_error(e)
                return GENERIC_ERR_RESPONSE
            except Exception as e:
                logger.error(e)
                return GENERIC_ERR_RESPONSE

        # At this point the account session either expired or did not exist
        guest_token = request.COOKIES.get(GUEST_COOKIE_NAME)

        if guest_token:
            logger.debug("Guest session token: %s", guest_token)
            # Make sure the guest session token exists (it should)
            try:
                with transaction.atomic():
                    session = get_session(guest_token)
                    if not session:
                        raise UserSession.DoesNotExist
                    session.save()  # Update last_used

                request.user = session.user_account
                # Run the function
                response = func(request, *args, **kwargs)
                set_session_cookie(
                    response, GUEST_COOKIE_NAME, session.session_token, True
                )
            except UserSession.DoesNotExist:
                logger.info("Guest session expired. Creating a new guest account...")
                # Check guest creation rate limit
                throttle = GuestAccountCreationThrottle()
                if not throttle.allow_request(request, None):
                    logger.warning(
                        "Guest creation limit (%s) reached.", throttle.get_rate()
                    )
                    return Response(
                        {
                            "error": {
                                "general": [
                                    f"Guest creation limit ({throttle.get_rate()}) reached. Make sure cookies are enabled for this site, and try again later."
                                ]
                            }
                        },
                        status=429,
                    )
                # Create a new guest user
                try:
                    with transaction.atomic():
                        guest_account = UserAccount.objects.create(is_guest=True)
                        new_session_token = str(uuid.uuid4())
                        guest_session = UserSession.objects.create(
                            session_token=new_session_token,
                            user_account=guest_account,
                            is_extended=True,
                        )
                    logger.debug(
                        "New guest session token: %s", guest_session.session_token
                    )

                    request.user = guest_account
                    # Run the function
                    response = func(request, *args, **kwargs)
                    set_session_cookie(
                        response,
                        GUEST_COOKIE_NAME,
                        guest_session.session_token,
                        True,
                    )
                except DatabaseError as e:
                    logger.db_error(e)
                    return GENERIC_ERR_RESPONSE
                except Exception as e:
                    logger.error(e)
                    return GENERIC_ERR_RESPONSE
            except Exception as e:
                logger.error(e)
                return GENERIC_ERR_RESPONSE
        else:
            # Check guest creation rate limit
            throttle = GuestAccountCreationThrottle()
            if not throttle.allow_request(request, None):
                logger.warning(
                    "Guest creation limit (%s) reached.", throttle.get_rate()
                )
                return Response(
                    {
                        "error": {
                            "general": [
                                f"Guest creation limit ({throttle.get_rate()}) reached. Make sure cookies are enabled for this site, and try again later."
                            ]
                        }
                    },
                    status=429,
                )
            # Create a guest user with an extended session
            try:
                with transaction.atomic():
                    guest_account = UserAccount.objects.create(is_guest=True)
                    new_session_token = str(uuid.uuid4())
                    guest_session = UserSession.objects.create(
                        session_token=new_session_token,
                        user_account=guest_account,
                        is_extended=True,
                    )
                logger.debug("New guest session token: %s", guest_session.session_token)

                request.user = guest_account
                # Run the function
                response = func(request, *args, **kwargs)
                set_session_cookie(
                    response,
                    GUEST_COOKIE_NAME,
                    guest_session.session_token,
                    True,
                )
            except DatabaseError as e:
                logger.db_error(e)
                return GENERIC_ERR_RESPONSE
            except Exception as e:
                logger.error(e)
                return GENERIC_ERR_RESPONSE

        # Make sure to return a message if the account session expired
        if acct_sess_expired:
            SESS_EXP_MSG = "Account session expired."
            if "message" in response.data:
                response.data["message"].append(SESS_EXP_MSG)
            else:
                response.data["message"] = [SESS_EXP_MSG]
            delete_session_cookie(response, ACCOUNT_COOKIE_NAME)
        return response

    get_metadata(wrapper).min_auth_required = "Guest"
    return wrapper


def require_account_auth(func):
    """
    A decorator to check if the user is authenticated **strictly with an account** based
    on their cookies.

    If the user is not authenticated, an error message will be returned.

    The `user` object is made available in the `request` argument after authentication.

    If authenticated, this refreshes the session token cookie with the response.
    """

    @functools.wraps(func)
    def wrapper(request, *args, **kwargs):
        acct_token = request.COOKIES.get(ACCOUNT_COOKIE_NAME)
        logger.debug("Account session token: %s", acct_token)

        BAD_AUTH_RESPONSE = Response(
            {"error": {"general": ["Account required."]}}, status=401
        )

        if acct_token:
            try:
                with transaction.atomic():
                    session = get_session(acct_token)
                    if not session:
                        raise UserSession.DoesNotExist
                    session.save()  # To update last_used to now

                # At this point the account is authenticated
                request.user = session.user_account

                response = func(request, *args, **kwargs)
                # Intercept the response to refresh the session token cookie
                set_session_cookie(
                    response,
                    ACCOUNT_COOKIE_NAME,
                    session.session_token,
                    session.is_extended,
                )
                return response
            except UserSession.DoesNotExist:
                logger.info("Account session expired.")
                return BAD_AUTH_RESPONSE
            except DatabaseError as e:
                logger.db_error(e)
                return GENERIC_ERR_RESPONSE
            except Exception as e:
                logger.error(e)
                return GENERIC_ERR_RESPONSE
        else:
            return BAD_AUTH_RESPONSE

    get_metadata(wrapper).min_auth_required = "User Account"
    return wrapper
