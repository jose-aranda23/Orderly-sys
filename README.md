# Sistema de Gestión de Solicitudes de Producción

Sistema web empresarial para la gestión de solicitudes de producción con control de acceso jerárquico, auditoría completa y exportación de informes.

## 🚀 Características

- **Gestión de Usuarios** - Sistema de niveles (1-4) con control de acceso
- **Solicitudes de Producción** - Flujo completo de solicitudes con estados
- **Gestión de Productos** - Catálogo de productos fabricables
- **Informes y Estadísticas** - Dashboard con filtros y exportación a Excel
- **Auditoría** - Registro completo de todas las acciones del sistema
- **Seguridad** - Autenticación JWT, protección de rutas, intentos fallidos

## 📋 Requisitos

- **Node.js**: v18+
- **MariaDB**: v10.4+

## 🛠️ Instalación

### 1. Clonar el proyecto
```bash
git clone <repositorio> cd sistema-produccion
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Base de Datos
1. Inicie MariaDB en su servidor
2. Ejecute el script `database/schema.sql`
3. Configure las credenciales en `.env`

### 4. Variables de Entorno (.env)
```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=su_password
DB_NAME=sistema_produccion
DB_PORT=3306
JWT_SECRET=su_secret_key
JWT_EXPIRES_IN=8h
```

### 5. Iniciar Servidor

**Desarrollo (con hot-reload):**
```bash
npm run dev
```

**Producción:**
```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## 👤 Credenciales por Defecto

| Usuario | Correo | Contraseña | Nivel |
|---------|--------|------------|-------|
| Administrador | admin@test.com | ******** | 4 |

## 📱 Funcionalidades

### Niveles de Acceso

| Nivel | Nombre | Permisos |
|-------|--------|----------|
| 1 | Operador | Crear solicitudes propias |
| 2 | Producción | Gestionar solicitudes (aprobar, rechazar, finalizar) |
| 3 | Supervisor | Gestionar usuarios, productos, informes |
| 4 | Administrador | Acceso total al sistema |

### Estados de Solicitud

```
CREADA → APROBADA → EN_PRODUCCION → FINALIZADA
    ↓
  RECHAZADA
```

### Módulos del Sistema

1. **Solicitudes** - Crear y gestionar solicitudes de producción
2. **Productos** - Catálogo de productos fabricables
3. **Informes** - Dashboard con estadísticas y exportación a Excel
4. **Usuarios** - Gestión de usuarios del sistema

## 📂 Estructura del Proyecto

```
sistema-produccion/
├── src/
│   ├── config/          # Configuración
│   ├── controllers/    # Controladores HTTP
│   ├── dtos/          # Objetos de transferencia de datos
│   ├── middlewares/    # Middlewares Express
│   ├── repositories/   # Acceso a datos
│   ├── routes/        # Rutas API
│   ├── services/      # Lógica de negocio
│   └── utils/         # Utilidades
├── public/            # Archivos estáticos
├── database/          # Scripts de base de datos
├── docs/             # Documentación
└── package.json
```

## 📖 Documentación

- [Contrato Técnico](./TECHNICAL_CONTRACT.md)
- [Documentación API](./docs/API_DOCUMENTATION.md)
- [Manual de Usuario](./docs/USER_GUIDE.md)
- [Guía de Despliegue](./docs/DEPLOYMENT_GUIDE.md)
- [Changelog](./docs/CHANGELOG.md)

## 🧪 Probar con Postman

Importe la colección `docs/postman_collection.json` para testear todos los endpoints.

## 📝 Licencia

Jose Aranda - Todos los derechos reservados
