CREATE DATABASE IF NOT EXISTS sistema_produccion;
USE sistema_produccion;

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    nivel INT NOT NULL CHECK (nivel BETWEEN 1 AND 4),
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    intentos_fallidos INT DEFAULT 0,
    bloqueado BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    estado ENUM('activo', 'inactivo') DEFAULT 'activo',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS solicitudes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    producto_id INT NULL,
    producto_personalizado VARCHAR(150) NULL,
    tipo_envase VARCHAR(100) NOT NULL,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    usuario_creador INT NOT NULL,
    estado ENUM('CREADA', 'APROBADA', 'EN_PRODUCCION', 'FINALIZADA', 'RECHAZADA') DEFAULT 'CREADA',
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_finalizacion_programada DATE NULL,
    fecha_finalizacion_real DATE NULL,
    justificacion_rechazo TEXT NULL,
    nota TEXT NULL,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_creador) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS auditoria (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NULL,
    accion VARCHAR(100) NOT NULL,
    entidad VARCHAR(100) NOT NULL,
    entidad_id INT NULL,
    descripcion TEXT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

-- Usuario admin inicial (nivel 4)
-- Contraseña por defecto: admin123
INSERT IGNORE INTO usuarios (nombre, correo, contrasena, nivel, estado)
VALUES ('Administrador Inicial', 'admin@sistema.com', '$2b$10$Pj0B3hWzXvH/LzXvLhD9qu2w7QZ8u5I2T1k7l5O4n3m2j8H9V6jW.', 4, 'activo');
