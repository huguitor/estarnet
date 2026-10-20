from django.contrib.auth import get_user_model
from django.core import signing
from django.core.exceptions import ImproperlyConfigured
from django.test import SimpleTestCase, TestCase, override_settings
from rest_framework_simplejwt.backends import TokenBackend
from rest_framework_simplejwt.exceptions import TokenBackendError

from .signing_keys import load_signing_keys

OLD = 'synthetic-old-key-' + 'o' * 64
NEW = 'synthetic-new-django-key-' + 'd' * 64
JWT = 'synthetic-new-jwt-key-' + 'j' * 64


class SigningConfigurationTests(SimpleTestCase):
    def env(self, **changes):
        return {'DJANGO_SECRET_KEY': NEW, 'JWT_SIGNING_KEY': JWT, **changes}

    def test_separate_keys_and_empty_default_fallbacks(self):
        self.assertEqual(load_signing_keys(self.env()), (NEW, JWT, []))

    def test_old_key_is_read_from_json(self):
        import json
        self.assertEqual(load_signing_keys(self.env(
            DJANGO_SECRET_KEY_FALLBACKS_JSON=json.dumps([OLD]))), (NEW, JWT, [OLD]))

    def test_missing_or_empty_keys_fail_without_values_in_error(self):
        for name in ['DJANGO_SECRET_KEY', 'JWT_SIGNING_KEY']:
            for value in [None, '', '   ']:
                with self.subTest(name=name, value=value):
                    with self.assertRaises(ImproperlyConfigured) as error:
                        load_signing_keys(self.env(**{name: value}))
                    self.assertNotIn(NEW, str(error.exception))
                    self.assertNotIn(JWT, str(error.exception))

    def test_invalid_json_types_duplicates_and_primary_are_rejected_safely(self):
        import json
        for value in ['not-json-secret', 'null', '{}', '"secret"', '[1]',
                      '[""]', '[" "]', json.dumps([OLD, OLD]), json.dumps([NEW])]:
            with self.subTest(case_type=type(value).__name__):
                with self.assertRaises(ImproperlyConfigured) as error:
                    load_signing_keys(self.env(DJANGO_SECRET_KEY_FALLBACKS_JSON=value))
                for secret in [NEW, JWT, OLD, value]:
                    self.assertNotIn(secret, str(error.exception))

    def test_django_fallback_does_not_validate_old_jwt(self):
        with override_settings(SECRET_KEY=OLD, SECRET_KEY_FALLBACKS=[]):
            old_signature = signing.dumps({'test': True})
        old_token = TokenBackend(algorithm='HS256', signing_key=OLD).encode({'test': True})
        with override_settings(SECRET_KEY=NEW, SECRET_KEY_FALLBACKS=[OLD]):
            self.assertEqual(signing.loads(old_signature), {'test': True})
            with self.assertRaises(TokenBackendError):
                TokenBackend(algorithm='HS256', signing_key=JWT).decode(old_token)
            new_signature = signing.dumps({'test': 'new'})
        with override_settings(SECRET_KEY=NEW, SECRET_KEY_FALLBACKS=[]):
            with self.assertRaises(signing.BadSignature):
                signing.loads(old_signature)
            self.assertEqual(signing.loads(new_signature), {'test': 'new'})


class AdminSessionRotationTests(TestCase):
    def test_old_session_is_preserved_and_renewed_during_grace(self):
        user = get_user_model().objects.create_superuser(
            email='rotation-test@example.com', password='synthetic-test-password')
        with override_settings(SECRET_KEY=OLD, SECRET_KEY_FALLBACKS=[]):
            self.client.force_login(user)
            old_session_id = self.client.session.session_key
        with override_settings(SECRET_KEY=NEW, SECRET_KEY_FALLBACKS=[OLD]):
            self.assertEqual(self.client.get('/admin/').status_code, 200)
            self.assertNotEqual(self.client.session.session_key, old_session_id)
        with override_settings(SECRET_KEY=NEW, SECRET_KEY_FALLBACKS=[]):
            self.assertEqual(self.client.get('/admin/').status_code, 200)
