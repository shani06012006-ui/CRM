from rest_framework import serializers
from .models import Lead

class LeadSerializer(serializers.ModelSerializer):
    value = serializers.DecimalField(max_digits=10, decimal_places=2, coerce_to_string=False)

    class Meta:
        model = Lead
        fields = '__all__'
        read_only_fields = ('owner', 'created_at')