const auditRepository = require('../repositories/audit.repository');

class AuditService {
    async logAction(context) {
        const { usuario_id, accion, entidad, entidad_id, descripcion, conn } = context;
        try {
            if (!accion || !entidad || !descripcion) {
                throw new Error('Faltan datos obligatorios para registrar la auditoría.');
            }
            await auditRepository.createLog(usuario_id, accion, entidad, entidad_id, descripcion, conn);
        } catch (error) {
            console.error('CRÍTICO: Error al registrar auditoría:', error.message);
            // La auditoría es obligatoria; si falla, la operación principal debería fallar
            throw new Error(`Fallo en registro de auditoría: ${error.message}`);
        }
    }

    async getAuditLogs(page = 1, limit = 100) {
        const offset = (page - 1) * limit;
        return await auditRepository.getLogs(limit, offset);
    }
}

module.exports = new AuditService();
