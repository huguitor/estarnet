# Panozo Sistemas (EstarNet) – Django + React + Docker

Stack productivo con backend Django/DRF + JWT y frontend React/Vite/Tailwind servido por Nginx, empaquetado en Docker.

## Requisitos
- Docker y Docker Compose
- (Opcional) Python 3.12 y Node 20 si quieres correr sin contenedores

## Variables de entorno
- Copiar `backend/.env.example` → `backend/.env` y ajustar:
  - `DJANGO_SECRET_KEY`, `DJANGO_ALLOWED_HOSTS`, DB y JWT.
  - `MEDIA_ROOT=/media` y `PUBLIC_MEDIA_ROOT=/media/public` (montados por Docker).
- Copiar `frontend/.env.example` → `frontend/.env` si cambias el endpoint API.

## Estructura rápida
- `backend/`: Django + DRF. `entrypoint.sh` crea `/media/public`, `/media/private`, `/media/tmp` al arrancar.
- `frontend/`: React/Vite/Tailwind. Navbar usa `src/assets/logo_Nico.png`.
- `nginx/default.conf`: reverse proxy, TLS, CSP, rutas `/media/public/` (público) y `/media/private/` (internal con X-Accel-Redirect).
- `docker-compose.yml`: servicios `db`, `backend`, `frontend`; volumen `media_storage` montado en `/media`.

## Medios (archivos)
- Volumen: `media_storage` (ruta host: `/var/lib/docker/volumes/estarnet_media_storage/_data/`).
- Públicos: copiar a `public/` → accesibles via `https://<dominio>/media/public/...`.
- Privados: guardar en `private/`; solo se entregan vía vista Django que envía `X-Accel-Redirect` a `/media/private/...`.
- Temporales: `tmp/` para cargas en curso (limpieza con cron/command).
- Nginx permite hasta `50m` por carga (`client_max_body_size`).

## Despliegue con Docker
```bash
docker compose build
docker compose up -d
```
Servicios:
- Frontend + Nginx: http://localhost (80/443)
- Backend: http://localhost:8000 (internamente `backend:8000`)
- PostgreSQL: 5432 interno (ver variables en compose)

## Endpoints clave
- Auth: POST `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh`; GET `/api/auth/me`
- Servicios públicos: GET `/api/services/`
- Servicios privados: GET `/api/services/private/` (JWT)
- Contacto: POST `/api/contact/`

## Contacto de la empresa (público)
- **Panozo Sistemas**
- Dirección: Rosa Alaniz 470 (8300) Neuquén Capital - Argentina
- Teléfono: +54 2995214846
- Email: panozoelectronica@gmail.com

## Desarrollo local sin Docker (opcional)
```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend
cd ../frontend
npm install
npm run dev
```

## Seguridad aplicada
- JWT con `djangorestframework-simplejwt`
- CORS/CSRF configurables por entorno
- Rate limiting DRF (`anon`, `user`)
- CSP y headers duros en Nginx
- Medios privados servidos con X-Accel-Redirect
- Variables sensibles fuera del repo (`.env`)

## Próximos pasos sugeridos
- Configurar backup del volumen `media_storage` y de la base de datos.
- Añadir antivirus en uploads (ClamAV) y validación de tipos/MIME.
- Agregar tests (pytest + DRF) y linting CI.
- Automatizar despliegue/renovación TLS (certbot o terminación en LB).
