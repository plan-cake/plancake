from django.urls import path

from . import views

urlpatterns = [
    path("get-summary/", views.get_summary),
]
