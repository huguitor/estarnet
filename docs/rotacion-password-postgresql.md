# Plan de rotación de contraseña PostgreSQL en producción

> Actualización 2026-10-20: rotación ejecutada y verificada. Consultar el
> [resultado vigente](rotacion-password-postgresql-resultado-2026-10-20.md).
> El texto siguiente conserva el plan original; la restauración de ensayo
> se omitió por autorización expresa del operador. No repetir la ejecución
> basándose en las menciones históricas a pasos pendientes.

Fecha: 2026-10-19. **Sólo preparación y consultas de lectura. No se generó ni
cambió ninguna contraseña, no se modificaron servicios ni datos y no se hizo
git add, commit o push. La ejecución requiere autorización posterior.**

## Consumidores y fuentes de credenciales

| Componente/archivo | Uso de la credencial |
| --- | --- |
| PostgreSQL 15, contenedor `panozosistemas-db` | El verificador de contraseña del rol está en el catálogo persistido del clúster; es la autoridad para autenticar conexiones |
| `.env` de la raíz | Compose interpola POSTGRES_DB, POSTGRES_USER y POSTGRES_PASSWORD para el servicio db |
| `docker-compose.yml`, servicio db | Tiene valores por defecto heredados para esas variables; POSTGRES_PASSWORD sólo configura el rol durante la inicialización de un directorio de datos vacío |
| `backend/.env` | Se inyecta al backend mediante env_file; configura POSTGRES_PASSWORD y conexión a host db, puerto 5432 |
| `backend/config/settings.py` | Django usa esas variables en DATABASES; conserva un valor de contraseña por defecto heredado que hay que eliminar en una corrección autorizada |
| `backend/.env.example` | Plantilla rastreada con una contraseña de ejemplo que coincide con la real; debe sustituirse por un marcador sin uso productivo |
| `.secrets/secret-key-rotation-20261019/backend.env.before` | Copia privada anterior que también contiene la contraseña DB actual; no es un archivo de configuración activo |
| Herramientas operativas/respaldos | psql y pg_dump pueden requerir la credencial; no se encontraron scripts de conexión adicionales en el proyecto |

Frontend no tiene POSTGRES_PASSWORD ni abre conexiones PostgreSQL. Los tests
aislados usan SQLite. No se detectaron DATABASE_URL u otras fuentes de conexión
en el código de esta aplicación.

### Comprobaciones realizadas

- Nombre de DB, usuario y contraseña coinciden entre los dos `.env` activos.
- Los entornos actuales de los contenedores DB y backend contienen la misma
  contraseña; se compararon en memoria, sin mostrarla.
- Django abrió una conexión nueva correcta con
  `default_transaction_read_only=on`. El rol usado tiene SUPERUSER, CREATEROLE
  y CREATEDB. Es un riesgo adicional: planificar después un rol de aplicación
  de privilegios mínimos; **no cambiar privilegios junto con esta rotación**.
- `password_encryption` es scram-sha-256. Las reglas HBA leídas permiten trust
  por socket local y loopback del contenedor DB; el acceso desde otros hosts
  usa scram-sha-256. No se alteró ninguna regla.
- PostgreSQL no publica puertos en el host y usa el volumen externo
  `estarnet_db_data`. No se debe eliminar, reinicializar ni reemplazarlo.
- El único cliente de esta base observado en pg_stat_activity durante la
  comprobación fue el backend. Es una instantánea, no un inventario completo.
- La red estarnet_network también incluye `camera-platform-api-1`. No hay
  referencias explícitas de host DB en sus variables Docker inspeccionadas ni
  coincidencia de contraseña en sus variables de contraseña. Esto no descarta
  configuración cargada desde archivos ni tareas que no estén conectadas ahora.

**Condición previa a ejecutar:** confirmar con el operador los clientes fuera
del repositorio, procesos manuales, tareas de respaldo y la configuración efectiva
de Camera. Si otro proyecto utiliza este mismo rol, detener la ejecución y
acordar su coordinación; no cambiarlo unilateralmente ni modificar Camera.

## Cómo se sincronizan realmente

Hay tres estados diferentes que deben tratarse de manera explícita:

1. La contraseña efectiva en el catálogo PostgreSQL.
2. Los dos archivos privados de configuración en disco.
3. El entorno ya cargado en los contenedores y sus procesos.

No existe sincronización automática entre ellos. Cambiar POSTGRES_PASSWORD en
un archivo o reiniciar un contenedor **no modifica un rol de una base existente**.
Tampoco cambiar el rol actualiza los `.env` ni el entorno de Django. El volumen
restaurado no debe depender de initdb para una rotación.

