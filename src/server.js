const app = require('./app');
const env = require('./config/env');
const db = require('./config/db');

const startServer = async () => {
    try {
        // Verificar conexión a DB antes de levantar
        const conn = await db.getConnection();
        console.log('✅ Conexión a Base de Datos MariaDB establecida.');
        conn.release();

        app.listen(env.PORT, () => {
            console.log(`🚀 Servidor corriendo en puerto ${env.PORT} en entorno ${process.env.NODE_ENV || 'development'}`);
        });

    } catch (error) {
        console.error('❌ Error al iniciar el servidor:', error);
        process.exit(1);
    }
};

startServer();
