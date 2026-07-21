# tourism/models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator, FileExtensionValidator
from cloudinary_storage.storage import MediaCloudinaryStorage
from .validators import validate_file_size

IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "gif"]
VIDEO_EXTENSIONS = ["mp4", "mov", "avi", "webm"]


class Place(models.Model):
    CATEGORY_CHOICES = [
        ("mirador", "Mirador"),
        ("cascada", "Cascada"),
        ("ruta", "Ruta"),
        ("gastronomia", "Gastronomía"),
        ("hospedaje", "Hospedaje"),
        ("otro", "Otro"),
    ]

    name = models.CharField(max_length=180)
    slug = models.SlugField(max_length=200, unique=True)
    category = models.CharField(max_length=40, choices=CATEGORY_CHOICES, default="otro")
    description = models.TextField(blank=True)
    address = models.CharField(max_length=200, blank=True)
    lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    key_features = models.JSONField(
        default=list,
        blank=True,
        help_text="Lista de características clave, ej: ['Fácil Acceso', 'Se puede nadar']"
    )
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["slug"]),
            models.Index(fields=["category", "is_active"]),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class Media(models.Model):
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name="media")
    # ⬇️ Forzamos Cloudinary
    image = models.ImageField(
        upload_to="places/",
        storage=MediaCloudinaryStorage(),
        validators=[FileExtensionValidator(IMAGE_EXTENSIONS), validate_file_size],
    )
    caption = models.CharField(max_length=150, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return f"Media #{self.id} · {self.place.name if self.place_id else 'sin lugar'}"


class Event(models.Model):
    title = models.CharField(max_length=180)
    place = models.ForeignKey(
        Place, on_delete=models.SET_NULL, null=True, blank=True, related_name="events"
    )
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

    # ⬇️ Arte del evento (opcional): rallys, ferias, carreras, etc. suelen
    # tener un afiche/flyer que ayuda mucho más que solo texto.
    image = models.ImageField(
        upload_to="events/",
        storage=MediaCloudinaryStorage(),
        validators=[FileExtensionValidator(IMAGE_EXTENSIONS), validate_file_size],
        blank=True,
        null=True,
    )
    # Link directo de WhatsApp para consultas sobre este evento en particular
    # (puede ser distinto del grupo general del sitio).
    whatsapp_url = models.URLField(blank=True)
    # El admin elige explícitamente cuál evento se anuncia como pop-up al
    # entrar al sitio, en vez de mostrar automáticamente "el más próximo"
    # (que podría no tener buen arte o no ser el que quieren promocionar).
    is_featured = models.BooleanField(default=False)

    class Meta:
        ordering = ["-start_date"]

    def __str__(self):
        return self.title


class Post(models.Model):
    title = models.CharField(max_length=180)
    body = models.TextField()
    place = models.ForeignKey(
        Place, null=True, blank=True, on_delete=models.SET_NULL, related_name="posts"
    )
    # ⬇️ Forzamos Cloudinary
    cover = models.ImageField(
        upload_to="posts/",
        blank=True,
        storage=MediaCloudinaryStorage(),
        validators=[FileExtensionValidator(IMAGE_EXTENSIONS), validate_file_size],
    )
    is_published = models.BooleanField(default=True)

    # Nuevos campos
    is_featured = models.BooleanField(default=False)        # aparece en el hero
    cta_url = models.URLField(blank=True)                   # link externo (venta/afiliado)
    cta_label = models.CharField(max_length=60, blank=True) # texto del botón

    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=["is_published", "is_featured"]),
        ]
        ordering = ["-created_at"]

    def __str__(self):
        return self.title


class Review(models.Model):
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name="reviews")
    rating = models.IntegerField(
        default=5, validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True)
    author_name = models.CharField(max_length=120, blank=True)

    # ⬇️ MODIFICADO: De 'photo' (ImageField) a 'attachment' (FileField) para aceptar videos.
    attachment = models.FileField(
        upload_to="reviews/",
        null=True,
        blank=True,
        storage=MediaCloudinaryStorage(),
        validators=[
            FileExtensionValidator(IMAGE_EXTENSIONS + VIDEO_EXTENSIONS),
            validate_file_size
        ],
        help_text="Opcional: Sube una foto o video (máx 50MB)."
    )

    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"Review #{self.id} · {self.place.name if self.place_id else 'sin lugar'}"


