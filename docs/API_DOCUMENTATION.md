# Documentación de API

## Base URL
```
http://localhost:3000/api/v1
```

## Autenticación

Todos los endpoints (excepto `/login`) requieren autenticación JWT.

### Header de Autenticación
```
Authorization: Bearer <token_jwt>
```

---

## Endpoints de Autenticación

### 🔐 Iniciar Sesión

**POST** `/usuarios/login`

Autentica un usuario y retorna el token JWT.

**Request Body:**
```json
{
  "correo": "admin@test.com",
  "contrasena": "admin123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Bienvenido de nuevo.",
  "data": {
    "token": "eyJhbGciOiJIUzI1...",
    "user": {
      "id": 1,
      "nombre": "Administrador",
      "correo": "admin@test.com",
      "nivel": 4
    }
  }
}
```

---

## Endpoints de Usuarios

### 📋 Listar Usuarios

**GET** `/usuarios`

Requiere nivel: 3

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Administrador",
      "correo": "admin@test.com",
      "nivel": 4,
      "estado": "activo",
      "intentos_fallidos": 0
    }
  ]
}
```

---

### ➕ Crear Usuario

**POST** `/usuarios`

Requiere nivel: 3

**Request Body:**
```json
{
  "nombre": "Juan Pérez",
  "correo": "juan@empresa.com",
  "contrasena": "password123",
  "nivel": 2
}
```

**Campos:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| nombre | string | Sí | Nombre completo (mín. 3 caracteres) |
| correo | string | Sí | Correo electrónico válido |
| contrasena | string | Sí | Mín. 6 caracteres |
| nivel | number | Sí | 1-4 (1=Operador, 2=Producción, 3=Supervisor, 4=Admin) |

---

### ✏️ Actualizar Usuario

**PUT** `/usuarios/:id`

Requiere nivel: 3

**Request Body:**
```json
{
  "nombre": "Juan Pérez Actualizado",
  "correo": "juan@empresa.com",
  "nivel": 3
}
```

---

### 🔑 Restaurar Contraseña

**POST** `/usuarios/:id/reset-password`

Requiere nivel: 3

**Request Body:**
```json
{
  "nueva_contrasena": "nuevapass123"
}
```

---

### 🔄 Activar Usuario

**PATCH** `/usuarios/:id/activar`

Requiere nivel: 3

**Response (200):**
```json
{
  "success": true,
  "message": "Usuario activado correctamente."
}
```

---

### ⏸️ Desactivar Usuario

**PATCH** `/usuarios/:id/desactivar`

Requiere nivel: 3

**Response (200):**
```json
{
  "success": true,
  "message": "Usuario desactivado correctamente."
}
```

---

### 🗑️ Eliminar Usuario

**DELETE** `/usuarios/:id`

Requiere nivel: 3

**Response (200):**
```json
{
  "success": true,
  "message": "Usuario eliminado correctamente."
}
```

---

### 📋 Lista de Usuarios (para filtros)

**GET** `/usuarios/list`

Requiere nivel: 3

Retorna lista simplificada de usuarios (id y nombre) para usar en filtros.

**Response (200):**
```json
{
  "success": true,
  "data": [
    { "id": 1, "nombre": "Administrador" },
    { "id": 2, "nombre": "Juan Pérez" }
  ]
}
```

---

## Endpoints de Solicitudes

### 📋 Listar Solicitudes

**GET** `/solicitudes`

- **Nivel 1**: Ve solo sus propias solicitudes
- **Nivel 2+**: Ve todas las solicitudes

**Query Parameters:**
| Parametro | Tipo | Descripción |
|-----------|------|-------------|
| page | number | Número de página (default: 1) |
| limit | number | Registros por página (default: 50) |

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "producto_id": 5,
      "producto_nombre": "Producto A",
      "tipo_envase": "Botella 500ml",
      "cantidad": 1000,
      "estado": "CREADA",
      "creador_nombre": "Juan Pérez",
      "fecha_creacion": "2026-03-01T10:00:00.000Z"
    }
  ]
}
```

