
from django.contrib import admin
from .models import UserProfile,Application


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'is_approved')
    list_filter = ('role', 'is_approved')
    search_fields = ('user__username', 'user__email')
    list_editable = ('is_approved',)


@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ('id', 'applicant', 'job', 'status', 'applied_at')
    list_filter = ('status', 'applied_at')
    search_fields = ('applicant__username', 'job__title')
    readonly_fields = ('applied_at',)