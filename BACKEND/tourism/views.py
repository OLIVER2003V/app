from rest_framework import viewsets, mixins, permissions, generics
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Place, Event, Post, Review, ContactInfo, GalleryItem, Media
from .serializers import (
    PlaceSerializer, EventSerializer, PostSerializer,
    ReviewSerializer, ContactInfoSerializer,
    ModerationReviewSerializer, GalleryItemSerializer, MediaSerializer
)
from .permissions import IsEditorOrAdmin, IsAdmin
import os
import cloudinary
import cloudinary.uploader
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
    
# tourism/views.py

class GalleryItemViewSet(viewsets.ModelViewSet):
    serializer_class = GalleryItemSerializer
    queryset = GalleryItem.objects.all().order_by("order", "-id")
    parser_classes = [MultiPartParser, FormParser]

    def get_permissions(self):
        # GET público; escritura admin (ajusta a tu permiso)
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        from .permissions import IsAdmin
        return [IsAdmin()]

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

    def _detect_media_type(self, instance):
        ctype = None
        # 1) intenta content_type desde el archivo subido
        f = getattr(instance.media_file, "file", None)
        ctype = getattr(f, "content_type", None)
        # 2) si no hay, intenta por extensión
        if not ctype:
            guess, _ = mimetypes.guess_type(getattr(instance.media_file, "name", ""))
            ctype = guess
        if ctype:
            if ctype.startswith("video/"):
                instance.media_type = "VIDEO"
            elif ctype.startswith("image/"):
                instance.media_type = "IMAGE"

    def perform_create(self, serializer):
        try:
            instance = serializer.save()   # aquí se sube a Cloudinary por el storage
            # URL pública (Cloudinary)
            if instance.media_file and not instance.media_file_url:
                instance.media_file_url = instance.media_file.url
            # detectar tipo
            self._detect_media_type(instance)
            instance.save()
        except Exception as e:
            # Devuelve 400 con el mensaje real (en Network verás el detalle)
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_update(self, serializer):
        try:
            instance = serializer.save()
            if instance.media_file:
                instance.media_file_url = instance.media_file.url
            self._detect_media_type(instance)
            instance.save()
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class MediaCreateView(generics.CreateAPIView):
    queryset = Media.objects.all()
    serializer_class = MediaSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]