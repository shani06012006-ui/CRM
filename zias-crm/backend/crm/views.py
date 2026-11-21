#backend/crm/views.py

from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Lead
from .serializers import LeadSerializer
from django.db.models import Sum

class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Lead.objects.filter(owner=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        leads = Lead.objects.filter(owner=request.user)
        
        total_leads = leads.count()
        open_deals = leads.exclude(status='Closed').count()
        revenue = leads.filter(status='Closed').aggregate(Sum('value'))['value__sum'] or 0
        conversion_rate = (leads.filter(status='Closed').count() / total_leads * 100) if total_leads > 0 else 0

        return Response({
            'totalLeads': total_leads,
            'openDeals': open_deals,
            'revenue': float(revenue),
            'conversionRate': round(conversion_rate, 1)
        })