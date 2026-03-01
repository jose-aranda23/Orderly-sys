1. Arquitectura obligatoria

Separación estricta en capas: controller, service, repository.

Prohibido colocar lógica de negocio en controllers.

Prohibido consultas SQL fuera de repositories.

2. Seguridad obligatoria

Contraseñas solo con bcrypt.

JWT obligatorio en endpoints protegidos.

Middleware de autorización por nivel obligatorio.

Bloqueo tras 5 intentos fallidos.

3. Integridad de negocio

No permitir aprobación sin fecha_finalizacion_programada.

No permitir modificar fecha_finalizacion_programada después de aprobar.

No permitir rechazo sin justificación.

Finalización siempre manual.

4. Auditoría obligatoria

Cada acción crítica debe registrar evento en tabla auditoria.

Si falla auditoría, debe fallar la operación.

5. Calidad de código

Manejo centralizado de errores.

Validaciones backend estrictas.

Sin datos hardcodeados.

Código listo para producción.