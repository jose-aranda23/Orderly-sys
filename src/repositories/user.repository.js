const db = require('../config/db');

class UserRepository {
    async findByEmail(correo) {
        const conn = await db.getConnection();
        try {
            const users = await conn.query('SELECT * FROM usuarios WHERE correo = ?', [correo]);
            return users.length ? users[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    async findById(id) {
        const conn = await db.getConnection();
        try {
            const users = await conn.query('SELECT * FROM usuarios WHERE id = ?', [id]);
            return users.length ? users[0] : null;
        } finally {
            if (conn) conn.release();
        }
    }

    async create(userData) {
        const conn = await db.getConnection();
        try {
            const { nombre, correo, contrasena, nivel } = userData;
            const result = await conn.query(
                'INSERT INTO usuarios (nombre, correo, contrasena, nivel) VALUES (?, ?, ?, ?)',
                [nombre, correo, contrasena, nivel]
            );
            return result.insertId;
        } finally {
            if (conn) conn.release();
        }
    }

    async updateLoginAttempts(id, intentos, bloqueado) {
        const conn = await db.getConnection();
        try {
            await conn.query(
                'UPDATE usuarios SET intentos_fallidos = ?, bloqueado = ? WHERE id = ?',
                [intentos, bloqueado, id]
            );
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
                `UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`,
                values
            );
        } finally {
            if (conn) conn.release();
        }
    }

    async findAll(limit, offset) {
        const conn = await db.getConnection();
        try {
            return await conn.query(
                'SELECT id, nombre, correo, nivel, estado, bloqueado, intentos_fallidos, fecha_creacion, fecha_actualizacion FROM usuarios ORDER BY id ASC LIMIT ? OFFSET ?',
                [limit, offset]
            );
        } finally {
            if (conn) conn.release();
        }
    }

    async delete(id) {
        const conn = await db.getConnection();
        try {
            await conn.query('DELETE FROM usuarios WHERE id = ?', [id]);
        } finally {
            if (conn) conn.release();
        }
    }
}

module.exports = new UserRepository();
