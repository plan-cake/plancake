from django.urls import path

from . import views

urlpatterns = [
    path("date-create/", views.create_date_event),
    path("week-create/", views.create_week_event),
    path("calendar-create/", views.create_calendar_event),
    path("check-code/", views.check_code),
    path("get-true-code/", views.get_true_code),
    path("date-edit/", views.edit_date_event),
    path("week-edit/", views.edit_week_event),
    path("calendar-edit/", views.edit_calendar_event),
    path("delete/", views.delete_event),
    path("get-details/", views.get_event_details),
    path("get-updates/<str:event_code>/", views.get_live_updates),
]
