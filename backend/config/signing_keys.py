"""Validación de configuración de firmas sin incluir valores en errores."""
import json

from django.core.exceptions import ImproperlyConfigured


def load_signing_keys(environ):
    def required(name):
        value = environ.get(name)
        if not isinstance(value, str) or not value.strip():
            raise ImproperlyConfigured(f'{name} debe estar configurada y no vacía.')
        return value

    django_key = required('DJANGO_SECRET_KEY')
    jwt_key = required('JWT_SIGNING_KEY')
    try:
        fallbacks = json.loads(environ.get('DJANGO_SECRET_KEY_FALLBACKS_JSON', '[]'))
    except (ValueError, TypeError):
        raise ImproperlyConfigured('DJANGO_SECRET_KEY_FALLBACKS_JSON inválido.') from None
    if (not isinstance(fallbacks, list)
            or any(not isinstance(key, str) or not key.strip() for key in fallbacks)):
        raise ImproperlyConfigured('Los fallbacks deben ser una lista de claves no vacías.')
    if len(set(fallbacks)) != len(fallbacks) or django_key in fallbacks:
        raise ImproperlyConfigured('Los fallbacks deben ser únicos y distintos de la clave activa.')
    return django_key, jwt_key, fallbacks
