from django.contrib import admin
from .models import Place, Media, Event, Post, Review, ContactInfo, GalleryItem, SiteSettings
admin.site.register([Place, Media, Event, Post, Review, ContactInfo, GalleryItem])
admin.site.register(SiteSettings)
