from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token
from .views import RegisterView, MeView

urlpatterns = [
    path("register/", RegisterView.as_view(), name="register"),
    path("token/login/", obtain_auth_token, name="token_login"),  # ruta oficial
    # Alias opcional para que funcione /api/auth/login/ si lo prefieres:
    path("login/", obtain_auth_token, name="login_alias"),
    path("me/", MeView.as_view(), name="me"),
]
