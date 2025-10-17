from rest_framework.permissions import BasePermission, SAFE_METHODS

def user_role(user):
    try:
        return getattr(user.profile, "role", None)
    except Exception:
        return None

class IsEditorOrAdmin(BasePermission):
    """
    Lectura pública. Escritura sólo editor/admin.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        if not request.user or not request.user.is_authenticated:
            return False
        role = user_role(request.user)
        return role in ("editor", "admin") or request.user.is_staff

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            getattr(request.user, "is_staff", False) or user_role(request.user) == "admin"
        )
