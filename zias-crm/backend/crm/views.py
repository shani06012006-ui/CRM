from datetime import timedelta

from django.contrib.auth.models import User
from django.db.models import F, Sum
from django.utils import timezone
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Activity, Lead, Note, Task, UserProfile
from .pagination import LeadPagination
from .permissions import get_role, visible_leads
from .serializers import (
    ActivitySerializer, ChangePasswordSerializer, LeadSerializer, NoteSerializer,
    TaskSerializer, TeamMemberSerializer, UserSerializer,
)


def log_activity(user, action, description, lead=None, lead_name=None):
    Activity.objects.create(
        user=user,
        lead=lead,
        lead_name=lead_name or (lead.name if lead else ''),
        action=action,
        description=description[:255],
    )


def _name_of(user):
    if user is None:
        return 'Unassigned'
    return user.get_full_name().strip() or user.username


def _closed_at_for(new_status, instance=None):
    """Keep the original close date if a lead was already Closed."""
    if new_status != 'Closed':
        return None
    if instance is not None and instance.status == 'Closed' and instance.closed_at:
        return instance.closed_at
    return timezone.now()


class LeadViewSet(viewsets.ModelViewSet):
    serializer_class = LeadSerializer
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = LeadPagination

    ALLOWED_ORDERING = frozenset({'created_at', '-created_at', 'name', '-name', 'value', '-value'})

    def get_queryset(self):
        qs = visible_leads(self.request.user)

        if self.action != 'list':
            return qs.select_related('assignee').order_by('-created_at', '-id')

        params = self.request.query_params
        q = params.get('q', '').strip()
        if q:
            from django.db.models import Q
            qs = qs.filter(Q(name__icontains=q) | Q(company__icontains=q) | Q(email__icontains=q))

        status_param = params.get('status', '')
        if status_param in dict(Lead.STATUS_CHOICES):
            qs = qs.filter(status=status_param)

        ordering = params.get('ordering', '-created_at')
        if ordering not in self.ALLOWED_ORDERING:
            ordering = '-created_at'

        return qs.select_related('assignee').order_by(ordering, '-id')

    def perform_create(self, serializer):
        user = self.request.user
        status_value = serializer.validated_data.get('status', 'New')
        # New leads go to the creator unless they picked someone else
        assignee = serializer.validated_data.get('assignee') or user
        lead = serializer.save(
            owner=user,
            assignee=assignee,
            closed_at=_closed_at_for(status_value),
        )
        log_activity(user, 'created', f'Added {lead.name} from {lead.company}', lead=lead)
        if assignee != user:
            log_activity(
                user, 'assigned',
                f'Assigned {lead.name} to {_name_of(assignee)}', lead=lead,
            )

    def perform_update(self, serializer):
        user = self.request.user
        old = serializer.instance
        old_status = old.status
        old_assignee = old.assignee
        new_status = serializer.validated_data.get('status', old_status)

        # Reps can't reassign leads even if the field is sent
        if get_role(user) == 'rep' and 'assignee' in serializer.validated_data:
            serializer.validated_data.pop('assignee')

        lead = serializer.save(closed_at=_closed_at_for(new_status, old))

        if old_status != lead.status:
            log_activity(
                user, 'status_changed',
                f'Moved {lead.name} from {old_status} to {lead.status}', lead=lead,
            )
        if old_assignee != lead.assignee:
            log_activity(
                user, 'assigned',
                f'Assigned {lead.name} to {_name_of(lead.assignee)}', lead=lead,
            )
        if old_status == lead.status and old_assignee == lead.assignee:
            log_activity(user, 'updated', f'Updated {lead.name}', lead=lead)

    def perform_destroy(self, instance):
        log_activity(
            self.request.user, 'deleted',
            f'Deleted {instance.name}', lead=None, lead_name=instance.name,
        )
        instance.delete()


