import logging
import os
import time
import traceback
from pathlib import Path
from urllib.parse import urlparse

import environ
from celery.schedules import crontab
from django.core.mail import send_mail
from rest_framework.response import Response

from api.logging import FancyFormatter

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

environ.Env.read_env(BASE_DIR / ".env")
env = environ.Env()

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

SECRET_KEY = env("SECRET_KEY")

DEBUG = env.bool("DEBUG", default=False)
TEST_ENVIRONMENT = env("TEST_ENVIRONMENT", default="")
if DEBUG and (TEST_ENVIRONMENT not in ["Local", "Codespaces"]):
    raise ValueError(
        "DEBUG is True but TEST_ENVIRONMENT is not set to Local or Codespaces."
    )

BASE_URL = env("BASE_URL")
API_URL = env("API_URL")
COOKIE_DOMAIN = None if DEBUG else env("COOKIE_DOMAIN")

# Application definition

INSTALLED_APPS = [
    "django.contrib.contenttypes",
    "django.contrib.auth",
    "api",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "corsheaders.middleware.CorsMiddleware",
]

# CORS, CSRF, and allowed hosts settings
CORS_ALLOW_ALL_ORIGINS = True if DEBUG else False
CORS_ALLOWED_ORIGINS = [BASE_URL, "http://localhost"]
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = [BASE_URL, "http://localhost"]
CSRF_COOKIE_DOMAIN = COOKIE_DOMAIN
ALLOWED_HOSTS = ["*"] if DEBUG else [urlparse(API_URL).hostname, "localhost"]

ROOT_URLCONF = "api.urls"

WSGI_APPLICATION = "api.wsgi.application"


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": env("DB_NAME"),
        "USER": env("DB_USER"),
        "PASSWORD": env("DB_PASSWORD"),
        "HOST": env("DB_HOST"),
        "PORT": env("DB_PORT"),
        "CONN_MAX_AGE": 0 if DEBUG else 600,  # Don't persist connections in development
    }
}

# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = "en-us"

TIME_ZONE = "UTC"

USE_TZ = False


# Throttle scope classes for consistent rate limit handling
class ThrottleScope:
    def __init__(self, key, limited_action):
        self.key = key
        self.message = limited_action + " limit reached ({rate}). Try again later."


# Defining all scopes as object constants
class ThrottleScopes:
    GLOBAL = ThrottleScope("global", "Rate")
    USER_ACCOUNT_CREATION = ThrottleScope(
        "user_account_creation", "User account creation"
    )
    RESEND_EMAIL = ThrottleScope("resend_email", "Email resend")
    GUEST_ACCOUNT_CREATION = ThrottleScope(
        "guest_account_creation", "Guest account creation"
    )
    LOGIN = ThrottleScope("login", "Login")
    PASSWORD_RESET = ThrottleScope("password_reset", "Password reset")
    EVENT_CREATION = ThrottleScope("event_creation", "Event creation")
    AVAILABILITY_ADD = ThrottleScope("availability_add", "Availability submission")
    CODE_CHECK = ThrottleScope("code_check", "Verification code checking")


REST_FRAMEWORK = {
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [],
    "DEFAULT_THROTTLE_RATES": {
        ThrottleScopes.GLOBAL.key: "300/min",
        ThrottleScopes.USER_ACCOUNT_CREATION.key: "10/hour",
        ThrottleScopes.RESEND_EMAIL.key: "20/hour",
        ThrottleScopes.GUEST_ACCOUNT_CREATION.key: "10/min",
        ThrottleScopes.LOGIN.key: "30/hour",
        ThrottleScopes.PASSWORD_RESET.key: "10/hour",
        ThrottleScopes.EVENT_CREATION.key: "25/hour",
        ThrottleScopes.AVAILABILITY_ADD.key: "50/hour",
        ThrottleScopes.CODE_CHECK.key: "50/hour",
    },
}

SESS_EXP_SECONDS = 3600  # 1 hour

LONG_SESS_EXP_SECONDS = 31536000  # 1 year

EMAIL_CODE_EXP_SECONDS = 600  # 10 minutes

PWD_RESET_EXP_SECONDS = 600  # 10 minutes

AUTHED_PWD_RESET_EXP_SECONDS = 600  # 10 minutes

