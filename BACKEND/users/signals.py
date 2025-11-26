from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from rest_framework.authtoken.models import Token
from .models import UserProfile

@receiver(post_save, sender=settings.AUTH_USER_MODEL)
def ensure_user_setup(sender, instance=None, created=False, **kwargs):
    """
    Se ejecuta cada vez que se guarda un Usuario.
    1. Crea el Token si es nuevo.
    2. Crea el UserProfile si es nuevo O si no existe.
    """
    if created:
        Token.objects.get_or_create(user=instance)
    
    # Esto asegura que el perfil exista incluso para superusers creados por consola
    # Ojo: Usamos get_or_create para no duplicar si ya lo creó el serializer
    UserProfile.objects.get_or_create(user=instance)