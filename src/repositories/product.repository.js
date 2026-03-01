const db = require('../config/db');

class ProductRepository {
    async create(data) {
        const conn = await db.getConnection();
        try {
            const result = await conn.query(
                'INSERT INTO productos (nombre, descripcion) VALUES (?, ?)',
                [data.nombre, data.descripcion || null]
            );
            return result.insertId;
        } finally {
            if (conn) conn.release();
        }
    }

    async update(id, data) {
        const conn = await db.getConnection();
        try {
            const updates = [];
            const values = [];
            for (const [key, value] of Object.entries(data)) {
                updates.push(`${key} = ?`);
                values.push(value);
            }
            if (updates.length === 0) return;
            
            values.push(id);
            await conn.query(
                `UPDATE productos SET ${updates.join(', ')} WHERE id = ?`,
                values
            );
        } finally {
            if (conn) conn.release();
        }
    }

    async delete(id) {
        const conn = await db.getConnection();
        try {
            await conn.query('DELETE FROM productos WHERE id = ?', [id]);
        } finally {
            if (conn) conn.release();
        }
    }

    async findById(id) {
        const conn = await db.getConnection();
        try {
            const rows = await conn.query('SELECT * FROM productos WHERE id = ?', [id]);
            return rows.length ? rows[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    async findAll(limit, offset, includeInactive = false) {
        const conn = await db.getConnection();
        try {
            let query = 'SELECT * FROM productos ';
            if (!includeInactive) {
                query += 'WHERE estado = "activo" ';
            }
            query += 'ORDER BY id DESC LIMIT ? OFFSET ?';
            return await conn.query(query, [limit, offset]);
        } finally {
            if (conn) conn.release();
        }
    }
}

module.exports = new ProductRepository();
