import functools
import logging
import uuid
from dataclasses import dataclass

import requests
from django.db import DatabaseError, transaction
from rest_framework import serializers
from rest_framework.decorators import api_view
from rest_framework.exceptions import ParseError
from rest_framework.response import Response

from api.models import UserAccount, UserSession
from api.settings import (
    ACCOUNT_COOKIE_NAME,
    CF_TURNSTILE_SECRET_KEY,
    CF_TURNSTILE_VERIFY_URL,
    GUEST_COOKIE_NAME,
    ThrottleScopes,
)
from api.utils import (
    RateLimitError,
    check_rate_limit,
    delete_session_cookie,
    generic_error_response,
    get_client_ip_address,
    get_metadata,
    get_session,
    set_session_cookie,
    update_session_metadata,
)

logger = logging.getLogger("api")


def api_endpoint(method):
    """
    Defines an API endpoint that uses a single method type.

    **This must be the outer-most decorator for the view function to work properly.**
    """

    def decorator(func):
        # Wrap the function to catch unhandled exceptions
        @functools.wraps(func)
        def wrapper(request, *args, **kwargs):
            try:
                # Currently disabled global rate limit until the auth logic is cleaned up
                # check_rate_limit(request, ThrottleScopes.GLOBAL)
                return func(request, *args, **kwargs)
            except RateLimitError as e:
                return e.response
            except DatabaseError as e:
                logger.db_error(e)
                return generic_error_response()
            except Exception as e:
                logger.error(e)
                return generic_error_response()

        drf_view = api_view([method])(wrapper)
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


@dataclass
class AuthResult:
    """
    The outcome of checking a request's session cookies.
    """

    session: UserSession | None = None
    # The name of the cookie that holds the session's token, to refresh it later
    cookie_name: str | None = None
    # Whether an account session token was sent but is no longer valid
    account_expired: bool = False


def _touch_session(request, token):
    """
    Returns the valid session for a token, updating its metadata, or `None` if the session
    doesn't exist or has expired.
    """
    session = get_session(token)
    if session:
        update_session_metadata(request, session)
    return session


def authenticate(request, allow_guest=True):
    """
    Finds the session for a request from its cookies, checking the account session first
    and falling back to the guest session if `allow_guest` is true.

    This does NOT create a guest account, or make the user available on the request.
    """
    acct_token = request.COOKIES.get(ACCOUNT_COOKIE_NAME)
    if acct_token:
        logger.debug("Account session token: %s", acct_token)
        session = _touch_session(request, acct_token)
        if session:
            return AuthResult(session, ACCOUNT_COOKIE_NAME)
        logger.info("Account session expired.")

    # At this point the account session either expired or did not exist
    result = AuthResult(account_expired=bool(acct_token))
    if not allow_guest:
        return result

    guest_token = request.COOKIES.get(GUEST_COOKIE_NAME)
    if guest_token:
        logger.debug("Guest session token: %s", guest_token)
        session = _touch_session(request, guest_token)
        if session:
            result.session = session
            result.cookie_name = GUEST_COOKIE_NAME
        else:
            logger.info("Guest session expired.")
    return result


def create_guest_session(request):
    """
    Creates a new guest account with an extended session, subject to the guest account
    creation rate limit.
    """
    check_rate_limit(request, ThrottleScopes.GUEST_ACCOUNT_CREATION)
    with transaction.atomic():
        guest_account = UserAccount.objects.create(is_guest=True)
        guest_session = UserSession.objects.create(
            session_token=str(uuid.uuid4()),
            user_account=guest_account,
            is_extended=True,
        )
    logger.debug("New guest session token: %s", guest_session.session_token)
    return guest_session


def finalize_auth_response(response, auth: AuthResult):
    """
    Refreshes the session token cookie on the response, and if the account session
    expired, deletes its cookie and adds a message saying so.
    """
    if auth.session:
        set_session_cookie(
            response,
            auth.cookie_name,
            auth.session.session_token,
            auth.session.is_extended,
        )
    if auth.account_expired:
        response.data.setdefault("message", []).append("Account session expired.")
        delete_session_cookie(response, ACCOUNT_COOKIE_NAME)
    return response


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
        auth = authenticate(request)
        request.user = auth.session.user_account if auth.session else None
        response = func(request, *args, **kwargs)
        return finalize_auth_response(response, auth)

    return wrapper


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
        auth = authenticate(request)
        if not auth.session:
            logger.info("Creating a new guest account...")
            auth.session = create_guest_session(request)
            auth.cookie_name = GUEST_COOKIE_NAME
        request.user = auth.session.user_account
        response = func(request, *args, **kwargs)
        return finalize_auth_response(response, auth)

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
        auth = authenticate(request, allow_guest=False)
        if not auth.session:
            return Response({"error": {"general": ["Account required."]}}, status=401)
        request.user = auth.session.user_account
        response = func(request, *args, **kwargs)
        return finalize_auth_response(response, auth)

    get_metadata(wrapper).min_auth_required = "User Account"
    return wrapper


def fix_choice_field_errors(serializer):
    errors = serializer.errors
    # Check if there are any ChoiceFields with invalid choices
    choice_field_errors = [
        field_name
        for field_name in errors
        if isinstance(serializer.fields[field_name], serializers.ChoiceField)
        and any("is not a valid choice" in err for err in serializer.errors[field_name])
    ]
    # Change the error message to say the valid values
    for choice_field in choice_field_errors:
        valid_values = serializer.fields[choice_field].choices
        errors[choice_field] = [
            f"Invalid value. Valid values are: {', '.join(valid_values)}"
        ]
    return errors


