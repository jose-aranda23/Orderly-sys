const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middlewares/error.middleware');

// Routes
const userRoutes = require('./routes/user.routes');
const productRoutes = require('./routes/product.routes');
const requestRoutes = require('./routes/request.routes');

const path = require('path');

const app = express();

// Fix para serialización de BigInt provenientes de MariaDB (ej. insertId)
app.set('json replacer', (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
);

// Servir archivos estáticos del Frontend
// Servir archivos estáticos con deshabilitación de caché (Desarrollo)
app.use(express.static(path.join(__dirname, '../public'), {
    maxAge: 0,
    etag: false,
    lastModified: false,
    setHeaders: (res, path) => {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
    }
}));

// Middlewares globales de seguridad, log y parsing
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// Prefixing routes
app.use('/api/v1/usuarios', userRoutes);
app.use('/api/v1/productos', productRoutes);
app.use('/api/v1/solicitudes', requestRoutes);

// General 404 Route
app.use((req, res, next) => {
    res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Centralized Error Handling
app.use(errorHandler);

module.exports = app;
