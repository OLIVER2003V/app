from rest_framework import viewsets, mixins, permissions, generics
from rest_framework.response import Response
from django.db.models import Q, Avg, Count
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .models import Place, Event, Post, Review, ContactInfo, GalleryItem, Media, SiteSettings, ActivityLog
from .serializers import (
    PlaceSerializer, EventSerializer, PostSerializer,
    ReviewSerializer, ContactInfoSerializer,
    ModerationReviewSerializer, GalleryItemSerializer, MediaSerializer,
    SiteSettingsSerializer, ActivityLogSerializer,
)
from .permissions import IsEditorOrAdmin, IsAdmin
import os
import cloudinary
import cloudinary.uploader
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


class ActivityLoggingMixin:
    """
    Registra en la bitácora quién crea/edita/borra contenido. Se engancha en
    perform_create/update/destroy (no en señales) para tener siempre el
    usuario correcto de la request actual.
    """

    def perform_create(self, serializer):
        instance = serializer.save()
        ActivityLog.log(actor=self.request.user, action=ActivityLog.ACTION_CREATE, instance=instance)

    def perform_update(self, serializer):
        instance = serializer.save()
        ActivityLog.log(actor=self.request.user, action=ActivityLog.ACTION_UPDATE, instance=instance)

    def perform_destroy(self, instance):
        ActivityLog.log(actor=self.request.user, action=ActivityLog.ACTION_DELETE, instance=instance)
        instance.delete()


class PlaceViewSet(ActivityLoggingMixin, viewsets.ModelViewSet):
    serializer_class = PlaceSerializer
    lookup_field = "slug"

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsEditorOrAdmin()]

    def get_queryset(self):
        """
        Mejora: El queryset ahora es dinámico. Acepta filtros por `category`
        y `q` (búsqueda) desde la URL, permitiendo que el frontend pida solo
        los datos que necesita. Esto es clave para la optimización.
        Ej: /api/places/?category=cascada
        Ej: /api/places/?q=chorro
        """
        # Anotamos el queryset con el promedio de rating y el conteo de reviews.
        qs = Place.objects.annotate(
            avg_rating=Avg('reviews__rating'),
            reviews_count=Count('reviews')
        ).order_by("-created_at")

        if self.request.method in permissions.SAFE_METHODS:
            qs = qs.filter(is_active=True)

        category = self.request.query_params.get('category')
        search_query = self.request.query_params.get('q')

        if category: qs = qs.filter(category=category)
        if search_query: qs = qs.filter(Q(name__icontains=search_query) | Q(description__icontains=search_query))

        return qs

class EventViewSet(ActivityLoggingMixin, viewsets.ModelViewSet):
    serializer_class = EventSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsEditorOrAdmin()]

    def get_queryset(self):
        qs = Event.objects.all().order_by("-start_date")
        if self.request.method in permissions.SAFE_METHODS:
            qs = qs.filter(is_active=True)
        return qs

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

class PostViewSet(ActivityLoggingMixin, viewsets.ModelViewSet):
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
    serializer_class = ReviewSerializer
    permission_classes = [permissions.AllowAny]
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_queryset(self):
        qs = Review.objects.filter(is_approved=True).order_by("-created_at")
        place_id = self.request.query_params.get("place")
        if place_id:
            qs = qs.filter(place_id=place_id)
        return qs

class ModerationReviewViewSet(ActivityLoggingMixin, viewsets.ModelViewSet):
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


class ContactInfoViewSet(ActivityLoggingMixin, viewsets.ModelViewSet):
    # Los turistas solo ven los contactos activos
    def get_queryset(self):
        if self.request.user.is_staff:
             return ContactInfo.objects.all().order_by('category', 'name')
        return ContactInfo.objects.filter(is_active=True).order_by('category', 'name')

    serializer_class = ContactInfoSerializer
    
    # Los turistas pueden leer (GET); editor o admin pueden modificar
    # (antes exigía IsAdmin exclusivamente, lo que impedía a los editores
    # mantener actualizado el directorio de contactos).
    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsEditorOrAdmin()]
    
# tourism/views.py

import mimetypes
import logging

log = logging.getLogger(__name__)

