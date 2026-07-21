from django.core.exceptions import ValidationError


def validate_file_size(file, max_mb=50):
    limit = max_mb * 1024 * 1024
    if file.size > limit:
        raise ValidationError(f"El archivo supera el tamaño máximo permitido ({max_mb}MB).")
