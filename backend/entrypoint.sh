#!/bin/sh
set -e

mkdir -p /media/public /media/private /media/tmp
# Las migraciones se revisan y ejecutan explícitamente durante el despliegue.
python manage.py collectstatic --noinput

exec gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers ${GUNICORN_WORKERS:-3}
