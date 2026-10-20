# Migración al VPS — 2026-10-19

> Estado posterior verificado: sitio publicado mediante HTTPS y Cloudflare para
> ambos dominios. Backend actualizado a Django 5.2.18 LTS; 15 pruebas aisladas y
> 24 comprobaciones HTTP correctas, sin migraciones pendientes. Detalles en
> [actualizacion-django-lts.md](actualizacion-django-lts.md). Las secciones de
> preparación y diagnóstico siguientes conservan el historial previo a publicar.

## Estado comprobado y límites

**Backend y frontend construidos, iniciados y verificados por HTTP local.**
PostgreSQL 15 está saludable; Django se conecta correctamente y cuenta 13 tablas.
No hay migraciones pendientes ni cambios de modelos sin migración.

El acceso inicial fallaba porque el proceso de Codex tenía grupos de sesión
antiguos. Fuera del sandbox, `id` no incluía docker aunque `getent group docker`
sí incluía a hugo. Se resolvió ejecutando `sg docker -c 'docker …'` fuera del
sandbox, con autorización, sin sudo ni cambios de permisos. Los comandos Docker
restantes de este documento pueden ejecutarse directamente desde una sesión de
hugo con el grupo docker activo, o mediante esa misma envoltura autorizada.

No se modificaron DNS, Cloudflare, Nginx central ni otros proyectos. No se
ejecutaron migraciones, restauraciones, commits ni push. Los `.env` tienen modo
0600 y las credenciales PostgreSQL coinciden entre ambos archivos, sin exponerlas.

## Configuración aplicada

- Compose conserva los volúmenes externos y `estarnet_network`. Se retira la
  dependencia de `panozo_notifications_clients` y se fuerza
  `NOTIFICATIONS_ENABLED=false` en el backend. No se crea un servicio ficticio.
  La configuración original de notificaciones permanece en el `.env` privado.
- Frontend publica únicamente `127.0.0.1:18081:80`; backend continúa interno.
  La publicación en loopback fue comprobada tras el arranque.
- El entrypoint ya no aplica migraciones automáticamente. Conserva collectstatic
  y usa `exec gunicorn` para recibir correctamente las señales de Docker.
- Nginx del frontend envía `/api/`, `/admin/` y `/static/` a Django. WhiteNoise
  sirve los estáticos recolectados dentro del backend. Se utiliza `STORAGES`,
  evitando la configuración de almacenamiento obsoleta al actualizar Django.
- El esquema reenviado llega desde el proxy central, con fallback al esquema
  local. Para probar Django con SSL redirect activado se requiere el encabezado
  `X-Forwarded-Proto: https` desde loopback. El frontend usa API del mismo origen.
- Media privada permanece `internal`; media pública se sirve desde el volumen
  compartido de sólo lectura en frontend.
- `nginx/central-panozosistemas.conf.example` es una plantilla INACTIVA. Refleja
  el listener TLS local observado en otros sitios, pero requiere confirmar la
  topología y aportar certificados válidos. No debe instalarse tal como está.

## Validaciones realizadas

- Construcción Docker de `estarnet-backend` y `estarnet-frontend`: correcta.
- Arranque: `docker compose up -d --no-deps backend frontend`. No se actuó
  sobre el servicio db ni otros proyectos.
- PostgreSQL conserva el mismo ID de contenedor y `StartedAt`
  (`2026-10-19T15:01:49.689957952Z`) antes y después del despliegue; health healthy.
- Django: conexión real OK, 13 tablas; `showmigrations --plan` marca todas
  aplicadas; `migrate --plan` no tiene operaciones; `makemigrations --check
  --dry-run` no detecta cambios. No se ejecutó `migrate` ni se cambió el esquema.
- `check --deploy`: sólo advertencia `security.W009` por SECRET_KEY. No se rotó.
- Notificaciones efectivamente deshabilitadas en settings del contenedor.
- Collectstatic: 162 archivos copiados y 466 procesados. Gunicorn arrancó con
  tres workers. El Nginx del frontend pasó `nginx -t`.
