"""
Django settings for config project (Render + Cloudinary).
"""

# config/settings.py
from pathlib import Path
import os
import dj_database_url
import cloudinary # <-- Asegúrate de tener este import

# ▼▼▼ AÑADE ESTE BLOQUE COMPLETO ▼▼▼
# Configuración explícita de Cloudinary
cloudinary.config(
  cloud_name = os.environ.get("CLOUDINARY_CLOUD_NAME"),
  api_key = os.environ.get("CLOUDINARY_API_KEY"),
  api_secret = os.environ.get("CLOUDINARY_API_SECRET"),
  secure = True
)
# -----------------------------
# Paths
# -----------------------------
BASE_DIR = Path(__file__).resolve().parent.parent

# -----------------------------
# Seguridad básica
# -----------------------------
SECRET_KEY = os.environ.get("SECRET_KEY", "clave-secreta-insegura-para-desarrollo")
DEBUG = "RENDER" not in os.environ  # En Render, DEBUG=False

# -----------------------------
# Hosts / CORS / CSRF
# -----------------------------
ALLOWED_HOSTS = ["jardinbackend-a5p0.onrender.com", "localhost", "127.0.0.1"]
RENDER_EXTERNAL_HOSTNAME = os.environ.get("RENDER_EXTERNAL_HOSTNAME")
if RENDER_EXTERNAL_HOSTNAME:
    ALLOWED_HOSTS.append(RENDER_EXTERNAL_HOSTNAME)

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")

CORS_ALLOWED_ORIGINS = [
    FRONTEND_URL,
    "https://jardin-frontend.onrender.com",  # explícito
]
# Usas Token, no cookies; credenciales no son necesarias.
# Déjalo True si en algún punto vas a usar cookies/CSRf desde front.
CORS_ALLOW_CREDENTIALS = False
CORS_EXPOSE_HEADERS = ["Authorization", "Content-Type"]

CSRF_TRUSTED_ORIGINS = [
    "https://*.onrender.com",
    "https://jardin-frontend.onrender.com",
]
if FRONTEND_URL.startswith("http://"):
    CSRF_TRUSTED_ORIGINS.append(FRONTEND_URL)

# -----------------------------
# Apps
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
# (WhiteNoise debe ir justo tras SecurityMiddleware)
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
# NO usamos MEDIA_ROOT en disco. Cloudinary devuelve URL absolutas.
MEDIA_URL = "/media/"

DEFAULT_FILE_STORAGE = "cloudinary_storage.storage.MediaCloudinaryStorage"


# Si usas FileField/ImageField, obj.campo.url devolverá una URL https pública.

# -----------------------------
# DRF
# -----------------------------
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework.authentication.TokenAuthentication",
    ),
    "DEFAULT_PERMISSION_CLASSES": (
        "rest_framework.permissions.AllowAny",
    ),
}

# -----------------------------
# Seguridad extra en prod
# -----------------------------
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_HSTS_SECONDS = 60 * 60 * 24  # 1 día (puedes subirlo)
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True

# -----------------------------
# Clave primaria por defecto
# -----------------------------
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
# ya tienes cloudinary + cloudinary_storage en INSTALLED_APPS
