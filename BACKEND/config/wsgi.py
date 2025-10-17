# BACKEND/config/wsgi.py

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# --- AÑADE ESTE CÓDIGO DESDE AQUÍ ---
# Asegúrate de que las apps de Django estén listas antes de intentar importar modelos.
application = get_wsgi_application()

from django.contrib.auth import get_user_model
from django.core.exceptions import ImproperlyConfigured

# Lee las variables de entorno para el superusuario
SUPERUSER_NAME = os.environ.get('SUPERUSER_NAME')
SUPERUSER_EMAIL = os.environ.get('SUPERUSER_EMAIL')
SUPERUSER_PASSWORD = os.environ.get('SUPERUSER_PASSWORD')

# Si las variables existen, intenta crear el superusuario
if SUPERUSER_NAME and SUPERUSER_EMAIL and SUPERUSER_PASSWORD:
    User = get_user_model()
    if not User.objects.filter(username=SUPERUSER_NAME).exists():
        print(f"Creando cuenta para superusuario: {SUPERUSER_NAME}")
        User.objects.create_superuser(
            username=SUPERUSER_NAME,
            email=SUPERUSER_EMAIL,
            password=SUPERUSER_PASSWORD
        )
    else:
        print(f"Superusuario '{SUPERUSER_NAME}' ya existe.")
# --- HASTA AQUÍ ---