from datetime import datetime, timezone as datetime_timezone
from unittest.mock import MagicMock, patch
from uuid import uuid4

import requests
from django.db import connection, transaction
from django.test import TransactionTestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from .models import ContactMessage
from .notifications import notify_contact


@override_settings(
    NOTIFICATIONS_ENABLED=True,
    NOTIFICATIONS_API_URL='http://notifications.invalid:8000',
    NOTIFICATIONS_API_KEY='test-only.secret-never-real',
    NOTIFICATIONS_TO_EMAIL='recipient@example.com',
    NOTIFICATIONS_TO_NAME='Panozo Sistemas',
    NOTIFICATIONS_CONNECT_TIMEOUT=2,
    NOTIFICATIONS_READ_TIMEOUT=5,
    SECURE_SSL_REDIRECT=False,
    ALLOWED_HOSTS=['testserver'],
    TIME_ZONE='America/Argentina/Buenos_Aires',
)
class ContactNotificationTests(TransactionTestCase):
    def setUp(self):
        self.client = APIClient()
        self.form = {
            'name': 'Visitante privado', 'email': 'visitor@example.com',
            'phone': '2991234567', 'message': 'Mensaje privado de prueba.',
        }
        # Bloquear todo transporte real incluso ante una regresión del cliente.
        transport = patch('requests.sessions.Session.send',
                          side_effect=AssertionError('HTTP real prohibido'))
        self.transport = transport.start()
        self.addCleanup(transport.stop)
        post = patch('apps.contact.notifications.requests.post')
        self.post = post.start()
        self.addCleanup(post.stop)
        self.response = MagicMock(status_code=202)
        self.response.__enter__.return_value = self.response
        self.post.return_value = self.response
        self.response.json.side_effect = self.accepted_body
        throttle = patch('apps.contact.views.ContactCreateView.throttle_classes', [])
        throttle.start()
        self.addCleanup(throttle.stop)

    def tearDown(self):
        self.transport.assert_not_called()

    def accepted_body(self):
        return {
            'id': str(uuid4()), 'application': 'panozosistemas-web',
            'status': 'pendiente',
            'correlation_id': self.post.call_args.kwargs['json']['correlation_id'],
        }

    def submit(self, **changes):
        return self.client.post('/api/contact/', self.form | changes, format='json')

    def assert_saved(self, response):
        self.assertEqual(response.status_code, 201)
        contact = ContactMessage.objects.get(pk=response.data['id'])
        self.assertEqual(contact.message, self.form['message'])
        self.assertEqual(set(response.data),
                         {'id', 'name', 'email', 'phone', 'message', 'created_at'})
        return contact

    def test_valid_contact_is_committed_before_http(self):
        def check_commit(*args, **kwargs):
            self.assertFalse(connection.in_atomic_block)
            self.assertTrue(connection.get_autocommit())
            pk = int(kwargs['headers']['Idempotency-Key'].removeprefix('web-contacto-'))
            self.assertTrue(ContactMessage.objects.filter(pk=pk).exists())
            return self.response
        self.post.side_effect = check_commit
        self.assert_saved(self.submit())
        self.post.assert_called_once()

    @override_settings(NOTIFICATIONS_ENABLED=False)
    def test_disabled_saves_without_http(self):
        self.assert_saved(self.submit())
        self.post.assert_not_called()

    def test_payload_headers_date_and_repetition(self):
        timestamp = datetime(2026, 9, 9, 1, 2, 3, tzinfo=datetime_timezone.utc)
        with patch('django.utils.timezone.now', return_value=timestamp):
            contact = self.assert_saved(self.submit())
        call = self.post.call_args
        payload = call.kwargs['json']
        self.assertEqual(call.args, ('http://notifications.invalid:8000/api/v1/emails/',))
        self.assertEqual(call.kwargs['headers'], {
            'Authorization': 'Api-Key test-only.secret-never-real',
            'Idempotency-Key': f'web-contacto-{contact.pk}',
        })
        self.assertEqual(call.kwargs['timeout'], (2, 5))
        self.assertFalse(call.kwargs['allow_redirects'])
        self.assertEqual(payload, {
            'template': 'web.nueva_consulta', 'template_version': 1,
            'to': {'email': 'recipient@example.com', 'name': 'Panozo Sistemas'},
            'variables': {'nombre': contact.name, 'email': contact.email,
                          'telefono': contact.phone, 'mensaje': contact.message,
                          'fecha': '2026-09-08T22:02:03-03:00'},
            'correlation_id': f'consulta-{contact.pk}', 'metadata': {},
        })
        self.assertEqual(contact.created_at, timestamp)
        with timezone.override('UTC'):
            notify_contact(contact)
        self.assertEqual(self.post.call_args, call)

    def test_http_errors_keep_201_and_log_safely(self):
        for status, category in [
            (400, 'contrato_invalido'), (401, 'configuracion_autenticacion'),
            (403, 'configuracion_permisos'), (409, 'conflicto_idempotencia'),
            (404, 'plantilla_no_disponible'), (413, 'cuerpo_excesivo'),
            (415, 'formato_no_soportado'), (429, 'limite_solicitudes'),
            (500, 'servicio_temporal'), (503, 'servicio_temporal'),
            (302, 'respuesta_inesperada'),
        ]:
            with self.subTest(status=status):
                self.post.reset_mock()
                self.response.status_code = status
                with self.assertLogs('apps.contact.notifications', level='ERROR') as logs:
                    self.assert_saved(self.submit())
                self.assertIn(category, str(logs.output))
                self.assert_private_logs(logs)
                self.post.assert_called_once()

    def assert_private_logs(self, logs):
        output = str(logs.output)
        for private in [*self.form.values(), 'test-only.secret-never-real', 'Authorization']:
            self.assertNotIn(private, output)
        self.assertTrue(all(record.exc_info is None for record in logs.records))

    def test_transport_and_unexpected_errors_keep_201(self):
        for error, category in [
            (requests.Timeout, 'timeout_resultado_incierto'),
            (requests.ConnectionError, 'conexion_resultado_incierto'),
            (requests.RequestException, 'transporte'),
            (RuntimeError, 'cliente_inesperado'),
        ]:
            with self.subTest(error=error):
                self.post.reset_mock()
                self.post.side_effect = error(str(self.form) + ' Authorization test-only.secret-never-real')
                with self.assertLogs('apps.contact.notifications', level='ERROR') as logs:
                    self.assert_saved(self.submit())
                self.assertIn(category, str(logs.output))
                self.assert_private_logs(logs)
                self.post.assert_called_once()

    def test_malformed_202_keeps_201(self):
        for body in [None, [], {}, {'id': 'not-a-uuid'},
                     {'id': str(uuid4()), 'application': 'other',
                      'status': 'pendiente', 'correlation_id': 'wrong'}]:
            with self.subTest(body=body):
                self.response.json.side_effect = None
                self.response.json.return_value = body
                with self.assertLogs('apps.contact.notifications', level='ERROR') as logs:
                    self.assert_saved(self.submit())
                self.assertIn('respuesta_202_invalida', str(logs.output))
        self.response.json.side_effect = ValueError('private response')
        with self.assertLogs('apps.contact.notifications', level='ERROR'):
            self.assert_saved(self.submit())

    def test_contract_limits_reject_before_save(self):
        for changes in [
            {'message': 'x' * 8001}, {'message': 'short'},
            {'message': '😀' * 5000}, {'name': 'x' * 151},
            {'email': 'a' * 250 + '@example.com'}, {'phone': '1' * 31},
        ]:
            with self.subTest(changes=list(changes)):
                self.assertEqual(self.submit(**changes).status_code, 400)
        self.assertEqual(ContactMessage.objects.count(), 0)
        self.post.assert_not_called()

    @override_settings(NOTIFICATIONS_ENABLED=False)
    def test_8000_characters_and_optional_phone_are_accepted(self):
        data = self.form | {'message': 'x' * 8000}
        data.pop('phone')
        response = self.client.post('/api/contact/', data, format='json')
        self.assertEqual(response.status_code, 201)
        self.assertEqual(ContactMessage.objects.get().phone, '')

    def test_outer_transaction_defers_http_until_commit(self):
        with transaction.atomic():
            response = self.submit()
            self.assertEqual(response.status_code, 201)
            self.post.assert_not_called()
        self.post.assert_called_once()

    def test_rollback_discards_notification(self):
        with transaction.atomic():
            self.assertEqual(self.submit().status_code, 201)
            transaction.set_rollback(True)
        self.assertFalse(ContactMessage.objects.exists())
        self.post.assert_not_called()

    @override_settings(NOTIFICATIONS_API_KEY='')
    def test_missing_configuration_keeps_201_without_http(self):
        with self.assertLogs('apps.contact.notifications', level='ERROR'):
            self.assert_saved(self.submit())
        self.post.assert_not_called()
