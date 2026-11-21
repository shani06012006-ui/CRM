#backend/crm/models.py

from django.db import models
from django.contrib.auth.models import User

class Lead(models.Model):
    STATUS_CHOICES = [
        ('New', 'New'),
        ('Qualified', 'Qualified'),
        ('Proposal', 'Proposal'),
        ('Negotiation', 'Negotiation'),
        ('Closed', 'Closed'),
    ]
    name = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='New')
    value = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)

    def __str__(self):
        return self.name