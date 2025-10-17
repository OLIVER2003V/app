from django.conf import settings
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    class Roles(models.TextChoices):
        EDITOR = "editor", "Editor"
        ADMIN  = "admin", "Administrador"

    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="profile")
    role = models.CharField(max_length=20, choices=Roles.choices, default=Roles.EDITOR)
    display_name = models.CharField(max_length=120, blank=True)
    phone = models.CharField(max_length=30, blank=True)

    def __str__(self):
        return f"{self.user.username} ({self.role})"
