from rest_framework import serializers
from .models import Place, Media, Event, Post, Review, ContactInfo, GalleryItem
import cloudinary
import cloudinary.uploader
class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ("id", "place", "image", "caption", "created_at")

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        request = self.context.get("request")
        if instance.image:
            rep["image"] = (
                abs_url_or_none(request, instance.image.url) if request else instance.image.url
            )
        return rep


class ReviewSerializer(serializers.ModelSerializer):
    place_name = serializers.CharField(source='place.name', read_only=True)
    place_slug = serializers.SlugRelatedField(source='place', read_only=True, slug_field='slug')
    
    class Meta:
        model = Review
        fields = ("id", "place", "place_name", "place_slug", "rating", "comment", "author_name", "photo", "is_approved", "created_at")
    
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        request = self.context.get("request")
        if instance.photo:
            rep["photo"] = (
                abs_url_or_none(request, instance.photo.url) if request else instance.photo.url
            )
        return rep
class PlaceSerializer(serializers.ModelSerializer):
    media = MediaSerializer(many=True, read_only=True)
    avg_rating = serializers.SerializerMethodField()
    reviews = ReviewSerializer(many=True, read_only=True)

    class Meta:
        model = Place
        fields = [
            "id", "name", "slug", "category", "description", "address",
            "lat", "lng", "is_active", "media", "avg_rating", "reviews", "created_at"
        ]

    def get_avg_rating(self, obj):
        vals = obj.reviews.filter(is_approved=True).values_list("rating", flat=True)
        if not vals:
            return None
        return round(sum(vals) / len(vals), 2)

class EventSerializer(serializers.ModelSerializer):
    class Meta:
        model = Event
        fields = "__all__"

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = "__all__"

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        request = self.context.get("request")
        if instance.cover:
            rep["cover"] = (
                abs_url_or_none(request, instance.cover.url) if request else instance.cover.url
            )
        return rep


class PlaceSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = ['name', 'slug']

class ModerationReviewSerializer(serializers.ModelSerializer):
    place = PlaceSimpleSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ["id", "place", "rating", "comment", "author_name", "photo", "is_approved", "created_at"]
        read_only_fields = ["id", "place", "rating", "comment", "author_name", "photo", "created_at"]

    # CORRECCIÓN AQUÍ
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        request = self.context.get("request")
        if instance.photo:
            rep["photo"] = (
                abs_url_or_none(request, instance.photo.url) if request else instance.photo.url
            )
        return rep

class ContactInfoSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = ContactInfo
        fields = '__all__'
        
class GalleryItemSerializer(serializers.ModelSerializer):
    media_file_url = serializers.SerializerMethodField()

    class Meta:
        model = GalleryItem
        fields = ("id", "title", "media_type", "media_file", "media_file_url", "order", "is_active", "uploaded_at")
        read_only_fields = ("uploaded_at", "media_file_url")

    def get_media_file_url(self, obj):
        request = self.context.get("request")
        raw = obj.media_file.url if obj.media_file else None
        return abs_url_or_none(request, raw) if request else raw

    def to_representation(self, instance):
        rep = super().to_representation(instance)
        # por compatibilidad, asegura que media_file también sea absoluto
        request = self.context.get("request")
        if instance.media_file:
            rep["media_file"] = abs_url_or_none(request, instance.media_file.url) if request else instance.media_file.url
        return rep

    
def abs_url_or_none(request, url_value):
    if not url_value:
        return None
    url = str(url_value)
    if url.startswith("http://") or url.startswith("https://"):
        return url
    # Si viene como '/media/...' o 'posts/archivo.jpg'
    if url.startswith("/"):
        return request.build_absolute_uri(url)
    return request.build_absolute_uri("/" + url)