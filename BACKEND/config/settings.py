"""
Django settings for config project (Render + Cloudinary).
"""

# --- Arranque de settings.py (orden correcto) ---
from pathlib import Path
import os
from dotenv import load_dotenv  # <-- importar primero
from django.core.exceptions import ImproperlyConfigured

BASE_DIR = Path(__file__).resolve().parent.parent  # <-- definir BASE_DIR
load_dotenv(BASE_DIR / ".env")  # <-- recién aquí cargar .env

import dj_database_url
import cloudinary
# --- el resto de tu settings sigue igual ---


# -----------------------------
# Seguridad básica
# -----------------------------
# DEBUG ahora se lee explícitamente del entorno (antes se inferia de si
# existía la variable "RENDER", lo que dejaba DEBUG=True por accidente en
# cualquier host que no fuera Render, como Koyeb). Cada host (Render, Koyeb,
# local) debe fijar DEBUG=True/False explícitamente en su propio entorno.
DEBUG = os.environ.get("DEBUG", "False") == "True"

SECRET_KEY = os.environ.get("SECRET_KEY")
if not SECRET_KEY:
    if DEBUG:
        SECRET_KEY = "django-insecure-solo-para-desarrollo-local"
    else:
        raise ImproperlyConfigured(
            "SECRET_KEY no está configurada en las variables de entorno de producción."
        )

# -----------------------------
# Hosts / CORS / CSRF
# -----------------------------
_allowed_hosts_env = os.environ.get("ALLOWED_HOSTS")
if _allowed_hosts_env:
    ALLOWED_HOSTS = [h.strip() for h in _allowed_hosts_env.split(",") if h.strip()]
else:
    ALLOWED_HOSTS = [
        "jardinbackend-a5p0.onrender.com",
        "www.jardindelasdelicias.com",
        "localhost",
        "127.0.0.1",
        "grieving-elene-jardindelasdelicias-354ed852.koyeb.app",
        ".koyeb.app",
    ]
RENDER_EXTERNAL_HOSTNAME = os.environ.get("RENDER_EXTERNAL_HOSTNAME")
if RENDER_EXTERNAL_HOSTNAME and RENDER_EXTERNAL_HOSTNAME not in ALLOWED_HOSTS:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

CORS_ALLOWED_ORIGINS = [
    FRONTEND_URL,
    "https://jardin-frontend.onrender.com",
    "https://jardindelasdelicias.com",        # TU NUEVO DOMINIO (sin www)
    "https://www.jardindelasdelicias.com",
]
CORS_ALLOW_CREDENTIALS = False
CORS_EXPOSE_HEADERS = ["Authorization", "Content-Type"]

CSRF_TRUSTED_ORIGINS = [
    "https://*.onrender.com",
    "https://jardin-frontend.onrender.com",
    "https://jardindelasdelicias.com",        # TU NUEVO DOMINIO (sin www)
    "https://www.jardindelasdelicias.com",
    "https://grieving-elene-jardindelasdelicias-354ed852.koyeb.app",
]
if FRONTEND_URL.startswith("http://"):
    CSRF_TRUSTED_ORIGINS.append(FRONTEND_URL)

# -----------------------------
# Apps
# (orden recomendado por django-cloudinary-storage)
# -----------------------------
INSTALLED_APPS = [
    # Django
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",

    # Terceros
    "rest_framework",
    "rest_framework.authtoken",
    "corsheaders",

    # Media en Cloudinary
    "cloudinary_storage",
    "django.contrib.staticfiles",
    "cloudinary",

    # Tus apps
    "users",
    "tourism",
]

# -----------------------------
# Middleware
# (WhiteNoise va justo tras SecurityMiddleware)
# -----------------------------
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",

    "django.contrib.sessions.middleware.SessionMiddleware",
    "corsheaders.middleware.CorsMiddleware",

    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",

    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# -----------------------------
# Templates / WSGI
# -----------------------------
ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"

# -----------------------------
# Base de datos (DATABASE_URL en Render)
# -----------------------------
DATABASES = {
    "default": dj_database_url.config(
        default="sqlite:///db.sqlite3",
        conn_max_age=600,
        ssl_require=not DEBUG,
    )
}

# -----------------------------
# Auth
# -----------------------------
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# -----------------------------
# i18n / TZ
# -----------------------------
LANGUAGE_CODE = "es"
TIME_ZONE = "America/La_Paz"
USE_I18N = True
USE_TZ = True

# -----------------------------
# Static (WhiteNoise)
# -----------------------------
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# -----------------------------
# Media (Cloudinary)
# -----------------------------
# Con CLOUDINARY_URL en el entorno, django-cloudinary-storage se configura solo.
# Aun así, dejamos DEFAULT_FILE_STORAGE para obligar a usar Cloudinary.
DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"

MEDIA_URL = "/media/"

CLOUDINARY_STORAGE = {
    "CLOUD_NAME": os.environ.get("CLOUDINARY_CLOUD_NAME"),
    "API_KEY": os.environ.get("CLOUDINARY_API_KEY"),
    "API_SECRET": os.environ.get("CLOUDINARY_API_SECRET"),
    "SECURE": True,
    "RESOURCE_TYPE": "auto",   # 👈 clave para video/mp4
    # "OVERWRITE": True,       # opcional
}
# (Opcional) Config explícita si NO quieres usar CLOUDINARY_URL:
# CLOUDINARY_STORAGE = {
#     "CLOUD_NAME": os.environ.get("CLOUDINARY_CLOUD_NAME"),
#     "API_KEY": os.environ.get("CLOUDINARY_API_KEY"),
#     "API_SECRET": os.environ.get("CLOUDINARY_API_SECRET"),
#     "SECURE": True,
# }

# (Opcional) Config del cliente cloudinary (para cloudinary.uploader)
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET"),
    secure=True,
)

# -----------------------------
# DRF
# -----------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework.authentication.TokenAuthentication",
    ),
    # Antes era AllowAny global: cualquier vista nueva quedaba pública por
    # accidente si alguien olvidaba poner permisos. Todas las vistas actuales
    # (Place/Event/Post/Review/Contact/Gallery) ya declaran sus propios
    # permisos explícitos (lectura pública, escritura editor/admin), así que
    # este cambio no les afecta y solo endurece el default para lo nuevo.
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.IsAuthenticated",
    ),
    "DEFAULT_THROTTLE_CLASSES": (
        "rest_framework.throttling.AnonRateThrottle",
        "rest_framework.throttling.UserRateThrottle",
    ),
    "DEFAULT_THROTTLE_RATES": {
        "anon": "30/minute",
        "user": "120/minute",
    },
}

# -----------------------------
# Seguridad extra en prod
# -----------------------------
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 60 * 60 * 24  # 1 día
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# -----------------------------
# Clave primaria por defecto
# -----------------------------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
