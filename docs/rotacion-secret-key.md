# Revisión de SECRET_KEY y propuesta de rotación

> Actualización: el operador autorizó y se ejecutó la rotación. Resultado,
> verificaciones y fecha exacta de retirada manual del fallback en
> [rotacion-secret-key-resultado.md](rotacion-secret-key-resultado.md).
> El análisis y la propuesta siguientes conservan el estado anterior al cambio.

Fecha: 2026-10-19. **Análisis realizado; rotación y despliegue NO autorizados ni
ejecutados.** No se cambiaron claves, configuración productiva, PostgreSQL ni
otros servicios. Este documento es una propuesta para aprobar antes de actuar.

## Configuración comprobada

Se revisaron el repositorio y la configuración efectiva del backend Django
5.2.18, mostrando sólo propiedades y comparaciones, nunca claves ni tokens.

- `backend/config/settings.py` toma `SECRET_KEY` de `DJANGO_SECRET_KEY`, con
  valor por defecto `change-me` si falta la variable.
- `SIMPLE_JWT['SIGNING_KEY']` toma **la misma variable y el mismo valor por
  defecto**. Los dos usos están acoplados actualmente.
- La clave activa tiene menos de 50 caracteres; tiene al menos cinco caracteres
  distintos, no empieza con `django-insecure-` y no es el valor por defecto
  `change-me`. Esto explica `security.W009`; no mide su entropía ni demuestra
  que haya sido filtrada. No se hizo una auditoría completa del historial Git
  ni de copias externas para descartar exposición.
- `SECRET_KEY_FALLBACKS` no se configura en el proyecto; el valor efectivo es
  una lista vacía. Agregar una variable al `.env` por sí solo no lo habilitará:
  falta código que la lea.
- Sesiones: backend `django.contrib.sessions.backends.db`, edad máxima
  predeterminada 1.209.600 segundos (14 días), sin guardar en cada petición ni
  expirar al cerrar el navegador. No se encontraron `set_expiry()` específicos.
- Mensajes: `django.contrib.messages.storage.fallback.FallbackStorage`.
- JWT: HS256, access 30 minutos, refresh 7 días, sin rotación de refresh,
  sin blacklist y sin actualización de last_login al iniciar sesión por JWT.
- La API usa JWTAuthentication. Login y refresh están en `/api/auth/login` y
  `/api/auth/refresh`; el frontend guarda los tokens en localStorage.
- El usuario hereda AbstractBaseUser, incluido su hash de autenticación de
  sesión y soporte de hashes fallback de Django.
- `rest_framework.authtoken` está instalado, pero la autenticación configurada
  y los endpoints actuales usan JWT, no esos tokens persistidos.
- No se encontraron firmas propias, cifrado de campos o archivos usando esta
  clave, ni rutas propias de recuperación de contraseña. El timeout Django de
  recuperación es 259.200 segundos (3 días), aunque no hay un flujo publicado
  identificado que lo use actualmente.
- CSRF usa cookie propia (`CSRF_USE_SESSIONS=False`), no una firma derivada de
  SECRET_KEY para el token CSRF estándar.
- `.env` y `backend/.env` están ignorados y no aparecen como archivos rastreados
  por Git en el estado actual. Ambos tienen permisos 0600 y se excluyen del
  contexto Docker mediante `.dockerignore`.

## Impacto de una rotación

| Elemento | Cambio directo, sin fallback | Con fallback Django de la clave anterior |
| --- | --- | --- |
| Sesiones/admin en PostgreSQL | Las sesiones firmadas con la clave anterior dejan de validarse; se requiere login | Django puede leerlas y validar el hash de autenticación anterior; al autenticar una sesión antigua puede renovar su clave de sesión y su hash automáticamente |
| Cookies firmadas/mensajes Django | Las firmas antiguas dejan de validar; pueden perderse mensajes pendientes | Se aceptan temporalmente firmas antiguas que usan los firmadores estándar |
| Recuperación de contraseña Django | Tokens anteriores dejan de validar | Se conservan hasta su expiración o retirada del fallback, si ese flujo se utiliza |
| Access y refresh JWT | Ambos dejan de validar si cambia SIGNING_KEY | **No se conservan**: Simple JWT no consulta SECRET_KEY_FALLBACKS |
| Contraseñas de usuarios | Sin cambios | Sin cambios |
| Usuarios, servicios, contactos, multimedia y datos ordinarios | No requieren cambios ni migraciones | No requieren cambios ni migraciones |
| Tokens DRF persistidos, si alguna integración externa los usara | No dependen directamente de SECRET_KEY | No necesitan fallback |
| Cookie/token CSRF estándar | No hay invalidación directa por cambiar SECRET_KEY; un nuevo login puede renovar CSRF | Igual |

