#!/bin/sh
# Ejecutar mediante sudo desde una terminal con autenticación disponible.
# Sólo instala el virtual host de Panozo; nunca emite certificados ni cambia DNS.
set -eu
[ "$(id -u)" = 0 ] || { echo 'Se requiere sudo.' >&2; exit 1; }
project_dir=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
available=/etc/nginx/sites-available/panozosistemas.com.ar
enabled=/etc/nginx/sites-enabled/panozosistemas.com.ar
case "${1:-}" in
    preparar)
        [ ! -e "$available" ] && [ ! -L "$available" ] &&
        [ ! -e "$enabled" ] && [ ! -L "$enabled" ] || {
            echo 'Ya existe el virtual host; revisar antes de reemplazar.' >&2; exit 1;
        }
        /usr/sbin/nginx -t
        # Revisar conflictos exactos en la configuración efectiva antes de escribir.
        if /usr/sbin/nginx -T 2>/dev/null | sed 's/#.*//' | grep -Eq 'server_name[^;]*(^|[[:space:]])(www\.)?panozosistemas\.com\.ar([[:space:];]|$)'; then
            echo 'Dominio ya declarado; no se instala.' >&2; exit 1
        fi
        install -d -m 0755 /var/www/letsencrypt-panozosistemas/.well-known/acme-challenge
        printf '%s\n' 'panozosistemas-ovh-40.160.233.73' > /var/www/letsencrypt-panozosistemas/.well-known/acme-challenge/estarnet-ready
        chmod 0644 /var/www/letsencrypt-panozosistemas/.well-known/acme-challenge/estarnet-ready
        install -m 0644 "$project_dir/nginx/central-panozosistemas-http.conf" "$available"
        ln -s "$available" "$enabled"
        if ! /usr/sbin/nginx -t; then
            unlink "$enabled"
            echo 'No se recargó Nginx; nuevo virtual host deshabilitado.' >&2
            exit 1
        fi
        systemctl reload nginx
        # La recarga puede retornar antes de que los nuevos workers atiendan.
        # Un 404 transitorio del vhost anterior no debe invalidar la preparación.
        for domain in panozosistemas.com.ar www.panozosistemas.com.ar; do
            curl --noproxy '*' --fail --silent --show-error --retry 5 --retry-all-errors --retry-delay 1 --retry-max-time 15 --max-time 3 --resolve "$domain:80:127.0.0.1" "http://$domain/.well-known/acme-challenge/estarnet-ready" | grep -Fx 'panozosistemas-ovh-40.160.233.73'
        done
        echo 'HTTP-01 preparado localmente. Verificar acceso público antes del cambio DNS.'
        ;;
    activar-https)
        [ "$(readlink "$enabled")" = "$available" ] || { echo 'Enlace inesperado.' >&2; exit 1; }
        cmp -s "$available" "$project_dir/nginx/central-panozosistemas-http.conf" || {
            echo 'El virtual host cambió; revisar manualmente.' >&2; exit 1;
        }
        test -s /etc/letsencrypt/live/panozosistemas.com.ar/fullchain.pem
        test -s /etc/letsencrypt/live/panozosistemas.com.ar/privkey.pem
        /usr/sbin/nginx -t
        install -m 0644 "$project_dir/nginx/central-panozosistemas-https.conf" "$available"
        if ! /usr/sbin/nginx -t; then
            install -m 0644 "$project_dir/nginx/central-panozosistemas-http.conf" "$available"
            echo 'Se restauró la etapa HTTP sin recargar.' >&2
            exit 1
        fi
        systemctl reload nginx
        for domain in panozosistemas.com.ar www.panozosistemas.com.ar; do
            curl --noproxy '*' --fail --silent --show-error --resolve "$domain:443:127.0.0.1" "https://$domain/" -o /dev/null
            curl --noproxy '*' --fail --silent --show-error --resolve "$domain:443:127.0.0.1" "https://$domain/api/services/" -o /dev/null
        done
        echo 'HTTPS local verificado con certificado confiable. Falta comprobar desde Internet.'
        ;;
    *) echo "Uso: sudo sh $0 preparar|activar-https" >&2; exit 1 ;;
esac
