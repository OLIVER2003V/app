from rest_framework import serializers
from .models import Place, Media, Event, Post, Review, ContactInfo, GalleryItem

class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ["id", "image", "caption", "created_at"]

    # CORRECCIÓN AQUÍ
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.image:
            rep['image'] = instance.image.url
        return rep

class ReviewSerializer(serializers.ModelSerializer):
    place_name = serializers.CharField(source='place.name', read_only=True)
    place_slug = serializers.SlugRelatedField(source='place', read_only=True, slug_field='slug')

    class Meta:
        model = Review
        fields = [
            "id", "place", "place_name", "place_slug", "rating", "comment", 
            "author_name", "photo", "is_approved", "created_at"
        ]
        extra_kwargs = {
            'place': {'write_only': True}
        }
        read_only_fields = ["is_approved", "created_at"]

    # CORRECCIÓN AQUÍ
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.photo:
            rep['photo'] = instance.photo.url
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
        read_only_fields = ["created_by", "created_at"]

    # CORRECCIÓN AQUÍ
    def to_representation(self, instance):
        rep = super().to_representation(instance)
        if instance.cover:
            rep['cover'] = instance.cover.url
        return rep

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            validated_data["created_by"] = request.user
        return super().create(validated_data)

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
        if instance.photo:
            rep['photo'] = instance.photo.url
        return rep

class ContactInfoSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = ContactInfo
        fields = '__all__'
        
class GalleryItemSerializer(serializers.ModelSerializer):
    # Añadimos un campo de solo escritura para recibir el archivo
    media_file_upload = serializers.FileField(write_only=True)

    class Meta:
        model = GalleryItem
        # Actualiza los campos para usar la nueva URL y el campo de subida
        fields = ["id", "title", "media_type", "media_file_url", "media_file_upload", "order", "is_active"]
        # Hacemos que la URL sea de solo lectura, ya que la generaremos nosotros
        read_only_fields = ["media_file_url"]