# notes/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import NoteViewSet, NoteVersionViewSet

router = DefaultRouter()
router.register(r'notes', NoteViewSet)
router.register(r'note-versions', NoteVersionViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
