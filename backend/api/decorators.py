import functools
import logging
import uuid

from django.db import DatabaseError, transaction
from rest_framework import serializers
from rest_framework.decorators import api_view
from rest_framework.exceptions import ParseError
from rest_framework.response import Response

from api.availability.utils import get_weekday_date
from api.models import UserAccount, UserSession
from api.settings import (
    ACCOUNT_COOKIE_NAME,
    GENERIC_ERR_RESPONSE,
    GUEST_COOKIE_NAME,
    ThrottleScopes,
)
from api.utils import (
    RateLimitError,
    check_rate_limit,
    delete_session_cookie,
    get_client_ip_address,
    get_client_user_agent,
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
                return GENERIC_ERR_RESPONSE
            except Exception as e:
                logger.error(e)
                return GENERIC_ERR_RESPONSE

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
        ip_address = get_client_ip_address(request)
        user_agent = get_client_user_agent(request)

        acct_sess_expired = False
        if acct_token:
            logger.debug("Account session token: %s", acct_token)
            try:
                with transaction.atomic():
                    session = get_session(acct_token)
                    if not session:
                        # To break out of the rest of the logic
                        raise UserSession.DoesNotExist

                    # Update the session access info
                    session.ip_address = ip_address
                    session.user_agent_raw = user_agent
                    session.save()  # Also updates last_used

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

                    # Update the session access info
                    session.ip_address = ip_address
                    session.user_agent_raw = user_agent
                    session.save()  # Also updates last_used

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
        ip_address = get_client_ip_address(request)
        user_agent = get_client_user_agent(request)

        acct_sess_expired = False
        if acct_token:
            logger.debug("Account session token: %s", acct_token)
            try:
                with transaction.atomic():
                    session = get_session(acct_token)
                    if not session:
                        # To break out of the rest of the logic
                        raise UserSession.DoesNotExist

                    # Update the session access info
                    session.ip_address = ip_address
                    session.user_agent_raw = user_agent
                    session.save()  # Also updates last_used

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

                    # Update the session access info
                    session.ip_address = ip_address
                    session.user_agent_raw = user_agent
                    session.save()  # Also updates last_used

                request.user = session.user_account
                # Run the function
                response = func(request, *args, **kwargs)
                set_session_cookie(
                    response, GUEST_COOKIE_NAME, session.session_token, True
                )
            except UserSession.DoesNotExist:
                logger.info("Guest session expired. Creating a new guest account...")
                check_rate_limit(request, ThrottleScopes.GUEST_ACCOUNT_CREATION)
                # Create a new guest user
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
        else:
            check_rate_limit(request, ThrottleScopes.GUEST_ACCOUNT_CREATION)
            # Create a guest user with an extended session
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

        ip_address = get_client_ip_address(request)
        user_agent = get_client_user_agent(request)

        BAD_AUTH_RESPONSE = Response(
            {"error": {"general": ["Account required."]}}, status=401
        )

        if acct_token:
            try:
                with transaction.atomic():
                    session = get_session(acct_token)
                    if not session:
                        raise UserSession.DoesNotExist

                    # Update the session access info
                    session.ip_address = ip_address
                    session.user_agent_raw = user_agent
                    session.save()  # Also updates last_used

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
        else:
            return BAD_AUTH_RESPONSE

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
                        return GENERIC_ERR_RESPONSE
                else:
                    validate_error_format(
                        response.data, get_metadata(wrapper).input_serializer_class
                    )
                    # If the format is bad, just print errors to the log and move on
                    # We don't want errors causing errors to cause problems in prod
                    return response
            else:
                logger.critical("Response is not a valid Response object.")
                return GENERIC_ERR_RESPONSE

        get_metadata(wrapper).output_serializer_class = serializer_class
        return wrapper

    return decorator
