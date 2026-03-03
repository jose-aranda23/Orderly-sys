const db = require('../config/db');

class RequestRepository {
    async create(data) {
        const conn = await db.getConnection();
        try {
            const result = await conn.query(
                `INSERT INTO solicitudes 
                (producto_id, producto_personalizado, tipo_envase, cantidad, usuario_creador, nota, estado) 
                VALUES (?, ?, ?, ?, ?, ?, 'CREADA')`,
                [data.producto_id || null, data.producto_personalizado || null, data.tipo_envase, data.cantidad, data.usuario_creador, data.nota || null]
            );
            return result.insertId;
        } finally {
            if (conn) conn.release();
        }
    }

    async findById(id) {
        const conn = await db.getConnection();
        try {
            const rows = await conn.query('SELECT * FROM solicitudes WHERE id = ?', [id]);
            return rows.length ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    async updateStatusAndFields(id, updates) {
        const conn = await db.getConnection();
        try {
            const setFields = [];
            const values = [];
            for (const [key, value] of Object.entries(updates)) {
                setFields.push(`${key} = ?`);
                values.push(value);
            }
            if (setFields.length === 0) return;
            
            values.push(id);
            await conn.query(
                `UPDATE solicitudes SET ${setFields.join(', ')} WHERE id = ?`,
                values
            );
        } finally {
            if (conn) conn.release();
        }
    }

    async findAll(limit, offset, filterByUserId = null) {
        const conn = await db.getConnection();
        try {
            let query = `SELECT s.*, p.nombre as producto_nombre, u.nombre as creador_nombre 
                         FROM solicitudes s 
                         LEFT JOIN productos p ON s.producto_id = p.id 
                         JOIN usuarios u ON s.usuario_creador = u.id `;
            let params = [];
            if (filterByUserId) {
                query += 'WHERE s.usuario_creador = ? ';
                params.push(filterByUserId);
            }
            query += 'ORDER BY s.fecha_creacion DESC LIMIT ? OFFSET ?';
            params.push(limit, offset);
            return await conn.query(query, params);
        } finally {
            if (conn) conn.release();
        }
    }

    async findAllForExport() {
        const conn = await db.getConnection();
        try {
            const query = `SELECT s.*, p.nombre as producto_nombre, u.nombre as creador_nombre 
                           FROM solicitudes s 
                           LEFT JOIN productos p ON s.producto_id = p.id 
                           JOIN usuarios u ON s.usuario_creador = u.id 
                           ORDER BY s.fecha_creacion DESC`;
            return await conn.query(query);
        } finally {
            if (conn) conn.release();
        }
    }

    async findAllFiltered(filters = {}) {
        const conn = await db.getConnection();
        try {
            const { usuario_id, fecha_inicio, fecha_fin, estado } = filters;
            let query = `SELECT s.*, p.nombre as producto_nombre, u.nombre as creador_nombre 
                         FROM solicitudes s 
                         LEFT JOIN productos p ON s.producto_id = p.id 
                         JOIN usuarios u ON s.usuario_creador = u.id 
                         WHERE 1=1`;
            let params = [];

            if (usuario_id) {
                query += ' AND s.usuario_creador = ?';
                params.push(usuario_id);
            }

            if (estado) {
                query += ' AND s.estado = ?';
                params.push(estado);
            }

            if (fecha_inicio) {
                query += ' AND DATE(s.fecha_creacion) >= ?';
                params.push(fecha_inicio);
            }

            if (fecha_fin) {
                query += ' AND DATE(s.fecha_creacion) <= ?';
                params.push(fecha_fin);
            }

            query += ' ORDER BY s.fecha_creacion DESC';
            return await conn.query(query, params);
        } finally {
            if (conn) conn.release();
        }
    }
}

module.exports = new RequestRepository();