- Backend directo, dentro de su contenedor: `/api/services/` devuelve JSON 200.
- Compose, sintaxis Python/shell y `git diff --check`: correctos.
- Además se había compilado el frontend en una copia temporal fuera del repo;
  la construcción Docker posterior también compiló correctamente los 105 módulos.

Pruebas HTTP mediante `127.0.0.1:18081`, con Host de cada uno de los dos dominios
y `X-Forwarded-Proto: https`:

| Ruta | Resultado en ambos dominios |
| --- | --- |
| `/` | 200 HTML |
| `/servicios` | 200 HTML, fallback SPA |
| `/api/services/` | 200 JSON, consulta real a PostgreSQL |
| `/admin/login/` | 200 HTML |
| `/static/admin/css/base.css` | 200 CSS |
| `/api/auth/me` sin token | 401 JSON, esperado |
| `/media/private/no-publicar` | 404, esperado |

No se probaron credenciales de usuario ni escrituras de contacto. Los 401 de
estas comprobaciones aparecen como warnings esperados en logs.

## Multimedia

`/home/hugo/estarnet-media.tar.gz` pesa 210 bytes. Su índice sólo contiene
directorios vacíos: `public`, `private`, `tmp`, `cdrom`, `usb`, `floppy`.
No contiene archivos multimedia recuperables. No se extrajo sobre el volumen
existente: se montó éste en un contenedor temporal sin red y en sólo lectura,
y se confirmó que contiene cero archivos.
Si se esperaban imágenes o documentos, conseguir otro respaldo desde el origen.
El entrypoint crea los directorios necesarios sin eliminar archivos existentes.

## Comandos de verificación y futuros despliegues

Ejecutar desde `/srv/panozosistemas/estarnet`, con una cuenta autorizada. No usar
`down -v`, `volume rm`, `flush`, ni recrear la base. Los comandos `run` usan
`--entrypoint python` para evitar el arranque habitual y `--no-deps` para no
alterar PostgreSQL.

```sh
docker ps --format '{{.Names}}\t{{.Status}}\t{{.Ports}}'
docker network inspect estarnet_network
docker volume inspect estarnet_db_data estarnet_media_storage
ss -ltn '( sport = :18081 )'
docker compose config --quiet
docker inspect --format '{{.State.Status}}' panozosistemas-db
docker exec panozosistemas-db sh -c 'pg_isready -U "$POSTGRES_USER" -d "$POSTGRES_DB"'
docker compose build backend frontend
docker compose run --rm --no-deps --entrypoint python backend manage.py check --deploy
docker compose run --rm --no-deps --entrypoint python backend manage.py showmigrations --plan
docker compose run --rm --no-deps --entrypoint python backend manage.py migrate --plan
docker compose run --rm --no-deps --entrypoint python backend manage.py makemigrations --check --dry-run
docker compose run --rm --no-deps --entrypoint python backend manage.py shell -c 'from django.db import connection; connection.ensure_connection(); print("DB OK; tablas:", len(connection.introspection.table_names()))'
```

Revisar todo el plan y su SQL antes de aplicar cualquier migración pendiente,
comparándolo con el esquema restaurado. Hacer un respaldo con `pg_dump` antes
de cambiar el esquema. No usar `--fake` automáticamente. Si hay operaciones
destructivas, detener esa parte y revisarlas; no ejecutar `migrate` a ciegas.
Si no hay migraciones pendientes, no se necesita ejecutar `migrate`.

El arranque se realizó después de verificar el backend contra la base existente.
Para futuros despliegues, conservar ese orden:

```sh
docker compose up -d --no-deps backend frontend
docker compose ps
docker compose logs --tail=80 backend frontend
curl -fsS -H 'Host: panozosistemas.com.ar' http://127.0.0.1:18081/ -o /dev/null
curl -fsS -H 'Host: panozosistemas.com.ar' -H 'X-Forwarded-Proto: https' http://127.0.0.1:18081/api/services/
curl -sSI -H 'Host: www.panozosistemas.com.ar' -H 'X-Forwarded-Proto: https' http://127.0.0.1:18081/admin/login/
curl -sSI -H 'Host: panozosistemas.com.ar' -H 'X-Forwarded-Proto: https' http://127.0.0.1:18081/static/admin/css/base.css
curl -sSI -H 'Host: panozosistemas.com.ar' http://127.0.0.1:18081/media/private/no-publicar
```

