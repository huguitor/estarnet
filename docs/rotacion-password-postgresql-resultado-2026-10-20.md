# Rotación PostgreSQL completada

## Resultado vigente: 2026-10-20

**La contraseña del rol existente fue rotada y validada.** Finalización:
2026-10-20 14:13:30 UTC (11:13:30 de Argentina); verificaciones adicionales
de cierre realizadas después. Las secciones posteriores conservan el historial
de intentos anteriores, no describen el estado vigente.

### Autorización y comprobaciones previas

El operador autorizó respaldos, generación de credencial, actualización del rol
y de los `.env`, recreación exclusiva del backend y validaciones. Declaró no
tener identificados consumidores externos. Autorizó expresamente omitir el
ensayo de restauración aislado porque los datos actuales no son críticos.

- PostgreSQL no tiene puertos publicados: `HostConfig.PortBindings` vacío y
  `5432/tcp` sin binding; no usa red host. `ss` no mostró listener del host
  en 5432. No existe publicación directa de PostgreSQL hacia Internet por
  el despliegue Docker inspeccionado.
- La revisión previa de los entornos de 12 contenedores y de configuración
  legible de Camera/IoT no encontró reutilización de la credencial. La API de
  Camera comparte red pero no tiene montajes del host. En la comprobación
  inmediatamente anterior sólo se observó la sesión local de inspección;
  no se detectaron clientes desconocidos. Esta evidencia no constituye un
  inventario absoluto de procesos o tareas externos.
- Todos los comandos Docker se ejecutaron mediante `sg docker -c`.

### Respaldo y ejecución

Directorio privado, excluido de Git y del contexto Docker:
`.secrets/postgresql-password-rotation-20261020T141233Z/`.
Directorio con modo 0700; archivos con modo 0600.

- `database.dump`: respaldo custom de 37.151 bytes, con índice legible por
  `pg_restore --list` y checksum SHA-256 verificado nuevamente al cierre.
- `globals.sql`: roles globales exportados con `--no-role-passwords`.
- `root.env.before`, `backend.env.before`: configuración activa previa,
  conservando las claves Django/JWT actuales. También se respaldaron Compose,
  settings y entrypoint; no se reutilizaron respaldos antiguos de SECRET_KEY.
- `checksums.json`, índices y registros sanitizados conservan la evidencia
  privada. **No se probó una restauración**, por excepción autorizada; la
  lectura del índice no demuestra restaurabilidad completa.
- Se generó una contraseña independiente con generador criptográfico:
  48 bytes aleatorios codificados en 64 caracteres seguros para ambos `.env`.
  La candidata y `password.new` permanecen únicamente en almacenamiento privado.
- Se abrió una sesión administrativa local y se mantuvo durante el cambio.
  Se utilizó `psql \password` con entradas ocultas, sin pasar el secreto en
  argumentos ni SQL literal. Se conservó SCRAM-SHA-256 y los atributos del rol.
- Se instalaron atómicamente `.env` y `backend/.env`, ambos con modo 0600.
  La comparación verificó que sólo cambió POSTGRES_PASSWORD; Django, JWT,
  fallbacks y las demás variables conservaron sus valores.
- `docker compose config --quiet` validó la configuración con un entorno
  controlado. Una instancia temporal de backend, con `--no-deps`, entrypoint
  Python explícito y sin migraciones, abrió una conexión TCP nueva de lectura.
- Se ejecutó `docker compose up -d --no-deps --no-build --pull never backend`.
  No se construyeron imágenes ni se ejecutaron migraciones.

### Validaciones de cierre

- Backend nuevo: `da69582b12fc`, iniciado a las 14:13:24 UTC. Conexión TCP
  nueva autenticada con la contraseña nueva y `SELECT 1` correcto.
- La contraseña anterior fue rechazada explícitamente por autenticación al
  abrir una conexión TCP nueva desde el backend; sin fallback a trust.
