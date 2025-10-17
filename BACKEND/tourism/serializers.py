from rest_framework import serializers
from .models import Place, Media, Event, Post, Review, ContactInfo, GalleryItem

class MediaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Media
        fields = ["id", "image", "caption", "created_at"]

class PlaceSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Place
        fields = ['name', 'slug']

# ▼▼▼ SERIALIZADOR CORREGIDO ▼▼▼
class ReviewSerializer(serializers.ModelSerializer):
    # Campos adicionales para mostrar el nombre y slug del lugar en las lecturas
    place_name = serializers.CharField(source='place.name', read_only=True)
    place_slug = serializers.SlugRelatedField(source='place', read_only=True, slug_field='slug')

    class Meta:
        model = Review
        fields = [
            "id", "place", "place_name", "place_slug", "rating", "comment", 
            "author_name", "photo", "is_approved", "created_at"
        ]
        # 'place' ahora es solo para escribir (recibe el ID al crear una opinión).
        # 'place_name' y 'place_slug' son solo para leer.
        extra_kwargs = {
            'place': {'write_only': True}
        }
        # 'is_approved' y 'created_at' son generados por el servidor
        read_only_fields = ["is_approved", "created_at"]

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

    def create(self, validated_data):
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            validated_data["created_by"] = request.user
        return super().create(validated_data)

class ModerationReviewSerializer(serializers.ModelSerializer):
    place = PlaceSimpleSerializer(read_only=True)

    class Meta:
        model = Review
        fields = ["id", "place", "rating", "comment", "author_name", "photo", "is_approved", "created_at"]
        read_only_fields = ["id", "place", "rating", "comment", "author_name", "photo", "created_at"]

# En tu archivo 'serializers.py'

class ContactInfoSerializer(serializers.ModelSerializer):
    # Opcional: para mostrar el nombre legible de la categoría
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = ContactInfo
        fields = '__all__'
        
# Add this new serializer to your serializers.py

class GalleryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = GalleryItem
        fields = ["id", "title", "media_type", "media_file", "order", "is_active"]

    def validate(self, attrs):
        f = attrs.get("media_file")
        mt = attrs.get("media_type")
        if f and mt == "IMAGE" and not f.content_type.startswith("image/"):
            raise serializers.ValidationError({"media_file": "Debe ser una imagen."})
        if f and mt == "VIDEO" and not f.content_type.startswith("video/"):
            raise serializers.ValidationError({"media_file": "Debe ser un video."})
        return attrs