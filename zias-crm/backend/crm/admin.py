from django.contrib import admin

from .models import Customer


@admin.register(Customer)
class CustomerAdmin(admin.ModelAdmin):
    list_display = ["name", "company", "status", "owner", "created_at"]
    list_filter = ["status"]
    search_fields = ["name", "email", "company"]