- Las 13 tablas públicas conservaron sus conteos. Se compararon metadatos de
  columnas, atributos de roles y grants de tablas, sin diferencias.
- DB `e1db11ccc01e` y frontend `e142c6deb876` conservaron ID y StartedAt.
  Los otros 11 contenedores activos, incluyendo los de otros proyectos,
  conservaron ID e inicio. PostgreSQL permaneció healthy.
- API `/api/services/`, `/admin/login/` y `/static/admin/css/base.css`:
  12 comprobaciones HTTP 200, ambos dominios, acceso público y origen local,
  con certificados TLS válidos.
- Lecturas JWT `/api/auth/me` y `/api/services/private/`: ocho comprobaciones
  HTTP 200 con TLS válido, ambos dominios por acceso público y origen. Se usó
  un usuario activo existente, sin modificar contraseñas ni crear usuarios o
  sesiones persistentes; el token no se guardó en documentación ni artefactos.
- Logs del backend: cero coincidencias de errores de autenticación,
  OperationalError, traceback o nivel ERROR en la ventana revisada.
  PostgreSQL registró un rechazo de contraseña en esa ventana, correspondiente
  a la prueba deliberada de la clave anterior.

El contenedor DB conserva la contraseña antigua en su variable de
inicialización POSTGRES_PASSWORD; esto es el estado esperado del procedimiento.
El catálogo PostgreSQL utiliza la nueva. No se recreó DB para actualizar ese
metadato. Los respaldos privados siguen conteniendo la credencial anterior y
deben conservar su protección. No se cambiaron defaults de código/Compose en
esta ejecución de rotación. Posteriormente, para el commit de cierre, se
eliminaron esos defaults del repositorio y se sustituyó el ejemplo por un
marcador; esta corrección permanece sin desplegar. Ver
[CIERRE_MIGRACION_VPS.md](CIERRE_MIGRACION_VPS.md).

No fue necesaria recuperación. No se borraron bases ni volúmenes, no se
restauraron datos, no se cambió HBA, no se modificaron otros proyectos y no
se hizo commit ni push. El árbol de trabajo ya contenía cambios anteriores;
se conservaron.

## Historial anterior: ejecución inicialmente detenida

Fecha: 2026-10-20.

La rotación autorizada no se ejecutó porque no se pudo acceder al daemon Docker.
`docker ps` devolvió permiso denegado sobre `/var/run/docker.sock`, también
fuera del sandbox. `sudo -n docker ps` indicó que requiere contraseña.
Se detuvo el procedimiento antes de cambiar el rol o los archivos privados.

## Comprobaciones realizadas

- Las contraseñas de `.env` y `backend/.env` coinciden; se compararon en memoria
  sin mostrar sus valores.
- Compose configura PostgreSQL en `panozosistemas-db` y conecta el backend
  mediante `backend/.env`. El volumen de datos es externo.
- Se revisaron en modo lectura 35 archivos de configuración de Camera Platform
  y 3 de IoT. Hubo coincidencias textuales en archivos de Camera, que no
  demuestran reutilización de credenciales. Su Compose declara otro usuario y
  otra base. No hubo coincidencias en los archivos revisados de IoT.
- Algunos directorios privados de respaldos y datos no fueron legibles. No se
  pudieron inspeccionar los entornos de contenedores, las redes ni las sesiones
  PostgreSQL activas. **No se pudo confirmar uso exclusivo de la credencial.**

## Estado de los pasos solicitados

1. Exclusividad: pendiente de verificación en ejecución.
2. Respaldo de base y archivos privados fuera de Git: pendiente; el acceso a
   Docker falló antes de comenzar los respaldos.
3. Contraseña nueva: no generada.
4. Cambio del rol existente: no realizado.
5. Actualización de archivos privados: no realizada.
6. Recreación del backend: no realizada.
7. PostgreSQL, API, administración y HTTPS: no verificados en esta ejecución.
8. Rechazo de la contraseña anterior: no comprobado; no se rotó la contraseña.
9. Resultado: documentado en este archivo.

