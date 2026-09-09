"""Solicitud best-effort posterior al commit; no realiza reintentos."""
import logging
from uuid import UUID

import requests
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)
TEMPLATE = 'web.nueva_consulta'
REMOTE_STATES = {
    'pendiente', 'procesando', 'esperando_reintento', 'aceptado_smtp',
    'fallido', 'resultado_incierto',
}
HTTP_ERRORS = {
    400: 'contrato_invalido', 401: 'configuracion_autenticacion',
    403: 'configuracion_permisos', 404: 'plantilla_no_disponible',
    409: 'conflicto_idempotencia', 413: 'cuerpo_excesivo',
    415: 'formato_no_soportado', 429: 'limite_solicitudes',
}


def notify_contact(contact):
    """Nunca propaga fallos de notificación a la consulta ya persistida.

    El UUID remoto se registra en logs, no en DB. Un timeout es incierto;
    cualquier repetición futura exige la misma clave y el mismo payload
    (incluyendo destinatario/configuración y datos de la consulta).
    """
    if not settings.NOTIFICATIONS_ENABLED:
        return
    correlation_id = f'consulta-{contact.pk}'

    def log_error(category, status=None):
        # No incluir excepciones, headers, cuerpos ni datos del visitante.
        logger.error(
            'contact_notification contact_id=%s correlation_id=%s template=%s '
            'error=%s http_status=%s',
            contact.pk, correlation_id, TEMPLATE, category, status,
        )

    try:
        if not (settings.NOTIFICATIONS_API_URL and settings.NOTIFICATIONS_API_KEY
                and settings.NOTIFICATIONS_TO_EMAIL):
            log_error('configuracion_incompleta')
            return
        created_at = contact.created_at
        if timezone.is_aware(created_at):
            created_at = timezone.localtime(created_at, timezone.get_default_timezone())
        payload = {
            'template': TEMPLATE,
            'template_version': 1,
            'to': {'email': settings.NOTIFICATIONS_TO_EMAIL,
                   'name': settings.NOTIFICATIONS_TO_NAME},
            'variables': {
                'nombre': contact.name, 'email': contact.email,
                'telefono': contact.phone, 'mensaje': contact.message,
                'fecha': created_at.isoformat(timespec='seconds'),
            },
            'correlation_id': correlation_id,
            'metadata': {},
        }
        with requests.post(
            settings.NOTIFICATIONS_API_URL.rstrip('/') + '/api/v1/emails/',
            headers={'Authorization': f'Api-Key {settings.NOTIFICATIONS_API_KEY}',
                     'Idempotency-Key': f'web-contacto-{contact.pk}'},
            json=payload,
            timeout=(settings.NOTIFICATIONS_CONNECT_TIMEOUT,
                     settings.NOTIFICATIONS_READ_TIMEOUT),
            allow_redirects=False,
        ) as response:
            if response.status_code != 202:
                category = HTTP_ERRORS.get(response.status_code, 'respuesta_inesperada')
                if 500 <= response.status_code < 600:
                    category = 'servicio_temporal'
                log_error(category, response.status_code)
                return
            try:
                data = response.json()
                remote_id = str(UUID(data['id']))
                if (data['application'] != 'panozosistemas-web'
                        or data['correlation_id'] != correlation_id
                        or data['status'] not in REMOTE_STATES):
                    raise ValueError
            except (ValueError, TypeError, KeyError, AttributeError):
                log_error('respuesta_202_invalida', 202)
                return
        logger.info(
            'contact_notification contact_id=%s correlation_id=%s template=%s '
            'http_status=202 remote_id=%s result=aceptada',
            contact.pk, correlation_id, TEMPLATE, remote_id,
        )
    except requests.Timeout:
        log_error('timeout_resultado_incierto')
    except requests.ConnectionError:
        log_error('conexion_resultado_incierto')
    except requests.RequestException:
        log_error('transporte')
    except Exception:
        # Frontera best-effort: también aislar fallos inesperados del cliente.
        log_error('cliente_inesperado')
