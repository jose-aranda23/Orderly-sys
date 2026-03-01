const { verifyToken } = require('../utils/crypto');
const db = require('../config/db');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Acceso denegado. Token no proporcionado.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = verifyToken(token);

        // Verificar si el usuario existe y su estado actual en DB
        const conn = await db.getConnection();
        try {
            const users = await conn.query('SELECT id, nivel, estado, bloqueado FROM usuarios WHERE id = ?', [decoded.id]);
            if (users.length === 0) {
                return res.status(401).json({ success: false, message: 'Usuario no encontrado.' });
            }
            const user = users[0];
            if (user.estado !== 'activo') {
                return res.status(403).json({ success: false, message: 'Acceso denegado. Usuario inactivo.' });
            }
            if (user.bloqueado) {
                return res.status(403).json({ success: false, message: 'Acceso denegado. Usuario bloqueado por seguridad.' });
            }
            
            // Adjuntar información verificada al request
            req.user = {
                id: user.id,
                nivel: user.nivel
            };
            next();
        } finally {
            if (conn) conn.release();
        }
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Token inválido o expirado.', error: error.message });
    }
};

module.exports = { authenticate };
