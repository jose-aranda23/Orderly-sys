# Sistema de Gestión de Solicitudes de Producción

Sistema avanzado con estricto control de autorización multicapa, pistas de auditoría integradas y reglas de negocio robustas. Desarrollado en Node.js, Express y MariaDB.

## Requisitos
- **Node.js**: v18+
- **MariaDB**: v10.4+

## Instalación y Despliegue

### 1. Clonar / Preparar Directorio
Acceder a la carpeta del proyecto (donde resida este archivo).

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Base de Datos
1. Inicie su servicio local o remoto de MariaDB.
2. Ejecute el script `database/schema.sql` en su gestor de bases de datos preferido (DBeaver, HeidiSQL, phpMyAdmin, línea de comandos de MariaDB).
   Esto creará la base de datos `sistema_produccion`, las tablas necesarias y registrará al usuario administrador root.
3. Configure los datos de conexión correspondientes en el archivo `.env`.
   
   > **Nota:** La contraseña por defecto del administrador inicial es `admin123`.

### 4. Variables de Entorno (`.env`)
Asegúrese que en el archivo `.env` sus variables reflejen su entorno de MariaDB:
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=su_password
DB_NAME=sistema_produccion
DB_PORT=3306
JWT_SECRET=production_secret_key_change_me
JWT_EXPIRES_IN=8h
```

### 5. Iniciar Servidor
Para desarrollo (con hot-reloading via nodemon):
```bash
npm run dev
```

Para entorno productivo:
```bash
npm start
```

## Arquitectura y Reglas Aplicadas
- **Controllers**: Exclusivos para recepción, orquestación DTO y entrega de respuestas HTTP.
- **Services**: Contienen toda la lógica de negocio purificada y estricta (validaciones de estados, inmutabilidad de variables posterior a aprobación y protección de auto-bloqueo).
- **Repositories**: Aislamiento total de MariaDB SQL queries. Únicos autorizados a lanzar interacciones DB.
- **Auditoría Transversal**: Registros automáticos inmutables en eventos de autenticación, CRUD y ciclo de vida de Solicitudes. Todo cambio crítico está traceado y es bloqueante si falla su guardado.

## Resumen de Endpoint Clave y Reglas
- Regla 5 Intentos Fallidos activa y funcional en ruta `/api/v1/usuarios/login`.
- Controladores fuertemente protegidos por middleware `requireLevel(min_level)` (Niveles del 1 al 4).
- Flujo de solicitudes:
  1. `CREADA` -> `APROBADA` (Debe suministrar la `fecha_finalizacion_programada`).
  2. Una vez aprobada es inmutable esa fecha (ver `request.service.js`).
  3. `RECHAZADA` exige enviar `justificacion_rechazo`.

## Prueba con Postman
Importe la colección `docs/postman_collection.json` para testear flujos en pocos clics.
