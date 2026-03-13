import logging

from rest_framework.decorators import api_view

from backend.api.utils import get_metadata

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
