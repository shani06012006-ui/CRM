from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Activity, Lead


class LeadSerializer(serializers.ModelSerializer):
    value = serializers.DecimalField(
        max_digits=10, decimal_places=2, coerce_to_string=False, min_value=0
    )

    class Meta:
        model = Lead
        fields = [
            'id', 'name', 'company', 'email', 'phone', 'status',
            'value', 'created_at', 'closed_at', 'owner',
        ]
        read_only_fields = ('id', 'owner', 'created_at', 'closed_at')


class ActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Activity
        fields = ['id', 'action', 'description', 'lead_name', 'lead', 'created_at']


class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email', 'name', 'role']
        read_only_fields = ('id', 'username')

    def get_name(self, obj):
        return obj.get_full_name().strip() or obj.username

    def get_role(self, obj):
        return 'Admin' if obj.is_superuser else 'Member'