# Actualización a Django LTS — 2026-10-19

El backend publicado ejecuta **Django 5.2.18 LTS**. Se completaron las pruebas
aisladas, la revisión de migraciones de sólo lectura, la construcción y el
despliegue exclusivo del backend. Ambos dominios siguen respondiendo mediante
HTTPS del origen y Cloudflare.

## Versiones y compatibilidad

| Dependencia | Anterior | Actual | Motivo |
| --- | --- | --- | --- |
| Django | 5.0.3 | 5.2.18 | LTS soportada hasta abril de 2028; último parche 5.2 publicado al revisar |
| Django REST Framework | 3.15.1 | 3.18.3 | Compatibilidad con Django 5.2 y correcciones de seguridad de la rama actual |
| Simple JWT | 5.3.1 | 5.5.1 | Versión que incluye Django 5.2 en su matriz de pruebas |
| django-cors-headers | 4.3.1 | 4.7.0 | Primera versión con soporte declarado para Django 5.2 |

Python permanece en 3.12, PostgreSQL en 15 y psycopg2-binary en 2.9.9.
No se actualizaron Gunicorn, WhiteNoise, python-dotenv ni requests. No fue
necesario cambiar modelos, serializers, vistas ni la configuración productiva
para la compatibilidad. La configuración `STORAGES` ya estaba preparada.

Se revisaron las notas de Django 5.1 y 5.2 y los cambios de las dependencias.
DRF 3.18 cambia el formato de errores de serializers de listas; las vistas
actuales no implementan escrituras masivas mediante esos serializers. Se
comprobaron las respuestas utilizadas por la aplicación en las pruebas.
No se identificaron incompatibilidades importantes que impidieran desplegar.

Fuentes de los mantenedores consultadas:

- Versiones y soporte Django: https://www.djangoproject.com/download/
- Django 5.1: https://docs.djangoproject.com/en/5.2/releases/5.1/
- Django 5.2: https://docs.djangoproject.com/en/5.2/releases/5.2/
- DRF y correcciones de seguridad de octubre de 2026: https://www.django-rest-framework.org/community/release-notes/
- Matriz de pruebas Simple JWT 5.5.1: https://github.com/jazzband/djangorestframework-simplejwt/blob/v5.5.1/tox.ini
- CORS: https://github.com/adamchainz/django-cors-headers/blob/main/CHANGELOG.rst

## Pruebas antes de desplegar

Se conservó la imagen anterior con la etiqueta
`estarnet-backend:pre-django-lts-20261019`. Se ejecutó un contenedor temporal
basado en esa imagen, con el código candidato montado en sólo lectura, y se
instalaron allí los requirements nuevos. No se modificaron los paquetes del
contenedor publicado. El contenedor temporal usó la red bridge, sin acceso a
`estarnet_network`, sin volúmenes productivos y sin env_file de Compose.

El nuevo módulo `config.test_settings` fuerza SQLite en memoria y rutas
temporales para archivos, deshabilita notificaciones y utiliza una clave y un
hasher exclusivos de pruebas. No cambia SECRET_KEY ni el hasher de producción.
Las migraciones ejecutadas por el runner crearon únicamente esa base SQLite
temporal; nunca se ejecutaron contra PostgreSQL.

Comandos ejecutados dentro del contenedor temporal:

```sh
pip install --no-cache-dir -r requirements.txt
pip check
python manage.py collectstatic --settings=config.test_settings --noinput
python -Wd manage.py test apps --settings=config.test_settings --noinput -v 2
```

Resultado: **15 pruebas OK**, sin errores de compatibilidad ni advertencias de
deprecación durante la suite. Incluyen las 11 pruebas existentes de contacto y
notificaciones, más cuatro de autenticación/administración/servicios:

- Login JWT, perfil autenticado, refresh y uso del token renovado.
- Rechazo de credenciales incorrectas y acceso anónimo al perfil.
- Renderizado del login y del índice admin con usuario autorizado de prueba.
- Lista pública de servicios y protección de la lista privada.

Los errores 400/401 que aparecen en logs son respuestas esperadas por los tests.
No se enviaron notificaciones reales ni se crearon usuarios/contactos en la DB
productiva.