La variable del shell puede prevalecer sobre `.env` al interpolar Compose.
Revisar esa precedencia sin imprimir valores y usar una invocación controlada;
no ejecutar `docker compose config` sin `--quiet` en una salida compartida,
porque la configuración renderizada incluye secretos. En el backend, las
variables del proceso prevalecen sobre load_dotenv, que no sobrescribe por defecto.

El healthcheck actual usa pg_isready por socket y no demuestra que la contraseña
nueva funcione. Hace falta una conexión TCP nueva desde el contexto de Django,
sin reusar conexiones abiertas ni validar solamente por trust local.

## Estrategia propuesta

Conservar DB, usuario, volumen y esquema. Cambiar únicamente la contraseña del
rol existente, actualizar ambos `.env` y recrear sólo backend, con una ventana
breve y coordinada. No crear un rol puente, no conceder permisos adicionales,
no ejecutar migraciones y no reiniciar PostgreSQL.

El cambio de contraseña no cierra por sí mismo las conexiones existentes;
las nuevas autentican con la contraseña nueva. No usar esa continuidad como
garantía de disponibilidad: Django puede abrir conexiones nuevas entre peticiones
y fallar durante el intervalo de desincronización. Planificar un cambio corto
con recuperación preparada.

El entorno POSTGRES_PASSWORD del contenedor DB ya creado conservará su valor
viejo. Ese dato de inicialización **no controla la contraseña del rol existente**.
No recrear DB sólo para actualizar ese metadato. Dejar constancia de la diferencia;
cuando se autorice mantenimiento futuro, un contenedor DB recreado con el mismo
volumen y el `.env` actualizado tendrá el metadato nuevo sin reinicializar datos.
Este mantenimiento no forma parte de la rotación propuesta.

## Procedimiento futuro, todavía no ejecutado

### 1. Preparación y condiciones de inicio

- Obtener autorización para el cambio del rol y la ventana del backend.
- Completar el inventario de consumidores señalado arriba.
- Confirmar un acceso administrativo local por socket y mantener una sesión psql
  abierta durante el cambio para recuperación; no modificar HBA para conseguirlo.
- Registrar ID/StartedAt de DB y frontend, volumen, versión, tablas y estado de
  API/admin. Hacer controles de lectura; no incluir registros de usuarios en logs.
- Preparar el tratamiento de defaults inseguros: exigir POSTGRES_PASSWORD en
  Django y Compose, sin valor público de respaldo; en Compose puede utilizarse
  `${POSTGRES_PASSWORD:?Debe configurar POSTGRES_PASSWORD}`. Sustituir el valor
  de ejemplo de la plantilla por un marcador explícito. Probar y construir sólo
  backend antes del corte si se autoriza esa corrección de código.
- No cambiar SECRET_KEY, JWT_SIGNING_KEY ni los fallbacks Django durante esta
  tarea. Su fecha de retirada manual sigue siendo la documentada en
  [rotacion-secret-key-resultado.md](rotacion-secret-key-resultado.md).

### 2. Respaldo previo obligatorio

Crear una carpeta privada nueva dentro de `.secrets/`, con modo 0700 y archivos
0600, fuera de Git y del contexto Docker. No reutilizar ni sobrescribir la copia
de entorno anterior a la rotación de SECRET_KEY: contiene claves Django/JWT
obsoletas. Respaldar los **dos `.env` actuales**, que ya tienen las claves nuevas.

Ejemplo de comandos para el operador, sólo después de autorizar:

```sh
umask 077
mkdir -m 700 .secrets/postgresql-password-rotation
cp .env .secrets/postgresql-password-rotation/root.env.before
cp backend/.env .secrets/postgresql-password-rotation/backend.env.before
docker exec panozosistemas-db sh -c 'exec pg_dump --format=custom --username="$POSTGRES_USER" --dbname="$POSTGRES_DB"' > .secrets/postgresql-password-rotation/database.dump
docker exec panozosistemas-db sh -c 'exec pg_dumpall --globals-only --no-role-passwords --username="$POSTGRES_USER"' > .secrets/postgresql-password-rotation/globals.sql
```

No usar TTY para generar el dump binario; comprobar el código de salida de cada
comando y no continuar con archivos parciales. Los globals no contienen
verificadores de contraseña gracias a --no-role-passwords, pero siguen siendo
material privado. El dump de DB contiene datos de usuarios y sesiones y debe
tratarse como sensible aunque no lleve la contraseña del rol de conexión.

