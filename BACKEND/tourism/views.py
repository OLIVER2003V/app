from rest_framework import viewsets, mixins, permissions, generics
from rest_framework.response import Response
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

import mimetypes
import logging

log = logging.getLogger(__name__)

class GalleryItemViewSet(viewsets.ModelViewSet):
    serializer_class = GalleryItemSerializer
    queryset = GalleryItem.objects.all().order_by("order", "-id")
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        from .permissions import IsAdmin
        return [IsAdmin()]

    def create(self, request, *args, **kwargs):
        file_obj = request.FILES.get("media_file")
        if not file_obj:
            return Response({"detail": "No se envió ningún archivo."}, status=400)

        # datos base
        title = (request.data.get("title") or "").strip()
        order = int(request.data.get("order") or 0)
        is_active = str(request.data.get("is_active")).lower() in ("true", "1", "yes")

        # detectar mime
        mime, _ = mimetypes.guess_type(file_obj.name)
        is_video = bool(mime and mime.startswith("video/"))

        try:
            # ⬇️ Subida directa a Cloudinary; acepta imagen o video
            up = cloudinary.uploader.upload(
                file_obj,
                folder="gallery",
                resource_type="auto",
            )

            item = GalleryItem.objects.create(
                title=title,
                media_type="VIDEO" if is_video else "IMAGE",
                media_file_url=up.get("secure_url", ""),
                # para imágenes puedes seguir usando FileField si quieres,
                # pero con este flujo ya no es necesario.
                is_active=is_active,
                order=order,
            )
            return Response(GalleryItemSerializer(item, context={"request": request}).data, status=201)

        except Exception as e:
            return Response({"detail": str(e)}, status=400)
class MediaCreateView(generics.CreateAPIView):
    queryset = Media.objects.all()
    serializer_class = MediaSerializer
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [permissions.IsAuthenticated]