Se espera HTML 200 en `/`, JSON 200 en servicios, login y CSS 200 y 404 en
media privada. Probar los dos hosts, una ruta SPA y un archivo público real si
existe. No enviar consultas de contacto de prueba sin acordarlo: se guardan en DB.

## Prueba antes del DNS y Nginx central

Los contenedores ya están iniciados. Desde la PC del operador:

```sh
ssh -N -L 18081:127.0.0.1:18081 hugo@IP_DEL_VPS
curl -fsS -H 'Host: panozosistemas.com.ar' -H 'X-Forwarded-Proto: https' http://127.0.0.1:18081/api/services/
```

`http://localhost:18081/` permite comprobar el frontend por túnel. Las peticiones
API desde ese navegador se redirigirán a HTTPS por la configuración productiva;
el curl anterior permite comprobar la API sin cambiar esa configuración. Para
una prueba completa con navegador se necesita un proxy TLS de pruebas con
certificado válido y resolución local de ambos dominios.

La publicación mediante el nuevo virtual host fue autorizada posteriormente.
El operador instaló la etapa HTTP; HTTP-01 fue verificado. Ver las secciones
de publicación y diagnóstico al final. Con el listener TLS instalado y un certificado válido:

```sh
curl --resolve panozosistemas.com.ar:8443:127.0.0.1 https://panozosistemas.com.ar:8443/
curl --resolve www.panozosistemas.com.ar:8443:127.0.0.1 https://www.panozosistemas.com.ar:8443/api/services/
```

Estos comandos no cambian DNS. Una entrada local en hosts por sí sola no alcanza
si todavía no existe un listener TLS que atienda esos nombres.

## Seguridad y pendientes antes de publicar

- Durante la preparación Django estaba fijado en 5.0.3, rama fuera de soporte desde abril de 2025:
  https://www.djangoproject.com/weblog/2025/apr/02/django-52-released/ . Actualizar
  a una rama con soporte era un pendiente. Resuelto posteriormente con Django
  5.2.18 LTS: ver el documento de actualización y sus verificaciones.
- Revisar las demás dependencias y la imagen Nginx 1.25, antiguas. La construcción
  Docker pasó; no se realizó un análisis completo de vulnerabilidades.
- La clave Django configurada tiene menos de 50 caracteres. Sustituirla por una
  clave aleatoria larga antes de publicar; la rotación invalida tokens y sesiones.
  No se imprimió ni cambió durante esta preparación.
- DEBUG está desactivado, cookies seguras y SSL redirect activados. HSTS incluye
  subdominios y preload; confirmar que esa política corresponde a todo el dominio
  antes de enviar tráfico real. Eliminar orígenes de desarrollo si no se necesitan.
- Notificaciones quedan pendientes de un servicio real y su red. Reactivarlas sólo
  tras verificar contrato, conectividad y credenciales.
- Base, migraciones, collectstatic, arranque y respuestas HTTP locales verificados.
  Backend y frontend están operativos internamente. Sigue pendiente publicar
  mediante el Nginx central con TLS; HTTP-01 ya está preparado, pero no está activado el
  dominio público. No se aplicaron cambios globales de permisos para Docker.


## Publicación central y HTTPS — preparación del 2026-10-19

### Estado real

**Etapa HTTP instalada por el operador y HTTP-01 verificado posteriormente para
ambos dominios. No se cambió DNS ni se emitió certificado. La publicación HTTPS
no está completada.** El operador informó que el instalador pasó el test central
y recargó Nginx; su prueba inmediata devolvió 404. La verificación posterior se
detalla al final y ya devuelve 200. Sudo sigue requiriendo contraseña en Codex;
no se intentó sortear ese permiso.

Frontend y API se volvieron a verificar fuera del sandbox: ambos devuelven 200
por loopback. Certbot 4.0.0 y Nginx 1.26.3 están instalados. Se revisaron los
virtual hosts habilitados y no se encontraron declaraciones de los dos dominios
nuevos. Camera, IoT y el sitio default permanecen sin modificaciones.

