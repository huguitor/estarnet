#!/bin/sh
set -e

mkdir -p /media/public /media/private /media/tmp
python manage.py migrate --noinput
python manage.py collectstatic --noinput

gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers ${GUNICORN_WORKERS:-3}
