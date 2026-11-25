from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    ActivityListView, ChangePasswordView, DashboardStatsView, LeadViewSet,
    LogoutView, MeView, NoteViewSet, TaskViewSet, TeamListView,
)

router = DefaultRouter()
router.register(r'leads', LeadViewSet, basename='leads')
router.register(r'notes', NoteViewSet, basename='notes')
router.register(r'tasks', TaskViewSet, basename='tasks')

urlpatterns = [
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    path('auth/me/', MeView.as_view(), name='me'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('team/', TeamListView.as_view(), name='team'),
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('activity/', ActivityListView.as_view(), name='activity'),
    path('', include(router.urls)),
]