URL_CODE_EXP_SECONDS = 1209600  # 14 days

ACCOUNT_COOKIE_NAME = "account_sess_token"
GUEST_COOKIE_NAME = "guest_sess_token"

GENERIC_ERR_RESPONSE = Response(
    {"error": {"general": ["An unknown error has occurred."]}}, status=500
)

# AWS SES Credentials
EMAIL_BACKEND = "django_ses.SESBackend"
AWS_SES_ACCESS_KEY_ID = env("AWS_SES_ACCESS_KEY_ID")
AWS_SES_SECRET_ACCESS_KEY = env("AWS_SES_SECRET_ACCESS_KEY")
AWS_SES_REGION_NAME = env("AWS_SES_REGION_NAME")
AWS_SES_REGION_ENDPOINT = env("AWS_SES_REGION_ENDPOINT")
DEFAULT_FROM_EMAIL = env("DEFAULT_FROM_EMAIL")
ADMIN_EMAILS = env.list("ADMIN_EMAILS", default=[])
SEND_EMAILS = env.bool("SEND_EMAILS", default=False)
CRITICAL_EMAIL_INTERVAL_SECONDS = 1800  # 30 minutes

# Automated tasks
CELERY_BEAT_SCHEDULE = {
    "daily_duties": {
        "task": "api.tasks.daily_duties",
        "schedule": crontab(hour=0, minute=0),  # Every day at midnight
    },
}
CELERY_BROKER_URL = "redis://localhost:6379/0"

# Live updates
LIVE_UPDATES_URL = "redis://localhost:6379/1"
LIVE_UPDATES_HEARTBEAT_SECONDS = 2
MAX_LIVE_CONNECTIONS_EVENT = 25
MAX_LIVE_CONNECTIONS_GLOBAL = 500
REDIS_SYNC_POOL_SIZE = 20  # For publishing updates, which is fast and a one-off
REDIS_ASYNC_POOL_SIZE = 500  # For subscribing to updates, which holds a connection open

LOG_DIR = env("LOG_DIR")
os.makedirs(LOG_DIR, exist_ok=True)  # Make the log directory if it doesn't exist
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{levelname:<8} {asctime}] {module:<12} {funcName:<25} {message}",
            "style": "{",
        },
        "simple": {
            "()": FancyFormatter,
            "format": "[{levelname:<8} {asctime}] {message}",
            "datefmt": "%H:%M:%S",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "simple",
            "level": "DEBUG" if DEBUG else "WARNING",
        },
        "file": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": f"{LOG_DIR}/django.log",
            "formatter": "verbose",
            "level": "DEBUG",
            "maxBytes": 1024 * 1024 * 5,  # 5 MB
            "backupCount": 5,
        },
    },
    "loggers": {
        "django": {
            "handlers": ["console", "file"],
            "level": "INFO",
            "propagate": True,
        },
        "api": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": False,
        },
    },
}


# Custom logger just to add some of my own custom logging functions
# We love DRY!!!
class PlancakeLogger(logging.Logger):
    _last_email_time = 0

    def db_error(self, msg, *args, **kwargs):
        self.error("Database error: %s", msg, *args, **kwargs)

    def critical(self, msg, *args, **kwargs):
        super().critical(msg, *args, **kwargs)

        # Send an email to admins
        if SEND_EMAILS:
            now = time.time()
            if now - self._last_email_time > CRITICAL_EMAIL_INTERVAL_SECONDS:
                stack_trace = "".join(traceback.format_stack())
                try:
                    send_mail(
                        subject=f"Plancake - Critical Error",
                        message=f"A critical error occurred in the application: {msg}\n\nStack Trace:\n{stack_trace}",
                        from_email=DEFAULT_FROM_EMAIL,
                        recipient_list=ADMIN_EMAILS,
                        fail_silently=False,
                    )
                    self._last_email_time = now
                except Exception as e:
                    self.error("Failed to send critical error email: %s", e)


# Now any logger in the project will have access to this class
logging.setLoggerClass(PlancakeLogger)

RAND_URL_CODE_LENGTH = 8

RAND_URL_CODE_ATTEMPTS = 4

MAX_EVENT_DAYS = 64