La configuración central incluye `/etc/nginx/stream-turn.conf`: el puerto 443
público es un proxy TCP con inspección SNI. TURN se envía a 5349; el resto se
reenvía a `127.0.0.1:8443`. Por eso el nuevo bloque TLS escucha **8443 local**,
no compite por 443 y no requiere modificar el stream. HTTP escucha en 80 IPv4
e IPv6, igual que los sitios actuales.

La plantilla HTTP pasó `nginx -t` en una configuración aislada con puerto 18082
(no se arrancó ese servidor). Eso no sustituye el test completo central con
sudo antes de recargar. La prueba HTTP anterior a la instalación al VPS público `40.160.233.73`, usando
Host del dominio y la ruta de comprobación ACME, devolvió 404. Después de instalar
el vhost, la verificación actual devuelve 200 (ver diagnóstico al final). La resolución pública de ambos dominios devuelve IP de
Cloudflare; no permite deducir si el origen A configurado en Cloudflare sigue
siendo `181.30.157.102`. No se modificó ningún registro DNS ni de correo.

### Archivos concretos

- `nginx/central-panozosistemas-http.conf`: primera etapa. Sirve únicamente
  HTTP-01 desde `/var/www/letsencrypt-panozosistemas`; el sitio muestra 503 con
  Retry-After hasta activar HTTPS. No necesita certificados previos.
- `nginx/central-panozosistemas-https.conf`: mantiene HTTP-01, redirige el resto
  de HTTP a HTTPS y sirve ambos nombres desde TLS en 8443, con proxy a 18081.
- `ops/instalar-nginx-panozosistemas.sh`: requiere root mediante sudo; sólo
  instala `/etc/nginx/sites-available/panozosistemas.com.ar` y su enlace nuevo.
  Rechaza sobrescribir un sitio existente o una configuración distinta de la
  etapa inicial. Ejecuta `nginx -t` antes de cada recarga; si el test de la nueva
  configuración falla, deshabilita el sitio nuevo o restaura la etapa HTTP.

Se reenvían Host y esquema HTTPS desde el bloque TLS. El stream actual no usa
PROXY protocol: el Nginx HTTP recibe conexiones desde loopback, por lo que la IP
original no se conserva en esta topología. No se cambió globalmente para evitar
impactar otros sitios; el rate limit por IP de Django tendrá esa limitación.
No se confía en cadenas X-Forwarded-For suministradas por visitantes.

### 1. Instalar etapa HTTP y verificar antes de cambiar DNS

Ejecutar en una terminal del VPS con autenticación sudo disponible:

```sh
sudo sh /srv/panozosistemas/estarnet/ops/instalar-nginx-panozosistemas.sh preparar
```

El script valida la configuración central antes y después de agregar el sitio,
recarga sin detener Nginx y comprueba la ruta local de ambos hosts. Si falla,
revisar la salida; no continuar al cambio de DNS ni repetir sobre archivos
existentes sin revisarlos. Luego, desde una máquina externa al VPS:

```sh
curl --noproxy '*' --fail --resolve panozosistemas.com.ar:80:40.160.233.73 http://panozosistemas.com.ar/.well-known/acme-challenge/estarnet-ready
curl --noproxy '*' --fail --resolve www.panozosistemas.com.ar:80:40.160.233.73 http://www.panozosistemas.com.ar/.well-known/acme-challenge/estarnet-ready
```

Ambos deben devolver exactamente `panozosistemas-ovh-40.160.233.73`. Sólo entonces
Nginx estará preparado para cambiar el DNS. HTTP-01 requiere acceso público al
puerto 80: https://letsencrypt.org/docs/challenge-types/ .

### 2. Cambio de origen DNS, a cargo del operador

Actualizar exclusivamente los registros web de `panozosistemas.com.ar` y `www`
para llegar a `40.160.233.73` (www puede ser CNAME al dominio raíz). Revisar si
existen AAAA que envíen esos nombres a otro origen. No alterar MX, TXT de correo,
DKIM, SPF, DMARC ni los hosts de correo. Si un MX apunta al propio dominio raíz,
revisar esa dependencia antes de cambiar su A para no mover el correo por error.

