from rest_framework import serializers
from .models import Place, Media, Event, Post, Review, ContactInfo, GalleryItem
import cloudinary
import cloudinary.uploader
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
    media_file_upload = serializers.FileField(write_only=True)

    class Meta:
        model = GalleryItem
        fields = ["id", "title", "media_type", "media_file_url", "media_file_upload", "order", "is_active"]
        read_only_fields = ["media_file_url"]

    def create(self, validated_data):
        # 1. Extraemos el archivo del diccionario de datos validados.
        file_to_upload = validated_data.pop('media_file_upload')
        
        # 2. Subimos el archivo a Cloudinary.
        try:
            upload_result = cloudinary.uploader.upload(file_to_upload)
            secure_url = upload_result.get('secure_url')
        except Exception as e:
            raise serializers.ValidationError(f"La subida a Cloudinary falló: {e}")

        # 3. Añadimos la URL obtenida al diccionario.
        validated_data['media_file_url'] = secure_url

        # 4. Creamos el objeto GalleryItem usando los datos ya limpios y correctos.
        return super().create(validated_data)