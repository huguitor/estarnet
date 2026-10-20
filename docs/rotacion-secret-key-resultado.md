# Rotación Django y JWT ejecutada — 2026-10-19

**Rotación desplegada y verificada. El fallback permanece activo; no se
programó ninguna eliminación automática.**

## Ventana de gracia de 48 horas

Se toma como inicio conservador la finalización de las comprobaciones de
rotación, posterior al reemplazo completo del contenedor y de sus workers:

| Hito | UTC | Buenos Aires (UTC−03:00) |
| --- | --- | --- |
| Inicio verificado de la gracia | 2026-10-19 16:27:19 | 2026-10-19 13:27:19 |
| **No retirar el fallback antes de** | **2026-10-21 16:27:19** | **2026-10-21 13:27:19** |

El backend nuevo arrancó a las 16:25:55 UTC del 19 de octubre. Contar desde la
verificación posterior garantiza al menos 48 horas de gracia. El vencimiento
no cambia por reconstruir el backend; no hay código que expire el fallback ni
una tarea programada para retirarlo.

## Cambios realizados

- Se generaron dos claves independientes mediante dos llamadas a
  `secrets.token_urlsafe(64)`: cada una parte de 64 bytes aleatorios y tiene
  86 caracteres URL-safe. No se imprimieron claves ni tokens.
- Django lee DJANGO_SECRET_KEY; Simple JWT lee JWT_SIGNING_KEY, sin compartir
  su valor. Se eliminaron los valores por defecto inseguros del código.
- SECRET_KEY_FALLBACKS contiene exclusivamente la clave Django anterior,
  leída de DJANGO_SECRET_KEY_FALLBACKS_JSON. Se verificó que coincide con la
  clave que tenía el proceso anterior.
- El nuevo módulo `config.signing_keys` rechaza claves ausentes/vacías y
  fallbacks con JSON/tipos inválidos, valores vacíos, duplicados o repetición
  de la clave primaria. Sus errores no incluyen valores secretos.
- Se actualizaron la plantilla de entorno y la configuración exclusiva de
  tests. No se alteraron contraseñas ni los tiempos o algoritmo JWT.
- Se creó una copia privada del `.env` anterior bajo
  `.secrets/secret-key-rotation-20261019/backend.env.before` para contingencia.
  Archivos privados 0600 y directorios 0700. `.secrets/` se excluye de Git y del
  contexto de construcción Docker. El archivo activo conserva modo 0600.

La clave anterior no se encontró en el historial Git local accesible ni
coincidió con los valores inseguros conocidos comprobados. Esto no demuestra
ausencia de exposición fuera del repositorio. No aparecieron indicios de
compromiso durante la revisión que impidieran la gracia autorizada.

## Validaciones antes del despliegue

**21 tests OK** en contenedor temporal sin red, con SQLite temporal y claves
sintéticas. Las migraciones del runner sólo se ejecutaron sobre esa SQLite;
no se ejecutó ningún comando de migración contra PostgreSQL.

Además de las pruebas existentes, se verificó:

- Fallo seguro con claves ausentes y JSON inválido, sin valores en errores.
- Aceptación de firma anterior con fallback y rechazo tras retirarlo.
- Rechazo de JWT anterior aunque Django conserve el fallback.
- Conservación de una sesión de admin anterior, renovación automática de esa
  sesión y acceso posterior incluso después de retirar el fallback en el ensayo.
- Login JWT, refresh, perfil autenticado y administración con datos de prueba.

La imagen se construyó después de superar los tests. Antes de desplegar se
comprobó el entorno real con un contenedor temporal que no hizo consultas a
PostgreSQL: claves nuevas distintas entre sí y de la anterior, longitud adecuada
y fallback anterior exacto. Compose y `git diff --check` también pasaron.

## Despliegue y verificación de producción

Se ejecutó únicamente `docker compose up -d --no-deps backend`. Se conservó la
imagen anterior como `estarnet-backend:pre-key-rotation-20261019`. Esa imagen
anterior **no soporta la nueva separación de claves**: no restaurarla a ciegas
con el entorno nuevo, ni restaurar el entorno anterior automáticamente.

PostgreSQL conserva su ID y arranque del 19 de octubre a las 15:01:49 UTC;
frontend conserva su ID y arranque a las 15:16:38 UTC. No se operó sobre Camera,
IoT, TURN ni otros proyectos. No se ejecutaron migraciones productivas.

Para ambos dominios, HTTPS del origen y HTTPS público mediante Cloudflare:

| Ruta | Resultado |
| --- | --- |
| `/` | 200 |
| `/api/services/` | 200 |
| `/admin/login/` | 200 |
| `/static/admin/css/base.css` | 200 |

Las 16 comprobaciones HTTP fueron correctas y verificaron certificados, sin
desactivar TLS. También se probó la autenticación JWT por HTTPS público de
**ambos dominios**:

- Access nuevo: perfil autenticado 200.
- Refresh nuevo: 200 y nuevo access aceptado en el perfil.
- Access y refresh firmados con la clave anterior: 401 esperado.

Para esta comprobación se leyó un usuario activo existente en una conexión
PostgreSQL con `default_transaction_read_only=on`; los tokens efímeros se
mantuvieron sólo en memoria. No se imprimieron, persistieron ni registraron.
La emisión/renovación JWT actual no usa blacklist, rotación de refresh ni
actualización de last_login, por lo que no requirió escrituras de usuario.
No se utilizó ni modificó la contraseña de esa cuenta. El login con contraseña
y la sesión admin autenticada se probaron con datos sintéticos en SQLite;
no se inició una sesión admin nueva contra producción.

`check --deploy` ya no presenta W009 para la clave activa. Persiste únicamente
**security.W025**, esperado porque la clave anterior corta sigue temporalmente
en fallback. No se silenció. Deberá desaparecer al retirar ese fallback.

No se modificaron datos, contraseñas, DNS, Cloudflare ni Nginx central. Sin
commits ni push.

## Retirada manual pendiente

**A partir del 21 de octubre de 2026 a las 13:27:19 de Buenos Aires**, realizar
una nueva operación manual autorizada para dejar
DJANGO_SECRET_KEY_FALLBACKS_JSON en `[]`, conservar ambas claves activas y
recrear únicamente backend. Ejecutar checks y comprobar HTTPS y autenticación.
No basta un restart para releer env_file. No hacen falta migraciones ni borrar
sesiones de PostgreSQL.

No retirar antes de esa fecha. Las sesiones que aún dependan de la clave vieja
pueden requerir login al finalizar la gracia. Los usuarios de API ya deben
volver a iniciar sesión tras la rotación de JWT, independientemente de la gracia
de Django. No se conserva la clave antigua como verificador JWT.

La copia privada de contingencia también contiene la clave anterior y otras
variables sensibles: evaluar su retiro seguro en esa operación posterior, sin
exponerla ni añadirla al repositorio. No se eliminó automáticamente.
