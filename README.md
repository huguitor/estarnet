# EstarNet - Django + React + Docker

Proyecto institucional listo para producción con backend Django/DRF + JWT y frontend React/Vite/Tailwind servido por Nginx.

## Requisitos
- Docker y Docker Compose
- (Opcional) Python 3.12 y Node 20 si deseas correr sin contenedores

## Variables de entorno
- Copiar `backend/.env.example` a `backend/.env` y ajustar claves/hosts.
- Copiar `frontend/.env.example` a `frontend/.env` si cambias el endpoint API.

## Levantar con Docker
```bash
docker-compose build
docker-compose up -d
```
Servicios:
- Frontend + Nginx: http://localhost
- Backend: http://localhost:8000 (internamente `backend:8000` para Nginx)
- PostgreSQL: puerto 5432 interno (ver variables en compose)

## Flujo de autenticación
- Registro: POST /api/auth/register
- Login: POST /api/auth/login (devuelve `access` y `refresh` JWT + datos de usuario)
- Refresh: POST /api/auth/refresh
- Perfil: GET /api/auth/me (requiere Bearer token)

## Endpoints principales
- Servicios públicos: GET /api/services/
- Servicios privados: GET /api/services/private/ (JWT)
- Contacto: POST /api/contact/

## Seguridad aplicada
- JWT via `djangorestframework-simplejwt`
- CORS + CSRF configurables por entorno
- Rate limiting DRF (`anon` y `user`)
- Headers de seguridad en Nginx
- Variables sensibles en `.env`
- Validaciones básicas en serializers y campos de modelos

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

## Próximos pasos sugeridos
- Configurar HTTPS (certbot o terminación TLS en LB) y activar HSTS.
- Añadir tests unitarios (pytest + DRF) y linters.
- Integrar envío de email en `apps.contact` (SMTP o servicio externalizado).
- Automatizar CI/CD y generación de imágenes en registry privado.