class ContactInfo(models.Model):
    CATEGORY_CHOICES = [
        ("ASOCIACION", "Asociación y Guías"),
        ("GASTRONOMIA", "Gastronomía"),
        ("TRANSPORTE", "Transporte"),
        ("OPERADORES", "Operadores Turísticos"),
        ("GENERAL", "Redes Sociales y General"),
    ]

    name = models.CharField(max_length=120)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default="GENERAL")
    phone = models.CharField(max_length=20, blank=True)
    whatsapp = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.CharField(max_length=255, blank=True)
    facebook = models.URLField(blank=True)
    instagram = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["category", "name"]
        indexes = [models.Index(fields=["category", "is_active"])]

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"


class GalleryItem(models.Model):
    MEDIA_TYPE_CHOICES = [
        ("IMAGE", "Image"),
        ("VIDEO", "Video"),
    ]

    title = models.CharField(max_length=150)
    media_type = models.CharField(max_length=5, choices=MEDIA_TYPE_CHOICES, default="IMAGE")
    # ⬇️ Forzamos Cloudinary (sirve para imagen o video)
    media_file = models.FileField(upload_to="gallery/", storage=MediaCloudinaryStorage())
    order = models.PositiveIntegerField(default=0)
    is_active = models.BooleanField(default=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    # No obligatorio; lo autollenamos en la vista (perform_create/update)
    media_file_url = models.URLField(max_length=512, blank=True)

    class Meta:
        ordering = ["order", "-id"]
        indexes = [
            models.Index(fields=["is_active", "order"]),
            models.Index(fields=["media_type"]),
        ]

    def __str__(self):
        return f"{self.title} · {self.media_type}"


def default_park_rules():
    return [
        "No ingresar bebidas alcohólicas ni sustancias controladas.",
        "Prohibido el ingreso de mascotas (por fauna nativa).",
        "Prohibido hacer fogatas fuera de áreas designadas.",
        "Llévate tu basura. Ayúdanos a mantener el lugar limpio.",
        "No extraer plantas ni molestar a los animales silvestres.",
    ]


def default_park_rules_en():
    return [
        "No alcoholic beverages or controlled substances allowed.",
        "Pets are not allowed (to protect native wildlife).",
        "Campfires are only allowed in designated areas.",
        "Take your trash with you. Help us keep the place clean.",
        "Do not pick plants or disturb wild animals.",
    ]


def default_activities():
    return [
        "Visita a cataratas y piscinas naturales",
        "Trekking y senderismo por la selva",
        "Avistamiento de aves y flora",
        "Rappel y Tirolesa (con operadores)",
    ]


def default_activities_en():
    return [
        "Visiting waterfalls and natural pools",
        "Trekking and hiking through the jungle",
        "Bird and flora watching",
        "Rappelling and zip-lining (with tour operators)",
    ]


def default_what_to_bring():
    return [
        "Ropa cómoda y zapatos de trekking con buena suela (el terreno puede ser resbaloso).",
        "Repelente para mosquitos y protector solar biodegradable.",
        "Suficiente agua para hidratarte durante las caminatas.",
        "Dinero en efectivo (no hay cajeros ni buena señal para transferencias).",
    ]


def default_what_to_bring_en():
    return [
        "Comfortable clothes and hiking shoes with good grip (the terrain can be slippery).",
        "Mosquito repellent and biodegradable sunscreen.",
        "Enough water to stay hydrated during the hikes.",
        "Cash (there are no ATMs and signal for transfers is unreliable).",
    ]


def default_transport_options():
    return [
        {"emoji": "🚙", "label": "Camioneta 4x4", "price": 25},
        {"emoji": "🛵", "label": "Mototaxi", "price": 100},
    ]


class SiteSettings(models.Model):
    """
    Información general del sitio (horarios, tarifas, reglas, etc.), editable
    desde el panel de admin. Antes vivía como texto fijo duplicado en Home,
    Información y Cómo Llegar, ya desincronizado entre sí (la tarifa de
    estudiantes existía en una página y no en otra). Se maneja como singleton:
    siempre hay un solo registro (ver SiteSettings.load()).
    """
    schedule_hours = models.CharField(max_length=50, default="08:00 - 18:00")

    general_price = models.PositiveIntegerField(default=15)
    park_fee_students = models.PositiveIntegerField(default=10)
    park_fee_nationals = models.PositiveIntegerField(default=20)
    park_fee_foreigners = models.PositiveIntegerField(default=100)

    # Antes eran 2 campos numéricos fijos (camioneta/mototaxi): el admin solo
    # podía cambiar el precio, no agregar/quitar/renombrar una opción (ej. un
    # bus público, o un transfer compartido). Ahora es una lista libre.
    transport_options = models.JSONField(
        default=default_transport_options,
        blank=True,
        help_text="Opciones de transporte mostradas en 'Cómo llegar', ej: [{'emoji': '🚙', 'label': 'Camioneta 4x4', 'price': 25}]",
    )

    # Punto de partida / cómo llegar a El Torno desde Santa Cruz de la Sierra
    # (distancia, tiempo, ruta). Vacío por defecto a propósito: es contenido
    # que solo el equipo local puede confirmar con precisión.
    route_start_text = models.TextField(blank=True, default="")
    route_start_text_en = models.TextField(blank=True, default="")

    camping_price_per_tent = models.PositiveIntegerField(default=10)
    camping_text = models.TextField(
        blank=True,
        default="Vive la experiencia completa durmiendo bajo las estrellas. Puedes traer tu propia carpa o alquilar una en la comunidad.",
    )
    camping_text_en = models.TextField(
        blank=True,
        default="Live the full experience sleeping under the stars. You can bring your own tent or rent one from the community.",
    )

    gastronomy_text = models.TextField(
        blank=True,
        default="Las comunarias preparan deliciosas comidas típicas criollas los fines de semana.",
    )
    gastronomy_text_en = models.TextField(
        blank=True,
        default="Local community members prepare delicious traditional Creole food on weekends.",
    )
    gastronomy_note = models.CharField(
        max_length=255,
        blank=True,
        default="🔥 También contamos con alquiler de parrillas para que prepares tu propio asado.",
    )
    gastronomy_note_en = models.CharField(
        max_length=255,
        blank=True,
        default="🔥 We also offer grill rentals so you can prepare your own barbecue.",
    )

    security_text = models.TextField(
        blank=True,
        default="Para tu seguridad y la conservación del área protegida, está terminantemente prohibido desviarse de los senderos marcados o ingresar a zonas restringidas sin un guía autorizado.",
    )
    security_text_en = models.TextField(
        blank=True,
        default="For your safety and to help preserve this protected area, it is strictly forbidden to leave the marked trails or enter restricted zones without an authorized guide.",
    )

    whatsapp_group_url = models.URLField(
        blank=True, default="https://chat.whatsapp.com/EpzISekSBCe08kJh9lsqpx"
    )
    route_video_youtube_id = models.CharField(max_length=30, blank=True, default="rMBSyYd7JJE")

    park_rules = models.JSONField(default=default_park_rules, blank=True)
    park_rules_en = models.JSONField(default=default_park_rules_en, blank=True)
    activities = models.JSONField(default=default_activities, blank=True)
    activities_en = models.JSONField(default=default_activities_en, blank=True)
    what_to_bring = models.JSONField(default=default_what_to_bring, blank=True)
    what_to_bring_en = models.JSONField(default=default_what_to_bring_en, blank=True)

    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Información del sitio"
        verbose_name_plural = "Información del sitio"

    def __str__(self):
        return "Información del sitio"

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def save(self, *args, **kwargs):
        self.pk = 1
        super().save(*args, **kwargs)


class ActivityLog(models.Model):
    """
    Bitácora de actividad del staff: quién creó/editó/borró qué y cuándo.
    Antes no había forma de saber esto salvo revisando la base de datos a
    mano. Se registra desde las vistas (perform_create/update/destroy), no
    con señales, para tener siempre el usuario correcto de la request sin
    depender de estado global.

    Deliberadamente NO registra acciones de turistas (reseñas enviadas,
    búsquedas, etc.) — es un registro de responsabilidad del equipo, no de
    analítica de visitantes (para eso está Google Analytics).
    """
    ACTION_CREATE = "create"
    ACTION_UPDATE = "update"
    ACTION_DELETE = "delete"
    ACTION_CHOICES = [
        (ACTION_CREATE, "Creación"),
        (ACTION_UPDATE, "Edición"),
        (ACTION_DELETE, "Eliminación"),
    ]

    actor = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="activity_logs",
        help_text="Null si el usuario fue borrado después de la acción.",
    )
    action = models.CharField(max_length=10, choices=ACTION_CHOICES)
    model_name = models.CharField(max_length=100)
    object_id = models.CharField(max_length=50, blank=True)
    object_repr = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["-created_at"]),
            models.Index(fields=["model_name"]),
            models.Index(fields=["actor"]),
        ]
        verbose_name = "Registro de actividad"
        verbose_name_plural = "Bitácora de actividad"

    def __str__(self):
        return f"{self.get_action_display()} · {self.model_name} #{self.object_id}"

    @classmethod
    def log(cls, *, actor, action, instance):
        user = actor if getattr(actor, "is_authenticated", False) else None
        cls.objects.create(
            actor=user,
            action=action,
            model_name=instance.__class__.__name__,
            object_id=str(getattr(instance, "pk", "")),
            object_repr=str(instance)[:255],
        )