No fue necesaria recuperación: no se modificó el estado del despliegue.
No se borraron ni recrearon bases o volúmenes, ni se modificaron otros proyectos,
DNS o Nginx. No se ejecutaron commit ni push. Los cambios preexistentes del
directorio de trabajo se conservaron.

Para continuar hace falta acceso efectivo al daemon Docker con los permisos
del servidor. Después se debe repetir la verificación de exclusividad y seguir
el procedimiento de `docs/rotacion-password-postgresql.md`, con respaldo y
recuperación antes de modificar credenciales. No proporcionar contraseñas
administrativas por el chat.

## Reintento con autorización explícita para salir del sandbox

Se releyó el procedimiento y se solicitó ejecución fuera del sandbox, sin sudo,
para este comando exacto:

```sh
docker ps --format '{{.Names}} {{.Image}} {{.Ports}}'
```

La herramienta volvió a devolver permiso denegado sobre el socket Docker.
No fue un rechazo explícito de autorización del usuario: la ejecución solicitada
no consiguió acceso efectivo al daemon. Según la instrucción de detenerse si no
se obtiene acceso, no se intentaron cambios ni respaldos parciales. El operador
puede ejecutar el comando anterior en la terminal del VPS; su salida no incluye
contraseñas. Sigue pendiente confirmar exclusividad antes de rotar.

## Reanudación mediante `sg docker` (2026-10-20)

Se confirmó acceso efectivo a Docker mediante `sg docker -c 'COMANDO'`.
Se completaron las siguientes comprobaciones de lectura, sin imprimir secretos:

- Los dos archivos de entorno activos contienen la misma contraseña y el shell
  no tiene variables POSTGRES_* que sobrescriban la interpolación de Compose.
- Se comparó la credencial con los entornos de los 12 contenedores activos:
  no hay coincidencias en contenedores de otros proyectos.
- Camera comparte `estarnet_network`, pero su API no tiene montajes del host.
- Se revisaron 684 archivos de código/configuración de Camera y 23 de IoT,
  excluyendo directorios de datos, respaldos y dependencias. No se encontraron
  referencias de contraseña/URI PostgreSQL que coincidan con la credencial.
  Tres archivos de Camera no fueron legibles; la inspección no demuestra
  ausencia absoluta de otros consumidores.
- PostgreSQL informa versión 15.19, SCRAM-SHA-256, 13 tablas públicas y rol
  actual con privilegio superuser. La instantánea de pg_stat_activity sólo
  mostró la sesión local de comprobación. No se cambiaron HBA ni privilegios.
- Se confirmó el volumen `estarnet_db_data` y se registraron los ID actuales:
  DB `e1db11ccc01e`, frontend `e142c6deb876`, backend `bccbbaaf840f`.
- `/api/services/` y `/admin/login/` responden HTTP 200 por HTTPS para ambos
  dominios, tanto por resolución pública como por origen local; curl validó
  los certificados. Esto es una línea de base previa al cambio, no una
  validación de rotación ni una prueba autenticada JWT.

Se solicitó al operador confirmar consumidores externos/manuales y autorizar
el respaldo privado y el ensayo de restauración aislado. Esas respuestas
siguen pendientes. El cambio productivo requerirá aprobación posterior, con
el respaldo verificado.

Un intento de parche documental falló por contexto no coincidente; no modificó
archivos. Se detuvo el avance operativo conforme a la recuperación anterior al
cambio del rol: conservar archivos privados y servicios intactos. Este registro
documenta el estado, sin reanudar operaciones sensibles.

Estado: contraseña nueva no generada; respaldos y ensayo no ejecutados; rol,
archivos privados y contenedores sin cambios. No fue necesario revertir
credenciales. No se borraron bases ni volúmenes; no se modificaron otros
proyectos ni se hizo commit o push.
