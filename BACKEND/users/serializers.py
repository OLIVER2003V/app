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
        # La señal post_save (users/signals.py) ya crea el UserProfile con
        # get_or_create al guardar el User; llamar aquí a .create() de nuevo
        # violaba el unique constraint de la relación OneToOne y tiraba un
        # IntegrityError 500 cada vez que se registraba alguien.
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = role
        profile.save()
        return user


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Permite a un admin editar usuario/correo/contraseña/rol de otro
    usuario. Antes solo se podía cambiar el rol; no había forma de corregir
    un nombre de usuario mal escrito o resetear una contraseña sin entrar a
    Django Admin."""
    password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=UserProfile.Roles.choices, required=False)

    class Meta:
        model = User
        fields = ["username", "email", "first_name", "last_name", "password", "role"]

    def validate_username(self, value):
        qs = User.objects.filter(username=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Ese nombre de usuario ya está en uso.")
        return value

    def update(self, instance, validated_data):
        role = validated_data.pop("role", None)
        password = validated_data.pop("password", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        if password:
            instance.set_password(password)
        instance.save()
        if role:
            profile, _ = UserProfile.objects.get_or_create(user=instance)
            profile.role = role
            profile.save()
            # Refresca la relación cacheada por select_related en la vista;
            # sin esto la respuesta serializa el rol viejo.
            instance.profile = profile
        return instance
