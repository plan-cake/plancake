from django.urls import path

from . import views

urlpatterns = [
    path("set-default-name/", views.set_default_name),
    path("remove-default-name/", views.remove_default_name),
    path("active-sessions/", views.get_active_sessions),
    path("terminate-session/", views.terminate_session),
    path("change-password/", views.change_password),
    path("start-authed-password-reset/", views.start_authed_password_reset),
    path("check-authed-password-reset-code/", views.check_authed_password_reset_code),
    path("authed-password-reset/", views.authed_password_reset),
    path("delete-account/", views.delete_account),
]
