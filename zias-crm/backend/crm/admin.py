from django.contrib import admin
from django.utils import timezone

from .models import Activity, Lead, Note, Task, UserProfile

admin.site.site_header = 'SoftFire CRM'
admin.site.site_title = 'SoftFire Admin'
admin.site.index_title = 'Manage your team, leads and roles 🐾'


@admin.register(Lead)
class LeadAdmin(admin.ModelAdmin):
    list_display = ('name', 'company', 'email', 'status', 'value', 'owner', 'created_at')
    list_editable = ('status',)
    list_filter = ('status', 'owner', 'created_at')
    search_fields = ('name', 'company', 'email', 'phone')
    list_select_related = ('owner',)
    list_per_page = 50
    date_hierarchy = 'created_at'
    ordering = ('-created_at',)
    readonly_fields = ('created_at', 'closed_at')

    def save_model(self, request, obj, form, change):
        # Keep closed_at correct when status is changed from the admin,
        # so revenue trends on the dashboard stay accurate.
        if obj.status == 'Closed' and obj.closed_at is None:
            obj.closed_at = timezone.now()
        elif obj.status != 'Closed':
            obj.closed_at = None
        super().save_model(request, obj, form, change)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'full_name', 'email', 'role', 'manager', 'is_active')
    list_editable = ('role', 'manager')
    list_filter = ('role', 'user__is_active')
    search_fields = ('user__username', 'user__first_name', 'user__last_name', 'user__email')
    list_select_related = ('user', 'manager')

    @admin.display(description='Name')
    def full_name(self, obj):
        return obj.user.get_full_name() or '—'

    @admin.display(description='Email')
    def email(self, obj):
        return obj.user.email or '—'

    @admin.display(boolean=True, description='Active')
    def is_active(self, obj):
        return obj.user.is_active


@admin.register(Activity)
class ActivityAdmin(admin.ModelAdmin):
    # The activity log is a record, so it's read-only here
    list_display = ('created_at', 'user', 'action', 'description')
    list_filter = ('action', 'created_at')
    search_fields = ('description', 'lead_name', 'user__username')
    list_select_related = ('user',)
    readonly_fields = ('user', 'lead', 'lead_name', 'action', 'description', 'created_at')

    def has_add_permission(self, request):
        return False


@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('lead', 'kind', 'created_at')
    list_filter = ('kind', 'created_at')
    search_fields = ('body', 'lead__name')
    list_select_related = ('lead',)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'lead', 'due_date', 'done')
    list_editable = ('done',)
    list_filter = ('done', 'due_date')
    search_fields = ('title', 'lead__name')
    list_select_related = ('lead',)