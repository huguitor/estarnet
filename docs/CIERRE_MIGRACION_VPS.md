# Cierre de migración al VPS OVH

## Confirmación de HTTPS y Cloudflare

Configuración confirmada por el operador el **19 de octubre de 2026**:

- Cloudflare tiene **SSL/TLS automático habilitado**.
- El modo SSL/TLS actualmente en ejecución es **Completo (estricto)**.
- `https://panozosistemas.com.ar` funciona correctamente.
- `https://www.panozosistemas.com.ar` funciona correctamente.

Esta entrada registra la confirmación del operador; no constituye una nueva
inspección de la cuenta Cloudflare. No se modificaron Cloudflare, DNS, Nginx
ni otros servicios para registrar esta información.

## Seguimiento pendiente de seguridad

La rotación de PostgreSQL se completó el **20 de octubre de 2026 a las
11:13:30 de Buenos Aires (14:13:30 UTC)**. Antes del cambio se confirmó que
PostgreSQL no publicaba puertos en Docker y que el host no escuchaba en 5432;
no se detectaron consumidores desconocidos en las comprobaciones realizadas.

Se respaldaron la base y la configuración en almacenamiento privado excluido
de Git y del contexto Docker, con checksum e índice verificados. El ensayo de
restauración se omitió por autorización expresa del operador. Se actualizó el
rol existente y ambos `.env`; sólo se recreó el backend. Las conexiones TCP
nuevas funcionaron con la contraseña nueva y rechazaron la anterior.

Se verificaron API, administración, estáticos y lecturas JWT por HTTPS en ambos
dominios, por acceso público y origen. Los conteos de las 13 tablas y los
metadatos comparados de esquema, roles y permisos se conservaron. PostgreSQL,
frontend y los contenedores de otros proyectos conservaron ID e inicio. No se
borraron datos ni volúmenes ni fue necesaria recuperación.

El entorno de inicialización del contenedor DB conserva el valor antiguo;
el catálogo PostgreSQL utiliza la contraseña nueva. No se recreó DB para
actualizar ese metadato. El resultado y la ubicación privada del respaldo están
en [rotacion-password-postgresql-resultado-2026-10-20.md](rotacion-password-postgresql-resultado-2026-10-20.md).

Para el commit de cierre se eliminaron los valores de contraseña PostgreSQL
por defecto de Django y Compose y se sustituyó el ejemplo por un marcador.
Django y Compose exigen ahora POSTGRES_PASSWORD; los tests aislados usan un
valor sintético y SQLite en memoria. **Esta corrección está preparada en el
repositorio, sin desplegar**: durante el cierre no se modificaron servicios.
Los `.env`, claves y respaldos privados no forman parte del commit.

Validación del cierre: 21 tests correctos tras recolectar estáticos en un
contenedor temporal sin red, con el código candidato en sólo lectura, sin
archivos de entorno privados ni volúmenes productivos y con SQLite en memoria.
Sintaxis Python/shell y `git diff --check` correctos. Se revisó el contenido
del índice contra las credenciales privadas conocidas y se comprobó la
exclusión de `.env` y `.secrets/`. No se desplegó ni se modificaron servicios
durante la preparación del commit.

La rotación de claves Django y JWT está desplegada. La retirada manual del
fallback anterior continúa pendiente: **no realizarla antes del 21/10/2026 a
las 13:27:19 de Buenos Aires (16:27:19 UTC)**. No hay eliminación automática
programada.

Detalles en [rotacion-secret-key-resultado.md](rotacion-secret-key-resultado.md)
y el historial en [migracion-vps.md](migracion-vps.md).
