#backend/crm/views.py

from datetime import timedelta

from django.db.models import Sum
from django.utils import timezone
from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Lead
from .serializers import LeadSerializer, UserSerializer


class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Lead.objects.filter(owner=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)


def _percent_change(current, previous):
    if previous == 0:
        return 100.0 if current > 0 else 0.0
    return round((current - previous) / previous * 100, 1)


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        leads = Lead.objects.filter(owner=request.user)
        total = leads.count()
        closed = leads.filter(status='Closed')
        closed_count = closed.count()
        revenue = closed.aggregate(total=Sum('value'))['total'] or 0

        now = timezone.now()
        this_month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        last_month_start = (this_month_start - timedelta(days=1)).replace(
            day=1, hour=0, minute=0, second=0, microsecond=0
        )
        this_month = leads.filter(created_at__gte=this_month_start).count()
        last_month = leads.filter(
            created_at__gte=last_month_start, created_at__lt=this_month_start
        ).count()

        return Response({
            'totalLeads': total,
            'openDeals': leads.exclude(status='Closed').count(),
            'revenue': float(revenue),
            'conversionRate': round(closed_count / total * 100, 1) if total else 0,
            'leadsTrend': _percent_change(this_month, last_month),
            'leadsThisMonth': this_month,
        })


class MeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)