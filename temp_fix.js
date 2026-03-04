const db = require('./src/config/db');
const bcrypt = require('bcrypt');

async function fixAdmin() {
    console.log('Generando hash para admin123...');
    const hash = await bcrypt.hash('admin123', 10);
    
    const conn = await db.getConnection();
    try {
        console.log('Actualizando base de datos...');
        await conn.query('UPDATE usuarios SET contrasena = ?, intentos_fallidos = 0, bloqueado = false WHERE correo = "admin@sistema.com"', [hash]);
        console.log('Contraseña de administrador reseteada exitosamente. Intentos restautados a 0.');
    } catch (e) {
        console.error('Error DB:', e);
    } finally {
        if(conn) conn.release();
        process.exit(0);
    }
}

fixAdmin();