Verificar tamaño y checksum sin mostrar contenido y leer el índice mediante
pg_restore --list. Además, probar una restauración completa **en un PostgreSQL
15 aislado y descartable**, con almacenamiento diferente, sin montar el volumen
productivo y sin conectarlo a las redes de otros proyectos. Verificar esquema,
tablas y conteos allí; no mostrar datos. Listar el índice por sí solo no prueba
que el respaldo sea restaurable. La restauración de ensayo necesita su propia
credencial temporal, que sólo se generará después de autorizar.

Un pg_dump se realiza con una instantánea coherente mientras la aplicación
continúa trabajando; no incluye escrituras posteriores a esa instantánea.
Si se requiriera restaurar después, evaluar esa diferencia antes de hacerlo.
**No restaurar nada sobre producción como parte de una simple rotación.**

### 3. Preparar la credencial candidata y los archivos

Tras superar el respaldo y el ensayo, generar una contraseña independiente,
aleatoria y larga mediante un generador criptográfico y guardarla directamente
en almacenamiento privado/gestor de contraseñas. Esto **no se hizo en esta tarea**.
No publicarla ni pasarla como argumento de shell, URI, SQL literal visible,
historial o variable interpolada en comandos. Evitar PGPASSWORD en línea de
comandos y docker inspect/config sin filtrar.

Preparar copias candidatas de `.env` y `backend/.env`, cambiando sólo
POSTGRES_PASSWORD con escritura atómica y permisos 0600. Comparar el resto de
variables sin mostrarlas, especialmente Django, JWT y fallback. No reemplazar
todavía los archivos activos ni recrear servicios. Asegurar que el valor se
interprete de la misma manera en Compose y python-dotenv.

### 4. Cambio del rol y despliegue del backend

Desde una terminal privada del VPS abrir la sesión de recuperación:

```sh
docker exec -it panozosistemas-db sh -c 'exec psql -X --username="$POSTGRES_USER" --dbname="$POSTGRES_DB"'
```

En psql, confirmar la identidad del rol y utilizar **`\password`** sin nombre
para cambiar la contraseña del usuario conectado. Introducir dos veces la
credencial candidata mediante las solicitudes ocultas. PostgreSQL recomienda
este mecanismo para evitar enviar el texto claro en ALTER ROLE visible en
historial/logs. No usar `ALTER ROLE ... PASSWORD 'valor'` en una herramienta
que registre comandos. El verificador también es sensible: no imprimirlo ni
registrarlo en documentación.

La autenticación y password_encryption actuales permiten SCRAM-SHA-256; conservar
esa política, no degradar a trust o MD5 ni cambiar otros atributos del rol.
Mantener abierta esa sesión administrativa. Si el cambio falla, detenerse antes
de tocar clientes y comunicar el error sin mostrar credenciales.

Después de confirmar el cambio:

1. Instalar atómicamente los dos archivos candidatos privados.
2. Ejecutar `docker compose config --quiet` desde un entorno de shell controlado.
3. Usar un contenedor temporal de backend con `--no-deps` y entrypoint explícito
   para abrir una conexión TCP nueva a la DB con el entorno candidato. Forzar
   sólo lectura y ejecutar SELECT 1; sin collectstatic, migraciones o tests
   contra producción. No volcar DATABASES ni el entorno a stdout.
4. Si valida, ejecutar únicamente `docker compose up -d --no-deps backend`.
   Un restart no relee env_file. No ejecutar `up db`, `down`, `down -v`, initdb,
   ni operaciones de eliminación/recreación de volúmenes.
5. Confirmar que la conexión TCP con la nueva credencial funciona y que la
   contraseña anterior falla al abrir una conexión nueva. Esta última prueba
   debe usar contraseña explícita, sin fallback a trust ni otro archivo de
   credenciales, y no reutilizar una conexión ya autenticada.

### 5. Validación de cierre

- DB y frontend conservan ID/StartedAt y PostgreSQL sigue saludable.
- Nueva conexión desde Django: SELECT 1 y conteos de tablas/esquema esperados.
- No hay cambios de tablas, roles/grants ni datos por esta operación, salvo el
  verificador de contraseña del rol que se autorizó cambiar.
- API de servicios, `/admin/login/` y estáticos responden por HTTPS en ambos
  dominios, por origen y Cloudflare. Verificar lectura autenticada JWT sin
  alterar contraseñas ni crear usuarios.
- Django/JWT/fallback conservan sus valores anteriores a esta tarea. No se
  esperan cierres de sesión JWT por cambiar una contraseña de conexión DB.
- Sin errores nuevos de autenticación en logs y sin efectos en otros proyectos.
- Registrar hora, resultados, ubicaciones privadas de respaldos y metadato
  antiguo del contenedor DB, nunca contraseñas o verificadores.

## Recuperación sin restaurar datos