Si Cloudflare mantiene el proxy activado, sus IP seguirán apareciendo en DNS;
comprobar que el origen sea el VPS y que ninguna regla redirija/bloquee/cachee
el desafío hacia el HTTPS todavía inexistente. El operador puede usar DNS-only
para la emisión, o mantener proxy si el desafío HTTP llega correctamente.
No se cambió el modo SSL/TLS ni las reglas globales de Cloudflare.

Después del cambio, comprobar por resolución normal desde fuera del VPS:

```sh
curl --noproxy '*' --fail http://panozosistemas.com.ar/.well-known/acme-challenge/estarnet-ready
curl --noproxy '*' --fail http://www.panozosistemas.com.ar/.well-known/acme-challenge/estarnet-ready
```

No emitir hasta recibir el contenido esperado para ambos nombres. Habrá una
ventana breve de 503/HTTPS no disponible entre este cambio y la activación TLS.

### 3. Emitir certificado sin modificar otros virtual hosts

Una vez confirmada la llegada de ambos nombres al VPS:

```sh
sudo certbot certonly --webroot \
  --webroot-path /var/www/letsencrypt-panozosistemas \
  --preferred-challenges http \
  --cert-name panozosistemas.com.ar \
  -d panozosistemas.com.ar -d www.panozosistemas.com.ar \
  --deploy-hook '/usr/sbin/nginx -t && /usr/bin/systemctl reload nginx'
```

Usar la cuenta ACME existente si Certbot la ofrece; si pide contacto o aceptación
de términos, responder en la terminal. No usar `--nginx` ni `--standalone`:
webroot no instala configuraciones ni requiere detener servicios. El deploy-hook
queda asociado a este certificado para recargarlo en futuras renovaciones.
Fuente: https://eff-certbot.readthedocs.io/en/stable/using.html#webroot .

### 4. Activar TLS y verificar antes de declarar finalizada la migración

```sh
sudo sh /srv/panozosistemas/estarnet/ops/instalar-nginx-panozosistemas.sh activar-https
sudo certbot certificates --cert-name panozosistemas.com.ar
sudo certbot renew --cert-name panozosistemas.com.ar --dry-run
systemctl list-timers certbot.timer
```

El instalador hace `nginx -t`, recarga y verifica con curl ambos nombres por el
puerto 443 local, pasando por el stream real. No usa `-k`: la confianza TLS y el
nombre del certificado deben ser válidos. Desde una máquina externa comprobar:

```sh
curl --noproxy '*' --fail --resolve panozosistemas.com.ar:443:40.160.233.73 https://panozosistemas.com.ar/
curl --noproxy '*' --fail --resolve www.panozosistemas.com.ar:443:40.160.233.73 https://www.panozosistemas.com.ar/api/services/
curl --fail https://panozosistemas.com.ar/
curl --fail https://www.panozosistemas.com.ar/api/services/
curl -I http://panozosistemas.com.ar/
```

Se espera 200 por HTTPS y 301 a HTTPS para HTTP fuera del desafío. Verificar
ambos dominios también en navegador, el admin y sus estáticos. Si Cloudflare
está proxied, la prueba con `--resolve` verifica el certificado del origen y la
normal verifica el recorrido público. Comprobar Camera e IoT después de las
recargas sin modificar sus configuraciones. Registrar aquí las salidas reales
antes de declarar la publicación completada.

### Reversión si falla la ventana de publicación

Mantener el origen anterior `181.30.157.102` operativo durante la transición.
El operador puede revertir únicamente los registros web a sus valores previos;
no tocar correo. Si el nuevo vhost es el causante, deshabilitar únicamente su
enlace, ejecutar `sudo /usr/sbin/nginx -t` y sólo después recargar Nginx. No
eliminar certificados, volúmenes ni datos para revertir el tráfico. La base
anterior y la del VPS pueden divergir tras habilitar escrituras: no sincronizar
ni sobrescribir bases automáticamente.


## Diagnóstico del 404 inicial HTTP-01 — 2026-10-19

### Resultado actual y causa posible

No se reproduce el 404 del archivo de prueba. El virtual host habilitado atiende
correctamente a ambos nombres y sirve el contenido exacto esperado. No fue
necesario cambiar la configuración activa ni los permisos de Nginx.

Se comprobó:

