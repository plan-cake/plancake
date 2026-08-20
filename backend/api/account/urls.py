from django.urls import path

from . import views

urlpatterns = [
    path("set-default-name/", views.set_default_name),
    path("remove-default-name/", views.remove_default_name),
    path("active-sessions/", views.get_active_sessions),
    path("terminate-session/", views.terminate_session),
    path("prune-sessions/", views.prune_sessions),
    path("change-password/", views.change_password),
    path("delete-account/", views.delete_account),
]
