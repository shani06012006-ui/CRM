from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import Activity, Lead, Note, Task, UserProfile
from .permissions import can_assign_to, get_role, visible_leads


def get_profile(user):
    """Returns the user's profile, creating it on first access.
    Superusers default to Admin, everyone else to Sales rep."""
    default_role = 'admin' if user.is_superuser else 'rep'
    profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'role': default_role})
    return profile


class OwnedLeadField(serializers.PrimaryKeyRelatedField):
    """Only accepts leads the logged-in user can see."""

    def get_queryset(self):
        request = self.context.get('request')
        if request is None:
            return Lead.objects.none()
        return visible_leads(request.user)


class AssigneeField(serializers.PrimaryKeyRelatedField):
    """Only accepts users the logged-in user is allowed to assign to."""

    def __init__(self, **kwargs):
        kwargs.setdefault('queryset', User.objects.all())
        kwargs.setdefault('allow_null', True)
        kwargs.setdefault('required', False)
        super().__init__(**kwargs)

    def to_internal_value(self, data):
        obj = super().to_internal_value(data)
        request = self.context.get('request')
        if request and not can_assign_to(request.user, obj):
            raise serializers.ValidationError('You cannot assign leads to this person.')
        return obj


class AssigneeSummarySerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name']

    def get_name(self, obj):
        return obj.get_full_name().strip() or obj.username


class LeadSerializer(serializers.ModelSerializer):
    value = serializers.DecimalField(
        max_digits=10, decimal_places=2, coerce_to_string=False, min_value=0
    )
    assignee = AssigneeField()
    assignee_name = serializers.SerializerMethodField()

    class Meta:
        model = Lead
        fields = [
            'id', 'name', 'company', 'email', 'phone', 'status',
            'value', 'created_at', 'closed_at', 'owner', 'assignee', 'assignee_name',
        ]
        read_only_fields = ('id', 'owner', 'created_at', 'closed_at')

    def get_assignee_name(self, obj):
        if not obj.assignee:
            return None
        return obj.assignee.get_full_name().strip() or obj.assignee.username


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'action', 'description', 'lead_name', 'lead', 'created_at']


class NoteSerializer(serializers.ModelSerializer):
    lead = OwnedLeadField()

    class Meta:
        model = Note
        fields = ['id', 'lead', 'kind', 'body', 'created_at']
        read_only_fields = ('id', 'created_at')

    def validate_body(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Write something before saving.')
        if len(value) > 2000:
            raise serializers.ValidationError('Keep entries under 2000 characters.')
        return value


class TaskSerializer(serializers.ModelSerializer):
    lead = OwnedLeadField()

    class Meta:
        model = Task
        fields = ['id', 'lead', 'title', 'due_date', 'done', 'completed_at', 'created_at']
        read_only_fields = ('id', 'completed_at', 'created_at')

    def validate_title(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Give the task a title.')
        return value


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    role_key = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'name', 'role', 'role_key']
        read_only_fields = ('id', 'username')

    def get_name(self, obj):
        return obj.get_full_name().strip() or obj.username

    def get_role(self, obj):
        return get_profile(obj).get_role_display()

    def get_role_key(self, obj):
        return get_role(obj)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError('Your current password is incorrect.')
        return value

    def validate_new_password(self, value):
        user = self.context['request'].user
        try:
            validate_password(value, user=user)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value

    def validate(self, attrs):
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'The passwords do not match.'})
        if attrs['new_password'] == attrs['old_password']:
            raise serializers.ValidationError({'new_password': 'Choose a different password.'})
        return attrs


class TeamMemberSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'role']

    def get_name(self, obj):
        return obj.get_full_name().strip() or obj.username

    def get_role(self, obj):
        return get_profile(obj).get_role_display()