| Punto de fallo | Acción propuesta |
| --- | --- |
| Antes de cambiar el rol | Cancelar; dejar archivos y servicios actuales intactos; conservar el respaldo privado |
| Se cambió el rol, pero los archivos todavía tienen el valor antiguo | Priorizar instalar la configuración nueva y completar la conexión de prueba usando la sesión administrativa abierta |
| Nuevo backend no conecta | Comprobar coincidencia de archivos/entorno, precedencia Compose, host/red y HBA sin imprimir secretos; detener el despliegue si no se corrige de inmediato |
| No puede completarse el cambio | Con la sesión local abierta, usar `\password` para restablecer temporalmente la credencial previa desde el gestor/copia privada, restaurar sólo los dos env actuales respaldados y recrear únicamente backend; verificar por TCP y HTTPS |
| La sesión administrativa se cerró | Reabrir por socket local según la configuración comprobada; si no funciona, detener y pedir intervención autorizada; no abrir trust en red, borrar el volumen ni reinicializar |

Restablecer la credencial previa es sólo una contingencia breve: sigue siendo
conocida/pública y debe rotarse de nuevo. Como el esquema y datos no cambian,
**no hace falta pg_restore para revertir una contraseña**. No restaurar la DB
para resolver un desacuerdo de credenciales. Si hubiera daño de datos ajeno a
la rotación, requerir otra autorización y evaluar las escrituras posteriores
al respaldo antes de cualquier restauración.

El entorno antiguo del contenedor DB no es una copia recuperable de su estado
de autenticación. No confiar en reiniciarlo para revertir el rol. Tampoco usar
la copia del `.env` anterior a la rotación Django/JWT, que invalidaría firmas.

## Exposición en Git y tratamiento recomendado

Se compararon en memoria las credenciales de archivos privados con los blobs
de las 15 revisiones accesibles mediante `git rev-list --all`, sin imprimir
sus valores. Se confirmó que el valor actual de POSTGRES_PASSWORD aparece
como contraseña por defecto en settings/Compose y en la plantilla histórica.
Hay coincidencias desde el commit inicial `de237d1` en settings y Compose y
también en el HEAD revisado, `d18376a`.

También coincide con identificadores públicos en README y package.json:
esas coincidencias de texto no significan que esos archivos declaren una
contraseña. El hallazgo confirmado es que la credencial real reutiliza un valor
público de ejemplo. Tratarla como expuesta, aunque se haya elegido como default
y no exista evidencia de intrusión.

No se encontraron `.env` reales como archivos en el historial local revisado,
ni coincidencias de las claves Django/JWT actuales, la anterior Django o la
clave de notificaciones. No se inspeccionaron forks, clones ajenos ni refs
remotas no disponibles localmente; el análisis no demuestra ausencia absoluta
de filtraciones.

Prioridad recomendada:

1. Invalidar la contraseña expuesta mediante esta rotación autorizada.
2. Eliminar defaults inseguros de contraseña de la configuración y usar sólo
   marcadores en ejemplos. `.gitignore` no elimina valores ya rastreados.
3. Revisar reutilización de esa credencial en otros entornos con sus responsables,
   sin cambiar otros proyectos automáticamente.
4. Evaluar la visibilidad de GitHub, forks, CI/artifacts y backups; no asumir
   que reescribir el historial revoca una contraseña o elimina clones.
5. Si se identifican secretos confidenciales adicionales, valorar una limpieza
   coordinada con git-filter-repo y propietarios del repositorio. Reescritura
   y force-push requieren autorización separada. No sustituir globalmente el
   identificador del proyecto para borrar esta contraseña de ejemplo.

La copia privada de contingencia de SECRET_KEY también retiene la contraseña
DB vieja; después de rotar quedará obsoleta. Mantenerla privada y coordinar su
retención/retiro con la retirada manual del fallback Django, sin eliminarlo
antes de sus 48 horas. Ningún respaldo privado debe entrar al commit de cierre.

## Fuentes técnicas

- ALTER ROLE y recomendación de `\password`:
  https://www.postgresql.org/docs/15/sql-alterrole.html
- psql y cambio interactivo de contraseña:
  https://www.postgresql.org/docs/15/app-psql.html
- pg_dump y consistencia del respaldo:
  https://www.postgresql.org/docs/15/app-pgdump.html
- Variables de inicialización de la imagen PostgreSQL:
  https://hub.docker.com/_/postgres
- Precedencia del entorno Compose:
  https://docs.docker.com/compose/how-tos/environment-variables/envvars-precedence/

**Estado final de esta tarea:** plan preparado; no hay contraseña candidata,
respaldo nuevo de DB, cambio de rol ni despliegue ejecutados. Esperar
autorización antes de iniciar la operación.
