📄 CONTRATO TÉCNICO EMPRESARIAL
Sistema de Gestión de Solicitudes de Producción
1️⃣ OBJETO DEL CONTRATO

Este documento establece las reglas técnicas, arquitectónicas, de seguridad y de negocio obligatorias para el desarrollo del sistema empresarial de Gestión de Solicitudes de Producción.

Todo componente generado deberá cumplir estrictamente este contrato.
Cualquier implementación que lo viole se considera inválida.

2️⃣ ALCANCE DEL SISTEMA

Sistema web empresarial con:

Gestión jerárquica de usuarios (niveles 1–4)

Gestión de productos fabricables

Gestión de solicitudes de producción

Control estricto de estados

Auditoría completa y trazabilidad

Base de datos MariaDB

Arquitectura escalable y mantenible

3️⃣ ARQUITECTURA OBLIGATORIA
3.1 Separación de capas

Estructura mínima obligatoria:

/controllers
/services
/repositories
/middlewares
/routes
/models
/config
/utils
3.2 Restricciones estructurales

Prohibido colocar lógica de negocio en controllers.

Prohibido ejecutar consultas SQL fuera de repositories.

Services contienen la lógica empresarial.

Controllers solo gestionan request/response.

Middleware gestiona autenticación y autorización.

4️⃣ SEGURIDAD OBLIGATORIA
4.1 Autenticación

JWT obligatorio.

Tokens firmados con secreto seguro.

Expiración definida.

4.2 Contraseñas

Encriptación obligatoria con bcrypt.

Nunca almacenar texto plano.

4.3 Control de intentos

Bloqueo automático tras 5 intentos fallidos.

Registro en auditoría.

4.4 Autorización

Middleware obligatorio que valide:

Nivel jerárquico

Estado activo

Permisos por operación

5️⃣ MODELO DE USUARIOS

Campos obligatorios:

id

nombre

correo (único)

contraseña_hash

nivel (1–4)

estado (activo/inactivo)

intentos_fallidos

bloqueado

fecha_creacion

fecha_actualizacion

6️⃣ MODELO DE PRODUCTOS

Campos:

id

nombre

descripcion

estado

fecha_creacion

Solo Nivel 3 o superior puede gestionar productos.

7️⃣ MODELO DE SOLICITUDES

Campos obligatorios:

id

producto_id (nullable)

producto_personalizado

tipo_envase

cantidad

usuario_creador_id

estado

fecha_creacion

fecha_finalizacion_programada

fecha_finalizacion_real

justificacion_rechazo

nota

8️⃣ ESTADOS PERMITIDOS

Estados válidos:

CREADA

APROBADA

EN_PRODUCCION

FINALIZADA

RECHAZADA

Prohibido aceptar estados fuera de este catálogo.

9️⃣ REGLAS DE NEGOCIO CRÍTICAS
9.1 Aprobación

Solo Nivel 2 o superior.

Fecha_finalizacion_programada obligatoria.

Una vez asignada, NO puede modificarse.

Registrar evento en auditoría.

9.2 Finalización

Solo manual.

Puede ser antes o después de fecha programada.

Registrar fecha_real.

Registrar auditoría.

9.3 Rechazo

Solo Nivel 2 o superior.

Justificación obligatoria.

Registrar auditoría.

🔟 MATRIZ DE PERMISOS
Nivel 1

Crear solicitudes

Ver solicitudes propias

Nivel 2

Aprobar

Rechazar

Pasar a producción

Finalizar

Nivel 3

Todo lo anterior

CRUD usuarios nivel 1–3

CRUD productos

Reportes

Auditoría

Nivel 4

Control total

Gestión completa de usuarios

Recuperación de cuentas

Asignación de niveles

Control total del sistema

11️⃣ AUDITORÍA OBLIGATORIA

Tabla auditoria:

id

usuario_id

accion

entidad

entidad_id

descripcion

fecha

Acciones obligatorias a registrar:

Login

Bloqueo

Aprobación

Rechazo

Cambio de estado

Finalización

Creación/modificación/eliminación de usuario

Cambio de contraseña

Si falla la auditoría, la operación debe fallar.

12️⃣ INTEGRIDAD DE DATOS

Claves foráneas obligatorias.

Índices en:

usuario_creador_id

estado

fecha_creacion

Base de datos normalizada.

No duplicación innecesaria de datos.

13️⃣ VALIDACIONES OBLIGATORIAS

Backend debe validar:

Tipos de datos

Campos obligatorios

Estados válidos

Permisos antes de ejecutar operación

Restricciones de negocio

14️⃣ PROHIBICIONES

Queda estrictamente prohibido:

Código hardcodeado

Saltarse auditoría

Simplificar reglas empresariales

Mezclar capas

Omitir validaciones

Entregar código parcial

15️⃣ ENTREGABLES TÉCNICOS OBLIGATORIOS

Script SQL completo MariaDB

Diagrama ER

Colección Postman

Documentación de instalación

Manual técnico

Manual de usuario

Arquitectura documentada

16️⃣ CONDICIÓN DE VALIDEZ

Cualquier implementación que:

Omita auditoría

Permita modificar fecha programada tras aprobación

Permita aprobar sin fecha

Permita rechazar sin justificación

No valide niveles correctamente

Se considerará incumplimiento del contrato técnico.