---

### ➕ Crear Solicitud

**POST** `/solicitudes`

Requiere nivel: 1

**Request Body:**
```json
{
  "producto_id": 5,
  "producto_personalizado": null,
  "tipo_envase": "Botella 500ml",
  "cantidad": 1000,
  "nota": "Solicitud urgente"
}
```

**Campos:**
| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| producto_id | number | Sí* | ID del producto (requerido si no usa personalizado) |
| producto_personalizado | string | Sí* | Nombre del producto (requerido si no usa producto del catálogo) |
| tipo_envase | string | Sí | Tipo de envase |
| cantidad | number | Sí | Cantidad solicitada |
| nota | string | No | Notas adicionales |

---

### 🔄 Cambiar Estado

**PATCH** `/solicitudes/:id/estado`

Requiere nivel: 2

**Request Body (Aprobar):**
```json
{
  "estado": "APROBADA",
  "fecha_finalizacion_programada": "2026-03-15"
}
```

**Request Body (Rechazar):**
```json
{
  "estado": "RECHAZADA",
  "justificacion_rechazo": "Falta de materia prima"
}
```

**Request Body (En Producción):**
```json
{
  "estado": "EN_PRODUCCION"
}
```

**Request Body (Finalizar):**
```json
{
  "estado": "FINALIZADA"
}
```

---

### 📊 Exportar a Excel

**GET** `/solicitudes/exportar`

Requiere nivel: 3

Retorna un archivo Excel (.xlsx) con todas las solicitudes.

**Query Parameters (opcionales):**
| Parametro | Tipo | Descripción |
|-----------|------|-------------|
| usuario_id | number | Filtrar por usuario |
| estado | string | Filtrar por estado |
| fecha_inicio | date | Filtrar desde fecha |
| fecha_fin | date | Filtrar hasta fecha |

**Response:** Archivo Excel (application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)

---

### 📋 Listar Todas las Solicitudes (Informes)

**GET** `/solicitudes/todos`

Requiere nivel: 3

Similar a `/solicitudes` pero sin paginación, para usar en informes.

**Query Parameters (opcionales):**
| Parametro | Tipo | Descripción |
|-----------|------|-------------|
| usuario_id | number | Filtrar por usuario |
| estado | string | Filtrar por estado |
| fecha_inicio | date | Filtrar desde fecha |
| fecha_fin | date | Filtrar hasta fecha |

---

## Endpoints de Productos

### 📋 Listar Productos

**GET** `/productos`

Requiere nivel: 3

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Producto A",
      "descripcion": "Descripción del producto",
      "estado": "activo"
    }
  ]
}
```

---

### ➕ Crear Producto

**POST** `/productos`

Requiere nivel: 3

**Request Body:**
```json
{
  "nombre": "Nuevo Producto",
  "descripcion": "Descripción del producto",
  "estado": "activo"
}
```

---

### ✏️ Actualizar Producto

**PUT** `/productos/:id`

Requiere nivel: 3

---

### 🗑️ Eliminar Producto

**DELETE** `/productos/:id`

Requiere nivel: 3

---

## Códigos de Estado HTTP

| Código | Descripción |
|--------|-------------|
| 200 | Éxito |
| 201 | Creado |
| 400 | Bad Request - Datos inválidos |
| 401 | Unauthorized - No autenticado |
| 403 | Forbidden - Sin permisos |
| 404 | Not Found - Recurso no encontrado |
| 500 | Internal Server Error |

---

## Errores Comunes

### 401 - Token expirado
```json
{
  "success": false,
  "message": "Sesión expirada o permisos insuficientes."
}
```

### 400 - Validación fallida
```json
{
  "success": false,
  "message": "Validación fallida",
  "errors": [
    { "msg": "El nombre es requerido", "param": "nombre" }
  ]
}
```