Las firmas autentican datos; no los cifran. Esta rotación no exige recifrar
campos ni archivos según el código revisado. Tampoco exige vaciar django_session,
restablecer contraseñas ni tocar las tablas restauradas. Las actualizaciones
normales de sesiones en un despliegue futuro serán escrituras de la aplicación,
no una migración manual de datos.

El frontend intenta refresh después de un 401 y borra los tokens de localStorage
si falla. No se debe prometer una redirección inmediata al login en todas las
pantallas: el estado React puede conservar el usuario hasta recargar o cerrar
sesión. La comunicación del cambio debe indicar que puede ser necesario volver
a iniciar sesión.

### Límite de seguridad de los fallbacks

Una clave antigua en fallback **sigue siendo válida para verificar firmas**.
Si está comprometida o se considera predecible, conservarla permite aceptar
firmas que un tercero podría fabricar. En ese caso corresponde retirarla sin
periodo de gracia y aceptar la invalidación de sesiones y JWT, con autorización.
La advertencia actual por longitud no prueba por sí sola una filtración.

El check de despliegue puede cambiar de `security.W009` a `security.W025` si
la clave nueva es fuerte pero el fallback antiguo sigue siendo débil. No se
debe silenciar esa advertencia: sólo desaparecerá al retirar el fallback débil.

## Propuesta recomendada, pendiente de autorización

Separar las claves Django y JWT y realizar una rotación programada con **un
único nuevo login de los usuarios de API**, preservando temporalmente las
sesiones de administración mediante SECRET_KEY_FALLBACKS, siempre que no haya
indicios de compromiso de la clave anterior.

Propuesta de gracia: **48 horas**, con fecha de retirada acordada. Las sesiones
antiguas que no se hayan renovado al retirar el fallback requerirán login; la
edad predeterminada de 14 días no implica que todas hayan migrado en 48 horas.
Si preservar también sesiones inactivas es imprescindible, se puede evaluar
hasta 14 días más margen desde la última firma con la clave anterior, a costa
de mantenerla confiable más tiempo. Los mensajes firmados sin caducidad explícita
no tienen garantía de supervivencia: al retirar el fallback pueden descartarse.

### 1. Implementación preparatoria, con valores todavía sin rotar

En una futura tarea autorizada:

- Leer `DJANGO_SECRET_KEY_FALLBACKS_JSON` como JSON, lista de strings no vacíos;
  usar `[]` cuando la variable esté ausente, rechazar JSON/tipos inválidos,
  duplicados y la clave primaria repetida. No incluir valores en excepciones.
- Leer JWT desde una variable independiente `JWT_SIGNING_KEY` y dejar de
  derivarlo automáticamente de DJANGO_SECRET_KEY.
- Exigir explícitamente claves presentes y no vacías en producción; eliminar
  los valores por defecto inseguros. La ausencia debe impedir el arranque,
  sin imprimir secretos.
- Preparar en el archivo privado la variable JWT con el valor que ya usa el
  backend, y fallbacks vacíos. Así el despliegue preparatorio puede mantener
  sesiones y JWT exactamente como estaban. Probarlo antes de rotar.
- Conservar HS256 y los tiempos actuales; no agregar blacklist, nuevas tablas,
  algoritmos ni validadores multiclave como parte de esta operación.

Nombres conceptuales de la configuración final; **no son cambios ya aplicados**:

```python
SECRET_KEY = os.environ['DJANGO_SECRET_KEY']
SECRET_KEY_FALLBACKS = json.loads(
    os.environ.get('DJANGO_SECRET_KEY_FALLBACKS_JSON', '[]')
)
SIMPLE_JWT['SIGNING_KEY'] = os.environ['JWT_SIGNING_KEY']
```

El ejemplo omite las validaciones descritas; no debe copiarse como una
implementación completa sin ellas. El JSON evita ambigüedades de comas y debe
serializarse correctamente dentro del archivo env. No usar `eval`.

### 2. Ensayo aislado previo al cambio real

Usar SQLite temporal y claves sintéticas, nunca sesiones o tokens productivos:

1. Crear una sesión/admin, mensajes firmados y JWT con una clave sintética vieja.
2. Cambiar a claves sintéticas nuevas independientes; conservar la vieja sólo
   en fallback Django. Verificar conservación de sesión y firma, nuevo login,
   refresh de tokens nuevos y rechazo de JWT antiguos.
3. Retirar el fallback y verificar que se rechazan firmas viejas, mientras las
   nuevas y las sesiones ya renovadas funcionan.
