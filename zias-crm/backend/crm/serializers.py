import re

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password as django_validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from rest_framework import serializers

from .models import Customer

User = get_user_model()
PHONE_PATTERN = re.compile(r"[+\d\s()-]{7,}")


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = ["id", "name", "email", "phone", "company", "status", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_phone(self, value: str) -> str:
        if not PHONE_PATTERN.fullmatch(value):
            raise serializers.ValidationError("Enter a valid phone number")
        return value


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True)

    def validate_username(self, value: str) -> str:
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists")
        return value

    def validate_password(self, value: str) -> str:
        try:
            django_validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(exc.messages)
        return value

    def create(self, validated_data: dict) -> User:
        return User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
        )