- Enlace habilitado a `/etc/nginx/sites-available/panozosistemas.com.ar`.
- `server_name` incluye ambos dominios y el bloque HTTP-01 usa `root
  /var/www/letsencrypt-panozosistemas` con `try_files $uri =404`.
- La URI `/.well-known/acme-challenge/estarnet-ready` se traduce al archivo
  `/var/www/letsencrypt-panozosistemas/.well-known/acme-challenge/estarnet-ready`.
- Archivo presente, modo 0644, con `panozosistemas-ovh-40.160.233.73` y salto
  de línea. Todos los directorios del recorrido tienen modo 0755. Los 200
  reales confirman que Nginx puede leerlo.
- El archivo inexistente devuelve 404 y `/` devuelve el 503 de mantenimiento
  propio de este vhost: evidencia de selección del bloque correcto, además del
  contenido específico del desafío.

La causa histórica exacta no se puede afirmar con estas pruebas. Una posible
causa es la comprobación inmediata tras `systemctl reload`: el proceso maestro
procesa la recarga e inicia nuevos workers mientras retira los anteriores.
Referencia: https://nginx.org/en/docs/control.html . También una prueba por el
DNS todavía antiguo puede alcanzar el servidor anterior; por eso se fuerza
Host y dirección del VPS en las comprobaciones.

### Corrección mínima del instalador

Se agregaron a la prueba posterior a la recarga hasta cinco reintentos ante
fallos HTTP/conexión, con un segundo de intervalo y límites de tiempo. El éxito
sigue exigiendo HTTP correcto y coincidencia exacta del contenido. No se oculta
un fallo persistente. Se verificaron sintaxis shell, compatibilidad de curl y
`git diff --check`; los dos comandos de comprobación modificados pasaron contra
el vhost activo. No se volvió a ejecutar `preparar`: el sitio ya está instalado.

No se editaron virtual hosts activos, no se recargó/reinició Nginx en esta
revisión, no se tocó DNS y no se pidió ningún certificado. Se solicitó ejecución
sudo para consultar `nginx -T`, pero requirió contraseña; no se obtuvo ese dump
privilegiado. La verificación funcional actual no requirió modificar permisos.

### Pruebas realizadas

Para **cada dominio**, en `127.0.0.1`, `::1` y `40.160.233.73`, conservando Host:

| Recurso | Resultado |
| --- | --- |
| `/.well-known/acme-challenge/estarnet-ready` | 200, cuerpo exacto esperado |
| `/.well-known/acme-challenge/no-existe` | 404, esperado |
| `/` | 503 de mantenimiento, esperado antes de HTTPS |

La prueba contra la IP pública se originó en el mismo VPS; falta repetir desde
una conexión externa para verificar el recorrido de Internet. Ejemplo local:

```sh
curl --noproxy '*' --fail --resolve panozosistemas.com.ar:80:127.0.0.1 http://panozosistemas.com.ar/.well-known/acme-challenge/estarnet-ready
curl --noproxy '*' --fail --resolve www.panozosistemas.com.ar:80:127.0.0.1 http://www.panozosistemas.com.ar/.well-known/acme-challenge/estarnet-ready
```

Comprobación de los otros servicios a través del listener público 443 en
loopback, seleccionando SNI y verificando confianza/nombre del certificado:

| Servicio | Resultado |
| --- | --- |
| Camera: `https://vps.panozosistemas.com.ar/` | HTTPS válido, HTTP 200 |
| IoT: `https://iot.panozoelectronica.com.ar/` | HTTPS válido, HTTP 200 |
| TURN: SNI `turn.panozosistemas.com.ar` en 443 | Handshake TLS 1.3, certificado verificado OK |

La prueba TURN verifica enrutamiento SNI y TLS; no se probó una sesión de relay
con credenciales. No se modificaron ni detuvieron esos servicios.

**Nginx está preparado localmente para HTTP-01 de ambos dominios.** Antes del
cambio de DNS, repetir el curl con `--resolve` hacia `40.160.233.73` desde otra
conexión. Mantener pendiente el certificado y HTTPS hasta una instrucción de
continuación y confirmar que el DNS/origen conduce al VPS. No declarar la
publicación completada por el solo éxito de HTTP-01.
