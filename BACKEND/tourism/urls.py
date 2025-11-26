from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PlaceViewSet, EventViewSet, PostViewSet, PublicReviewViewSet, ModerationReviewViewSet, ContactInfoViewSet, GalleryItemViewSet, health_check

router = DefaultRouter()
router.register(r'places', PlaceViewSet, basename='place')
router.register(r'events', EventViewSet, basename='event')
router.register(r'posts', PostViewSet, basename='post')
router.register(r'reviews', PublicReviewViewSet, basename='review-public')        # /api/reviews/
router.register(r'moderation/reviews', ModerationReviewViewSet, basename='review')# /api/moderation/reviews/
router.register(r'contact', ContactInfoViewSet, basename='contact')
router.register(r'gallery', GalleryItemViewSet, basename='gallery')

urlpatterns = [
    path('', include(router.urls)),
    path('health/', health_check, name='health_check'),
]
