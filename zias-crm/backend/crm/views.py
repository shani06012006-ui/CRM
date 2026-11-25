from datetime import timedelta

from django.db.models import Sum
from django.utils import timezone
from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Activity, Lead
from .serializers import ActivitySerializer, LeadSerializer, UserSerializer


def log_activity(user, action, description, lead=None, lead_name=None):
    Activity.objects.create(
        user=user,
        lead=lead,
        lead_name=lead_name or (lead.name if lead else ''),
        action=action,
        description=description[:255],
    )


def _closed_at_for(new_status, instance=None):
    """Keep the original close date if a lead was already Closed."""
    if new_status != 'Closed':
        return None
    if instance is not None and instance.status == 'Closed' and instance.closed_at:
        return instance.closed_at
    return timezone.now()


class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = LeadSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Lead.objects.filter(owner=self.request.user).order_by('-created_at')

    def perform_create(self, serializer):
        status = serializer.validated_data.get('status', 'New')
        lead = serializer.save(
            owner=self.request.user,
            closed_at=_closed_at_for(status),
        )
        log_activity(
            self.request.user, 'created',
            f'Added {lead.name} from {lead.company}', lead=lead,
        )

    def perform_update(self, serializer):
        old = serializer.instance
        old_status = old.status
        new_status = serializer.validated_data.get('status', old_status)
        lead = serializer.save(closed_at=_closed_at_for(new_status, old))

        if old_status != lead.status:
            log_activity(
                self.request.user, 'status_changed',
                f'Moved {lead.name} from {old_status} to {lead.status}', lead=lead,
            )
        else:
            log_activity(self.request.user, 'updated', f'Updated {lead.name}', lead=lead)

    def perform_destroy(self, instance):
        log_activity(
            self.request.user, 'deleted',
            f'Deleted {instance.name}', lead=None, lead_name=instance.name,
        )
        instance.delete()


class ActivityListView(generics.ListAPIView):
    serializer_class = ActivitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        try:
            limit = min(int(self.request.query_params.get('limit', 20)), 100)
        except ValueError:
            limit = 20
        return Activity.objects.filter(user=self.request.user).select_related('lead')[:limit]


def _month_start(dt):
    return dt.replace(day=1, hour=0, minute=0, second=0, microsecond=0)


def _in_period(qs, field, start, end=None):
    qs = qs.filter(**{f'{field}__gte': start})
    if end is not None:
        qs = qs.filter(**{f'{field}__lt': end})
    return qs


def _percent_change(current, previous):
    if previous == 0:
        return 100.0 if current > 0 else 0.0
    return round((current - previous) / previous * 100, 1)


def _points_change(current, previous):
    return round(current - previous, 1)


def _win_rate(qs):
    count = qs.count()
    if count == 0:
        return 0.0
    return round(qs.filter(status='Closed').count() / count * 100, 1)


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        leads = Lead.objects.filter(owner=request.user)

        now = timezone.now()
        this_start = _month_start(now)
        last_start = _month_start(this_start - timedelta(days=1))

        # Current totals
        total = leads.count()
        open_deals = leads.exclude(status='Closed').count()
        revenue = float(leads.filter(status='Closed').aggregate(t=Sum('value'))['t'] or 0)
        conversion = _win_rate(leads)

        # Leads created this month vs last month
        new_now = _in_period(leads, 'created_at', this_start)
        new_prev = _in_period(leads, 'created_at', last_start, this_start)

        # Open deals created this month vs last month
        open_now = new_now.exclude(status='Closed').count()
        open_prev = new_prev.exclude(status='Closed').count()

        # Revenue from deals closed this month vs last month
        closed_qs = leads.filter(status='Closed')
        rev_now = float(
            _in_period(closed_qs, 'closed_at', this_start).aggregate(t=Sum('value'))['t'] or 0
        )
        rev_prev = float(
            _in_period(closed_qs, 'closed_at', last_start, this_start).aggregate(t=Sum('value'))['t'] or 0
        )

        # Conversion rate of this month's leads vs last month's leads
        conv_now = _win_rate(new_now)
        conv_prev = _win_rate(new_prev)

        return Response({
            'totalLeads': total,
            'openDeals': open_deals,
            'revenue': revenue,
            'conversionRate': conversion,
            'trends': {
                'totalLeads': _percent_change(new_now.count(), new_prev.count()),
                'openDeals': _percent_change(open_now, open_prev),
                'revenue': _percent_change(rev_now, rev_prev),
                'conversionRate': _points_change(conv_now, conv_prev),
            },
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