class GalleryItemViewSet(ActivityLoggingMixin, viewsets.ModelViewSet):
    serializer_class = GalleryItemSerializer
    queryset = GalleryItem.objects.all().order_by("order", "-id")
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    # Antes exigía IsAdmin exclusivamente: un editor no podía subir fotos ni
    # videos a la galería principal, aunque sí podía editar lugares/eventos/
    # posts. Se alinea con el resto de recursos de contenido.
    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsEditorOrAdmin()]

    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB, suficiente para video corto
    ALLOWED_CONTENT_TYPES = ("image/", "video/")

    def _validate_file(self, file_obj):
        if file_obj.size > self.MAX_FILE_SIZE:
            return f"El archivo supera el máximo permitido ({self.MAX_FILE_SIZE // (1024*1024)}MB)."
        mime, _ = mimetypes.guess_type(file_obj.name)
        if not mime or not mime.startswith(self.ALLOWED_CONTENT_TYPES):
            return "Solo se permiten imágenes o videos."
        return None

    def create(self, request, *args, **kwargs):
        file_obj = request.FILES.get("media_file")
        if not file_obj:
            return Response({"detail": "No se envió ningún archivo."}, status=400)

        error = self._validate_file(file_obj)
        if error:
            return Response({"detail": error}, status=400)

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
            ActivityLog.log(actor=request.user, action=ActivityLog.ACTION_CREATE, instance=item)
            return Response(GalleryItemSerializer(item, context={"request": request}).data, status=201)

        except Exception as e:
            return Response({"detail": str(e)}, status=400)

    def update(self, request, *args, **kwargs):
        """
        El create() de arriba sube el archivo a mano y llena media_type/
        media_file_url; el update() por defecto de DRF no sabía hacer eso,
        así que reemplazar el archivo de un item existente dejaba
        media_type/media_file_url desactualizados. Si viene un archivo nuevo,
        se reprocesa igual que en create(); si no, se delega al flujo normal
        (así siguen funcionando los PATCH simples de is_active/order).
        """
        file_obj = request.FILES.get("media_file")
        if not file_obj:
            return super().update(request, *args, **kwargs)

        error = self._validate_file(file_obj)
        if error:
            return Response({"detail": error}, status=400)

        instance = self.get_object()
        mime, _ = mimetypes.guess_type(file_obj.name)
        is_video = bool(mime and mime.startswith("video/"))

        try:
            up = cloudinary.uploader.upload(file_obj, folder="gallery", resource_type="auto")
        except Exception as e:
            return Response({"detail": str(e)}, status=400)

        instance.media_type = "VIDEO" if is_video else "IMAGE"
        instance.media_file_url = up.get("secure_url", "")
        if "title" in request.data:
            instance.title = (request.data.get("title") or "").strip()
        if "order" in request.data:
            instance.order = int(request.data.get("order") or 0)
        if "is_active" in request.data:
            instance.is_active = str(request.data.get("is_active")).lower() in ("true", "1", "yes")
        instance.save()
        ActivityLog.log(actor=request.user, action=ActivityLog.ACTION_UPDATE, instance=instance)
        return Response(GalleryItemSerializer(instance, context={"request": request}).data)
class MediaViewSet(ActivityLoggingMixin, viewsets.ModelViewSet):
    """
    Fotos de un lugar (`Place`). Antes solo existía `MediaCreateView`, nunca
    registrada en urls.py y sin endpoint de borrado, así que era imposible
    subir o quitar fotos de un lugar salvo por Django Admin.
    """
    serializer_class = MediaSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsEditorOrAdmin()]

    def get_queryset(self):
        qs = Media.objects.select_related("place").order_by("-id")
        place_slug = self.request.query_params.get("place")
        if place_slug:
            qs = qs.filter(place__slug=place_slug)
        return qs

    def get_serializer_context(self):
        ctx = super().get_serializer_context()
        ctx["request"] = self.request
        return ctx

class SiteSettingsView(ActivityLoggingMixin, generics.RetrieveUpdateAPIView):
    """
    Horarios, tarifas, reglas del parque, actividades, etc. Antes este
    contenido vivía como texto fijo duplicado en Home/Información/Cómo
    Llegar (y ya desincronizado entre sí); ahora es un único registro
    editable desde el panel de admin. Lectura pública, escritura solo
    editor/admin.
    """
    serializer_class = SiteSettingsSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [IsEditorOrAdmin()]

    def get_object(self):
        return SiteSettings.load()


@api_view(['GET'])
@permission_classes([AllowAny]) # Importante: Permite acceso sin token
def health_check(request):
    """
    Ruta ligera para mantener el backend despierto (Ping).
    """
    return Response({"status": "OK", "message": "Backend activo"})