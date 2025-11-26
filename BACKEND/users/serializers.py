from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["role", "display_name", "phone"]

class UserSerializer(serializers.ModelSerializer):
    # Agregamos allow_null=True por seguridad
    profile = UserProfileSerializer(read_only=True, allow_null=True) 

    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "profile"]

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=UserProfile.Roles.choices, default=UserProfile.Roles.EDITOR)

    class Meta:
        model = User
        fields = ["username", "email", "password", "role"]

    def create(self, validated_data):
        role = validated_data.pop("role", UserProfile.Roles.EDITOR)
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user, role=role)
        return user
