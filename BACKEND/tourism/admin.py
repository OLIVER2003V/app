from django.contrib import admin
from .models import Place, Media, Event, Post, Review, ContactInfo
admin.site.register([Place, Media, Event, Post, Review, ContactInfo])
