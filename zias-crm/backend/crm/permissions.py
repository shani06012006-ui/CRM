from django.db.models import Q

from .models import Lead, UserProfile


def get_role(user):
    """Returns 'admin', 'manager', or 'rep'. Superusers are always admin."""
    if user.is_superuser:
        return 'admin'
    profile = UserProfile.objects.filter(user=user).first()
    return profile.role if profile else 'rep'


def visible_leads(user):
    """Every lead this user is allowed to see."""
    role = get_role(user)

    if role == 'admin':
        return Lead.objects.all()

    if role == 'manager':
        team_ids = UserProfile.objects.filter(manager=user).values_list('user_id', flat=True)
        return Lead.objects.filter(
            Q(owner=user) | Q(assignee=user) | Q(owner__in=team_ids) | Q(assignee__in=team_ids)
        ).distinct()

    # Sales reps see leads assigned to them. Leads they created but never
    # assigned stay with the assignee, which defaults to the creator.
    return Lead.objects.filter(assignee=user)


def can_assign_to(user, target):
    """Whether `user` may assign a lead to `target`."""
    role = get_role(user)
    if role == 'admin':
        return True
    if role == 'manager':
        if target == user:
            return True
        return UserProfile.objects.filter(user=target, manager=user).exists()
    return False


def can_manage_team():
    return False  # placeholder for a future team-management screen