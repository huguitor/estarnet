"""Pruebas aisladas: nunca conectar el runner a PostgreSQL de producción."""
import os

os.environ.setdefault('DJANGO_SECRET_KEY', 'synthetic-django-test-key-' + 'd' * 64)
os.environ.setdefault('JWT_SIGNING_KEY', 'synthetic-jwt-test-key-' + 'j' * 64)
os.environ.setdefault('POSTGRES_PASSWORD', 'synthetic-database-password-for-tests')
from .settings import *  # noqa: F403

DATABASES = {'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'}}
SECRET_KEY = 'test-only-key-for-isolated-django-tests-never-production-123456789'
SECRET_KEY_FALLBACKS = []
SIMPLE_JWT = {**SIMPLE_JWT, 'SIGNING_KEY': 'synthetic-jwt-test-key-' + 'j' * 64}  # noqa: F405
ALLOWED_HOSTS = ['testserver', 'localhost']
SECURE_SSL_REDIRECT = False
NOTIFICATIONS_ENABLED = False
PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']
STATIC_ROOT = '/tmp/estarnet-test-static'
MEDIA_ROOT = '/tmp/estarnet-test-media/private'
PUBLIC_MEDIA_ROOT = '/tmp/estarnet-test-media/public'
