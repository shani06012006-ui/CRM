#backend/crm/urls.py


from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import LeadViewSet, DashboardStatsView, MeView

router = DefaultRouter()
router.register(r'leads', LeadViewSet, basename='leads')

urlpatterns = [
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/me/', MeView.as_view(), name='me'),
    path('stats/', DashboardStatsView.as_view(), name='dashboard-stats'),
    path('', include(router.urls)),
]