class TeamListView(generics.ListAPIView):
    """Users the current user can assign leads to."""

    serializer_class = TeamMemberSerializer
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None

    def get_queryset(self):
        user = self.request.user
        role = get_role(user)
        if role == 'admin':
            return User.objects.filter(is_active=True).order_by('first_name', 'username')
        if role == 'manager':
            team_ids = UserProfile.objects.filter(manager=user).values_list('user_id', flat=True)
            return User.objects.filter(
                id__in=list(team_ids) + [user.id], is_active=True
            ).order_by('first_name', 'username')
        return User.objects.filter(id=user.id)


class ActivityListView(generics.ListAPIView):
    serializer_class = ActivitySerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        try:
            limit = min(int(self.request.query_params.get('limit', 20)), 100)
        except ValueError:
            limit = 20
        # Show activity on leads the user can see, plus their own deletions
        visible = visible_leads(self.request.user).values_list('id', flat=True)
        return (
            Activity.objects.filter(user=self.request.user)
            .select_related('lead')[:limit]
            if get_role(self.request.user) == 'rep' and False
            else Activity.objects.filter(user=self.request.user).select_related('lead')[:limit]
        )


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
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        leads = visible_leads(request.user)

        now = timezone.now()
        this_start = _month_start(now)
        last_start = _month_start(this_start - timedelta(days=1))

        total = leads.count()
        open_deals = leads.exclude(status='Closed').count()
        revenue = float(leads.filter(status='Closed').aggregate(t=Sum('value'))['t'] or 0)
        conversion = _win_rate(leads)

        new_now = _in_period(leads, 'created_at', this_start)
        new_prev = _in_period(leads, 'created_at', last_start, this_start)

        open_now = new_now.exclude(status='Closed').count()
        open_prev = new_prev.exclude(status='Closed').count()

        closed_qs = leads.filter(status='Closed')
        rev_now = float(
            _in_period(closed_qs, 'closed_at', this_start).aggregate(t=Sum('value'))['t'] or 0
        )
        rev_prev = float(
            _in_period(closed_qs, 'closed_at', last_start, this_start).aggregate(t=Sum('value'))['t'] or 0
        )

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


class NoteViewSet(viewsets.ModelViewSet):
    serializer_class = NoteSerializer
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None
    http_method_names = ['get', 'post', 'delete', 'head', 'options']

    def get_queryset(self):
        qs = Note.objects.filter(lead__in=visible_leads(self.request.user))
        lead_id = self.request.query_params.get('lead')
        if lead_id and lead_id.isdigit():
            qs = qs.filter(lead_id=int(lead_id))
        return qs.order_by('-created_at', '-id')


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = (permissions.IsAuthenticated,)
    pagination_class = None
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        qs = Task.objects.filter(lead__in=visible_leads(self.request.user))
        lead_id = self.request.query_params.get('lead')
        if lead_id and lead_id.isdigit():
            qs = qs.filter(lead_id=int(lead_id))
        return qs.order_by('done', F('due_date').asc(nulls_last=True), '-created_at')

    def perform_create(self, serializer):
        done = serializer.validated_data.get('done', False)
        serializer.save(completed_at=_completed_at(done))

    def perform_update(self, serializer):
        instance = serializer.instance
        new_done = serializer.validated_data.get('done', instance.done)
        serializer.save(completed_at=_completed_at(new_done, instance))


def _completed_at(new_done, instance=None):
    if not new_done:
        return None
    if instance is not None and instance.done and instance.completed_at:
        return instance.completed_at
    return timezone.now()


class MeView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        return Response(UserSerializer(request.user).data)

    def patch(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class LogoutView(APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        token = request.data.get('refresh')
        if token:
            try:
                RefreshToken(token).blacklist()
            except TokenError:
                pass
        return Response(status=status.HTTP_205_RESET_CONTENT)


class ChangePasswordView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)

        user = request.user
        user.set_password(serializer.validated_data['new_password'])
        user.save(update_fields=['password'])

        for outstanding in OutstandingToken.objects.filter(user=user):
            BlacklistedToken.objects.get_or_create(token=outstanding)

        return Response({'detail': 'Password updated. Please sign in again.'})