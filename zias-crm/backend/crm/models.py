from django.contrib.auth.models import User
from django.db import models


class UserProfile(models.Model):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('manager', 'Manager'),
        ('rep', 'Sales rep'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='rep')
    # The manager this rep reports to. Empty for admins and managers.
    manager = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='team_members',
        limit_choices_to={'profile__role': 'manager'},
    )

    def __str__(self):
        return f'{self.user.username} ({self.get_role_display()})'


class Lead(models.Model):
    STATUS_CHOICES = (
        ('New', 'New'),
        ('Qualified', 'Qualified'),
        ('Proposal', 'Proposal'),
        ('Negotiation', 'Negotiation'),
        ('Closed', 'Closed'),
    )

    name = models.CharField(max_length=255)
    company = models.CharField(max_length=255)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='New')
    value = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    closed_at = models.DateTimeField(null=True, blank=True)
    # Who created the lead
    owner = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, blank=True, related_name='owned_leads',
    )
    # Who is currently working the lead. Defaults to the owner.
    assignee = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_leads',
    )

    def __str__(self):
        return self.name


class Activity(models.Model):
    ACTION_CHOICES = (
        ('created', 'Created'),
        ('updated', 'Updated'),
        ('status_changed', 'Status changed'),
        ('assigned', 'Assigned'),
        ('deleted', 'Deleted'),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='activities')
    lead = models.ForeignKey(
        Lead, on_delete=models.SET_NULL, null=True, blank=True, related_name='activities'
    )
    lead_name = models.CharField(max_length=255)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    description = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'activities'

    def __str__(self):
        return self.description


class Note(models.Model):
    KIND_CHOICES = (
        ('note', 'Note'),
        ('call', 'Call'),
        ('email', 'Email'),
        ('meeting', 'Meeting'),
    )

    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='notes')
    kind = models.CharField(max_length=10, choices=KIND_CHOICES, default='note')
    body = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at', '-id']

    def __str__(self):
        return f'{self.get_kind_display()} on {self.lead.name}'


class Task(models.Model):
    lead = models.ForeignKey(Lead, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    due_date = models.DateField(null=True, blank=True)
    done = models.BooleanField(default=False)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['done', 'due_date', '-created_at']

    def __str__(self):
        return self.title