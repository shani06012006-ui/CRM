from django.conf import settings
from django.db import models


class Customer(models.Model):
    class Status(models.TextChoices):
        LEAD = "Lead", "Lead"
        ACTIVE = "Active", "Active"
        INACTIVE = "Inactive", "Inactive"

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="customers",
    )
    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=30)
    company = models.CharField(max_length=120)
    status = models.CharField(max_length=10, choices=Status.choices, default=Status.LEAD)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return self.name
