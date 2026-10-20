from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework.test import APIClient


class AuthenticationCompatibilityTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user = get_user_model().objects.create_user(
            email='lts-check@example.com', password='isolated-test-password',
            first_name='Prueba', last_name='LTS',
        )

    def test_login_refresh_and_authenticated_profile(self):
        response = self.client.post('/api/auth/login', {
            'email': self.user.email, 'password': 'isolated-test-password',
        }, format='json')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['user']['email'], self.user.email)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + response.data['access'])
        profile = self.client.get('/api/auth/me')
        self.assertEqual(profile.status_code, 200)
        self.assertEqual(profile.data['id'], self.user.pk)
        self.client.credentials()
        refresh = self.client.post('/api/auth/refresh', {
            'refresh': response.data['refresh'],
        }, format='json')
        self.assertEqual(refresh.status_code, 200)
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + refresh.data['access'])
        self.assertEqual(self.client.get('/api/auth/me').status_code, 200)

    def test_bad_credentials_and_anonymous_profile_are_rejected(self):
        self.assertEqual(self.client.get('/api/auth/me').status_code, 401)
        response = self.client.post('/api/auth/login', {
            'email': self.user.email, 'password': 'wrong-password',
        }, format='json')
        self.assertIn(response.status_code, (400, 401))

    def test_admin_login_and_authenticated_index_render(self):
        self.user.is_staff = self.user.is_superuser = True
        self.user.save()
        self.assertEqual(self.client.get('/admin/login/').status_code, 200)
        self.client.force_login(self.user)
        self.assertEqual(self.client.get('/admin/').status_code, 200)

    def test_services_require_authentication_only_for_private_list(self):
        from apps.services.models import Service
        Service.objects.create(name='Servicio LTS', description='Prueba',
                               price='10.00', category='test')
        response = self.client.get('/api/services/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]['name'], 'Servicio LTS')
        self.assertEqual(self.client.get('/api/services/private/').status_code, 401)
        self.client.force_authenticate(self.user)
        self.assertEqual(self.client.get('/api/services/private/').status_code, 200)