4. Verificar fallo explícito con claves ausentes y JSON inválido, sin imprimir
   valores. Ejecutar checks, pruebas de la aplicación y collectstatic.

No ejecutar el runner de tests contra PostgreSQL productivo ni crear cuentas
de prueba en producción sin una autorización específica.

### 3. Rotación programada y verificación

Después de autorizar los cambios y superar el ensayo:

1. Acordar la ventana, el login requerido para API y la fecha de retirada del
   fallback. Conservar una copia protegida de la configuración para contingencias,
   fuera de Git y sin volcarla a logs o al historial de comandos.
2. Generar **dos claves independientes**, aleatorias y largas (por ejemplo,
   al menos 64 caracteres generados con `secrets`). Escribirlas directamente
   en almacenamiento privado con modo 0600. No pasarlas como argumentos de
   shell, imprimirlas ni copiarlas a tickets/documentación.
3. Poner la clave nueva Django en DJANGO_SECRET_KEY, la nueva JWT en
   JWT_SIGNING_KEY y la anterior Django como único elemento del JSON de
   fallbacks. El backend debe comenzar a firmar todo lo nuevo con claves nuevas.
4. Recrear sólo backend con Compose. Un mero `docker compose restart` no vuelve
   a leer env_file. Sin migraciones, sin recrear DB y sin cambios a Nginx central.
5. Revisar checks y logs sin secretos; la advertencia W025 puede persistir
   durante la gracia. Verificar HTTPS, API, admin, nuevo login y refresh.
   Las comprobaciones de nuevas sesiones escriben normalmente en DB: acordar
   una cuenta real con el operador para probarlas, sin manipular datos a mano.
6. Confirmar que todos los workers usan las claves nuevas y registrar la hora
   de corte; calcular desde allí la ventana del fallback.

No implementar una verificación multiclave de JWT sólo para evitar el login.
Eso requeriría otro diseño, límites temporales y ensayos específicos, y seguiría
confiando en la clave antigua para la API. Mantener SIGNING_KEY vieja mientras
sólo se rota Django también conserva JWT, pero **no completa la rotación de la
clave débil**, por lo que no es la solución final recomendada.

### 4. Retirar la clave antigua

Al terminar la ventana acordada, dejar el JSON de fallbacks como `[]`, recrear
sólo backend y volver a verificar checks y autenticación. Las sesiones que aún
dependan de la clave vieja deberán iniciar sesión. No borrar filas de sesiones
para lograrlo: basta con dejar de confiar en esa firma.

Eliminar las copias temporales y variables antiguas según la política de
respaldo/secretos; no dejar una copia olvidada como fallback permanente.

### Reversión

Evitar restaurar indiscriminadamente un `.env` viejo: haría volver la firma JWT
antigua e invalidaría los tokens nuevos, además de reintroducir el riesgo.
Si falla el código preparatorio antes de rotar, se puede volver a la imagen
anterior manteniendo los valores originales. Después de rotar, una reversión
debe conservar la separación de claves y su compatibilidad; no todas las
imágenes anteriores leen JWT_SIGNING_KEY. Evaluar antes de actuar. Si la causa
es una clave comprometida, nunca reintroducirla para recuperar sesiones.

## Evidencia obtenida durante esta revisión

Además de consultar el código instalado, se ejecutó un contenedor temporal
`--network none --read-only`, sin env_file ni volúmenes, con material sintético.
No se consultó PostgreSQL ni se utilizaron claves reales en el ensayo:

- Firma Django y payload de sesión antiguos: aceptados con fallback.
- JWT firmado con la clave anterior: rechazado con nueva SIGNING_KEY aunque
  Django tenga el fallback.
- Firma antigua: rechazada al retirar el fallback.

No se probó aún una rotación real ni se implementó el soporte de configuración
propuesto. **La siguiente acción requiere autorización del operador.**

## Fuentes

- Django: SECRET_KEY, usos y fallbacks:
  https://docs.djangoproject.com/en/5.2/ref/settings/#secret-key-fallbacks
- Código de sesiones Django 5.2.18:
  https://github.com/django/django/blob/5.2.18/django/contrib/sessions/backends/base.py
- Autenticación de sesiones y renovación por fallback:
  https://github.com/django/django/blob/5.2.18/django/contrib/auth/__init__.py
- Simple JWT recomienda separar SIGNING_KEY de SECRET_KEY:
  https://django-rest-framework-simplejwt.readthedocs.io/en/stable/settings.html#signing-key
- Backend Simple JWT 5.5.1, verificación HMAC con una sola clave:
  https://github.com/jazzband/djangorestframework-simplejwt/blob/v5.5.1/rest_framework_simplejwt/backends.py
