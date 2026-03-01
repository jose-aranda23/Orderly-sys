const db = require('../config/db');

class AuditRepository {
    async createLog(usuario_id, accion, entidad, entidad_id, descripcion, explicitConn = null) {
        // Option to receive an explicit connection to handle transactions
        const conn = explicitConn || await db.getConnection();
        try {
            const result = await conn.query(
                `INSERT INTO auditoria (usuario_id, accion, entidad, entidad_id, descripcion)
                 VALUES (?, ?, ?, ?, ?)`,
                [usuario_id || null, accion, entidad, entidad_id || null, descripcion]
            );
            return result.insertId;
        } finally {
            if (!explicitConn && conn) conn.release();
        }
    }

    async getLogs(limit = 100, offset = 0) {
        const conn = await db.getConnection();
        try {
            const logs = await conn.query(
                `SELECT a.*, u.nombre as usuario_nombre, u.correo as usuario_correo
                 FROM auditoria a 
                 LEFT JOIN usuarios u ON a.usuario_id = u.id 
                 ORDER BY a.fecha DESC LIMIT ? OFFSET ?`,
                [limit, offset]
            );
            return logs;
        } finally {
            if (conn) conn.release();
        }
    }
}

module.exports = new AuditRepository();