## Verificación de PostgreSQL y migraciones antes del reemplazo

Después de las pruebas se construyó sólo la imagen del backend:

```sh
docker compose build backend
```

Se verificó la imagen nueva mediante `docker compose run --rm --no-deps`,
sobrescribiendo el entrypoint y pasando
`PGOPTIONS=-c default_transaction_read_only=on`. Se confirmó desde PostgreSQL
que el valor `default_transaction_read_only` de la conexión era `on`. Ese ajuste
fue exclusivo del contenedor de comprobación, no del servicio publicado.

Resultados:

| Comprobación | Resultado |
| --- | --- |
| `python -m pip check` | Sin dependencias rotas |
| `manage.py check --deploy` | Sólo advertencia previa `security.W009` sobre SECRET_KEY |
| `manage.py showmigrations --plan` | Todas las migraciones aplicadas |
| `manage.py migrate --plan` | No planned migration operations |
| `manage.py makemigrations --check --dry-run` | No changes detected |
| Conexión desde Django | Correcta, 13 tablas |
| Plan calculado con MigrationExecutor | 0 migraciones pendientes |

**No se ejecutó `migrate` en producción**, ni se creó una DB de pruebas en
PostgreSQL. No se modificó el esquema restaurado.

## Despliegue y verificación HTTP

```sh
docker compose up -d --no-deps backend
docker compose exec -T backend python -m django --version
```

La versión en ejecución es `5.2.18`. El entrypoint recolectó 154 estáticos y
procesó 444 archivos; inició Gunicorn con tres workers y sin migraciones
automáticas. Sólo se reemplazó `panozosistemas-backend`; el frontend no necesitó
reinicio ni recarga.

Se comprobaron estas rutas para `panozosistemas.com.ar` y
`www.panozosistemas.com.ar`:

| Ruta | Frontend local 18081 | HTTPS origen 443 | HTTPS público Cloudflare |
| --- | --- | --- | --- |
| `/` | 200 | 200 | 200 |
| `/api/services/` | 200 | 200 | 200 |
| `/admin/login/` | 200 | 200 | 200 |
| `/static/admin/css/base.css` | 200 | 200 | 200 |

Total: 24 respuestas esperadas. En local se enviaron Host y
`X-Forwarded-Proto: https`; para el origen se utilizó `curl --resolve` a
127.0.0.1 con SNI del dominio; las pruebas públicas usaron resolución normal.
Todas las comprobaciones HTTPS verificaron certificados, sin `-k`.

Después del reemplazo se volvió a comprobar la conexión PostgreSQL de sólo
lectura desde el backend activo y `pip check`. PostgreSQL conservó su mismo ID
de contenedor y StartedAt, `2026-10-19T15:01:49.689957952Z`, y siguió saludable.
Los contenedores de Camera e IoT conservaron sus tiempos de ejecución; no se
operó sobre ellos.

`backend/.env` conserva la misma huella SHA-256 anterior al cambio, sin publicar
su contenido. No se modificaron SECRET_KEY, DNS, Cloudflare ni Nginx central.
No se hicieron commits ni push.

## Reversión disponible y pendientes

La imagen anterior permanece etiquetada; dado que no se modificó el esquema,
una reversión del backend no requiere cambios de DB:

```sh
docker image tag estarnet-backend:pre-django-lts-20261019 estarnet-backend:latest
docker compose up -d --no-deps --no-build backend
```

No se ejecutó esa reversión. Si se usa, dejar constancia y reconciliar después
los requirements del repositorio con la versión finalmente elegida; una nueva
construcción usaría los requirements LTS.

Pendientes previos, fuera del alcance de esta actualización:

- SECRET_KEY no se rotó durante la actualización LTS. Posteriormente se autorizó
  y ejecutó la rotación; ver `rotacion-secret-key-resultado.md`. La advertencia
  restante es W025 mientras dure la gracia del fallback anterior.
- Notificaciones continúan deshabilitadas hasta disponer de la integración real.
- Esta tarea no es una auditoría de seguridad completa del resto de las
  dependencias o de las imágenes del frontend.
- No se inició sesión con cuentas productivas; el flujo de login y administración
  autenticada se probó en la base temporal y el login público se verificó por HTTPS.