def validate_json_input(serializer_class):
    """
    A decorator to validate JSON input data for a view function.

    The `serializer_class` is used to validate the request data.
    """

    def decorator(func):
        @functools.wraps(func)
        def wrapper(request, *args, **kwargs):
            if request.content_type != "application/json":
                return Response(
                    {"error": {"general": ["Request body must be JSON."]}},
                    status=415,
                )
            try:
                serializer = serializer_class(data=request.data)
            except ParseError:
                return Response(
                    {"error": {"general": ["Invalid JSON."]}},
                    status=400,
                )
            if not serializer.is_valid():
                errors = fix_choice_field_errors(serializer)
                return Response({"error": errors}, status=400)
            request.validated_data = serializer.validated_data
            return func(request, *args, **kwargs)

        metadata = get_metadata(wrapper)
        metadata.input_type = "JSON Body"
        metadata.input_serializer_class = serializer_class
        return wrapper

    return decorator


def validate_query_param_input(serializer_class):
    """
    A decorator to validate query parameters for a view function.

    The `serializer_class` is used to validate the query parameters.
    """

    def decorator(func):
        @functools.wraps(func)
        def wrapper(request, *args, **kwargs):
            # Parse the query parameters into a dictionary
            # This allows for both single and multiple values for the same key
            query_dict = {}
            for key in request.query_params:
                value = request.query_params.getlist(key)
                if isinstance(value, list):
                    if len(value) == 1:
                        query_dict[key] = value[0]
                    else:
                        query_dict[key] = value
                elif isinstance(value, str):
                    query_dict[key] = value

            serializer = serializer_class(data=query_dict)
            if not serializer.is_valid():
                errors = fix_choice_field_errors(serializer)
                return Response({"error": errors}, status=400)
            request.validated_data = serializer.validated_data
            return func(request, *args, **kwargs)

        metadata = get_metadata(wrapper)
        metadata.input_type = "Query Parameters"
        metadata.input_serializer_class = serializer_class
        return wrapper

    return decorator


def validate_error_format(data, input_serializer_class):
    """
    A helper function to make sure that error messages are returned in whatever crazy
    format I decided to use for this project.

    Expected format:
    ```
    {
        "error": {
            "general/[input serializer field name]": [
                "Error message",
                ...
            ],
            ...
        }
    }
    ```
    """

    def log_error_msg_error(message):
        logger.error("Error message validation error: %s", message)

    if not isinstance(data, dict):
        log_error_msg_error("Response must be a dictionary.")

    if "error" not in data or not isinstance(data["error"], dict):
        log_error_msg_error("Response must contain an 'error' dictionary.")

    if input_serializer_class:
        for field_name, value in data["error"].items():
            if field_name not in input_serializer_class().fields:
                if field_name != "general":
                    log_error_msg_error(
                        f"{field_name} must be a field name from the input serializer."
                    )
            if not isinstance(value, list):
                log_error_msg_error(f"{field_name} must be a list.")
            if not all(isinstance(item, str) for item in value):
                log_error_msg_error(f"All items in {field_name} must be strings.")
    else:
        for field_name, value in data["error"].items():
            if field_name != "general":
                log_error_msg_error(
                    f"{field_name} must be named 'general' if no input serializer is provided."
                )
            if not isinstance(value, list):
                log_error_msg_error(f"{field_name} must be a list.")


def validate_output(serializer_class):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(request, *args, **kwargs):
            response = func(request, *args, **kwargs)
            if isinstance(response, Response):
                if 200 <= response.status_code < 300:
                    serializer = serializer_class(data=response.data)
                    if serializer.is_valid():
                        response.data = serializer.validated_data
                        return response
                    else:
                        logger.error("Output validation failed: %s", serializer.errors)
                        return generic_error_response()
                else:
                    validate_error_format(
                        response.data, get_metadata(wrapper).input_serializer_class
                    )
                    # If the format is bad, just print errors to the log and move on
                    # We don't want errors causing errors to cause problems in prod
                    return response
            else:
                logger.critical("Response is not a valid Response object.")
                return generic_error_response()

        get_metadata(wrapper).output_serializer_class = serializer_class
        return wrapper

    return decorator


def sse_endpoint(method):
    """
    A decorator just used for documentation on endpoints that use SSE.
    """

    def decorator(func):
        metadata = get_metadata(func)
        metadata.method = method
        func.metadata = metadata
        return func

    return decorator


def require_captcha(func):
    """
    A decorator to check if the request has a valid Cloudflare Turnstile token.

    If the token is invalid, an error response will be returned.
    """

    @functools.wraps(func)
    def wrapper(request, *args, **kwargs):
        client_token = (
            request.data.get("captcha_token")
            if isinstance(request.data, dict)
            else None
        )
        if not client_token:
            return Response(
                {"error": {"general": ["CAPTCHA token is required."]}}, status=400
            )

        # Assemble payload, including client IP if possible for extra security
        payload = {
            "secret": CF_TURNSTILE_SECRET_KEY,
            "response": client_token,
        }
        if client_ip := get_client_ip_address(request):
            payload["remoteip"] = client_ip

        try:
            # Verify the token with Cloudflare Turnstile
            response = requests.post(CF_TURNSTILE_VERIFY_URL, data=payload, timeout=5)
            response.raise_for_status()
            result = response.json()
            if not result.get("success"):
                return Response(
                    {"error": {"general": ["CAPTCHA verification failed."]}}, status=400
                )
        except Exception as e:
            logger.warning("CAPTCHA verification had a problem: %s", e)
            return generic_error_response()

        return func(request, *args, **kwargs)

    get_metadata(wrapper).captcha_required = True
    return wrapper
