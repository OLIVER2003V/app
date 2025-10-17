from django.db import models
from django.conf import settings

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
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Media(models.Model):
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name="media")
    image = models.ImageField(upload_to="places/")
    caption = models.CharField(max_length=150, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class Event(models.Model):
    title = models.CharField(max_length=180)
    place = models.ForeignKey(Place, on_delete=models.SET_NULL, null=True, blank=True, related_name="events")
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)

# app/models.py
class Post(models.Model):
    title = models.CharField(max_length=180)
    body = models.TextField()
    place = models.ForeignKey(Place, null=True, blank=True, on_delete=models.SET_NULL, related_name="posts")
    cover = models.ImageField(upload_to="posts/", blank=True)
    is_published = models.BooleanField(default=True)
    # NUEVO:
    is_featured = models.BooleanField(default=False)          # aparece en el hero
    cta_url = models.URLField(blank=True)                     # link externo (venta/afiliado)
    cta_label = models.CharField(max_length=60, blank=True)   # texto del botón (ej. "Reservar", "Comprar")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)


class Review(models.Model):
    place = models.ForeignKey(Place, on_delete=models.CASCADE, related_name="reviews")
    rating = models.IntegerField(default=5)  # 1-5
    comment = models.TextField(blank=True)
    author_name = models.CharField(max_length=120, blank=True)
    
    # ▼▼▼ CAMPO NUEVO ▼▼▼
    photo = models.ImageField(upload_to='reviews/', null=True, blank=True)
    
    is_approved = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

# En tu archivo 'models.py'

class ContactInfo(models.Model):
    CATEGORY_CHOICES = [
        ('ASOCIACION', 'Asociación y Guías'),
        ('GASTRONOMIA', 'Gastronomía'),
        ('TRANSPORTE', 'Transporte'),
        ('OPERADORES', 'Operadores Turísticos'),
        ('GENERAL', 'Redes Sociales y General'),
    ]

    name = models.CharField(max_length=120)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='GENERAL')
    phone = models.CharField(max_length=20, blank=True)
    whatsapp = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    address = models.CharField(max_length=255, blank=True)
    facebook = models.URLField(blank=True)
    instagram = models.URLField(blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.get_category_display()})"

# Add this new model to your models.py

class GalleryItem(models.Model):
    MEDIA_TYPE_CHOICES = [
        ('IMAGE', 'Image'),
        ('VIDEO', 'Video'),
    ]
    title = models.CharField(max_length=150, help_text="Título o descripción corta.")
    media_type = models.CharField(max_length=5, choices=MEDIA_TYPE_CHOICES, default='IMAGE')
    # Use FileField to allow both images and videos
    media_file = models.FileField(upload_to='gallery/')
    order = models.PositiveIntegerField(default=0, help_text="Número para ordenar (menor a mayor).")
    is_active = models.BooleanField(default=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title