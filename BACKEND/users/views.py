from rest_framework import generics, permissions
from rest_framework.response import Response
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, UserSerializer, AdminUserUpdateSerializer
from .models import UserProfile
from tourism.permissions import IsAdmin

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    # Antes usaba permissions.IsAdminUser (solo mira is_staff, un flag de
    # Django separado del rol de la app). Se alinea con IsAdmin para que el
    # criterio de "quién es admin" sea el mismo en toda la API.
    permission_classes = [IsAdmin]

class MeView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_object(self):
        return self.request.user

class UserListView(generics.ListAPIView):
    """Lista de usuarios con su rol, para que un admin pueda gestionarlos.
    Antes esto solo era posible desde Django Admin/shell."""
    queryset = User.objects.select_related("profile").order_by("username")
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

class UserDetailView(generics.GenericAPIView):
    """Editar (usuario, correo, contraseña, rol) o eliminar un usuario.
    Solo admin (mismo permiso que el resto del CRUD de usuarios, no el
    is_staff de Django)."""
    queryset = User.objects.select_related("profile")
    permission_classes = [IsAdmin]
    serializer_class = AdminUserUpdateSerializer

    def patch(self, request, *args, **kwargs):
        user = self.get_object()
        role = request.data.get("role")
        if role is not None and role not in UserProfile.Roles.values:
            return Response({"detail": "Rol inválido."}, status=400)
        if user.id == request.user.id and role and role != UserProfile.Roles.ADMIN:
            return Response({"detail": "No puedes quitarte tu propio rol de administrador."}, status=400)

        serializer = self.get_serializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(user).data)

    def delete(self, request, *args, **kwargs):
        user = self.get_object()
        if user.id == request.user.id:
            return Response({"detail": "No puedes eliminar tu propia cuenta."}, status=400)
        user.delete()
        return Response(status=204)
