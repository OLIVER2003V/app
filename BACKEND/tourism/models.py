# tourism/models.py
from django.db import models
from django.conf import settings
from django.core.validators import MinValueValidator, MaxValueValidator
from cloudinary_storage.storage import MediaCloudinaryStorage


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
    image = models.ImageField(upload_to="places/", storage=MediaCloudinaryStorage())
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
    cover = models.ImageField(upload_to="posts/", blank=True, storage=MediaCloudinaryStorage())
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

    # ⬇️ Forzamos Cloudinary
    photo = models.ImageField(
        upload_to="reviews/", null=True, blank=True, storage=MediaCloudinaryStorage()
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
