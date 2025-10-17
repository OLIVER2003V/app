from rest_framework import viewsets, mixins, permissions
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Place, Event, Post, Review, ContactInfo, GalleryItem
from .serializers import (
    PlaceSerializer, EventSerializer, PostSerializer,
    ReviewSerializer, ContactInfoSerializer,
    ModerationReviewSerializer, GalleryItemSerializer
)
from .permissions import IsEditorOrAdmin, IsAdmin

class PlaceViewSet(viewsets.ModelViewSet):
    serializer_class = PlaceSerializer
    lookup_field = "slug"

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsEditorOrAdmin()]

    def get_queryset(self):
        qs = Place.objects.all().order_by("-created_at")
        if self.request.method in permissions.SAFE_METHODS:
            qs = qs.filter(is_active=True)
        return qs

class EventViewSet(viewsets.ModelViewSet):
    serializer_class = EventSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsEditorOrAdmin()]

    def get_queryset(self):
        qs = Event.objects.all().order_by("-start_date")
        if self.request.method in permissions.SAFE_METHODS:
            qs = qs.filter(is_active=True)
        return qs

class PostViewSet(viewsets.ModelViewSet):
    serializer_class = PostSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsEditorOrAdmin()]

    def get_queryset(self):
        qs = Post.objects.all().order_by("-created_at")
        if self.request.method in permissions.SAFE_METHODS:
            qs = qs.filter(is_published=True)
        return qs
    
    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

class PublicReviewViewSet(mixins.CreateModelMixin,
                          mixins.ListModelMixin,
                          viewsets.GenericViewSet):
    queryset = Review.objects.filter(is_approved=True).order_by("-created_at")
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

class ModerationReviewViewSet(viewsets.ModelViewSet):
    serializer_class = ModerationReviewSerializer
    permission_classes = [IsEditorOrAdmin]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    # ▼▼▼ MÉTODO CORREGIDO ▼▼▼
    def get_queryset(self):
        """
        Esta función ahora es más inteligente:
        - Para acciones de detalle (borrar, actualizar), busca en TODAS las opiniones.
        - Para la acción de listar, filtra por estado (pendientes o aprobadas).
        """
        # `self.action` nos dice si la petición es para 'list', 'update', 'destroy', etc.
        if self.action in ['retrieve', 'update', 'partial_update', 'destroy']:
            return Review.objects.all()

        # Comportamiento para la vista de lista (GET /api/moderation/reviews/)
        status = self.request.query_params.get('status')
        if status == 'approved':
            return Review.objects.filter(is_approved=True).order_by("-created_at")
        
        # Por defecto, la lista solo muestra las pendientes
        return Review.objects.filter(is_approved=False).order_by("-created_at")


# En tu archivo 'views.py'

from .permissions import IsAdmin # Asegúrate de que este permiso esté bien definido

class ContactInfoViewSet(viewsets.ModelViewSet):
    # Los turistas solo ven los contactos activos
    def get_queryset(self):
        if self.request.user.is_staff:
             return ContactInfo.objects.all().order_by('category', 'name')
        return ContactInfo.objects.filter(is_active=True).order_by('category', 'name')

    serializer_class = ContactInfoSerializer
    
    # Los turistas pueden leer (GET), pero solo los admins pueden modificar
    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsAdmin()]
    
class GalleryItemViewSet(viewsets.ModelViewSet):
    serializer_class = GalleryItemSerializer
    parser_classes = [MultiPartParser, FormParser] # To handle file uploads

    def get_queryset(self):
        # Public users see only active items
        if self.request.method in permissions.SAFE_METHODS:
            return GalleryItem.objects.filter(is_active=True)
        # Admins see all items
        return GalleryItem.objects.all()

    def get_permissions(self):
        # Public can view (GET), only admins can change
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsAdmin()]