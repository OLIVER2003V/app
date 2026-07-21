from rest_framework import serializers
from .models import (
    Place, Event, Post, Review, ContactInfo, GalleryItem, Media, SiteSettings, ActivityLog,
)

class MediaSerializerForPlace(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ('id', 'image', 'caption')

class PlaceSerializer(serializers.ModelSerializer):
    media = MediaSerializerForPlace(many=True, read_only=True)
    # Nuevos campos para enriquecer la tarjeta
    avg_rating = serializers.FloatField(read_only=True)
    reviews_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Place
        fields = (
            'id', 'name', 'slug', 'category', 'description', 'address', 'lat', 'lng',
            'media', 
            'key_features',   # <-- Etiqueta de atributos
            'avg_rating',     # <-- Calificación promedio
            'reviews_count'   # <-- Conteo de opiniones
        )
        lookup_field = "slug"

# --- El resto de tus serializers (Event, Post, etc.) irían aquí ---
# Por ejemplo:
class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = '__all__'

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = '__all__'

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'

class ModerationReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'

class ContactInfoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactInfo
        fields = '__all__'

class GalleryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryItem
        fields = '__all__'

class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = '__all__'

class SiteSettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteSettings
        fields = '__all__'

class ActivityLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = ActivityLog
        fields = '__all__'