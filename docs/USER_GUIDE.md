# Manual de Usuario

## Sistema de Gestión de Solicitudes de Producción

---

## 1. Inicio de Sesión

### 1.1 Acceder al Sistema
1. Abra su navegador web
2. Ingrese la URL del sistema
3. Se mostrará la página de login

### 1.2 Credenciales
Ingrese sus credenciales proporcionadas por el administrador:

| Campo | Descripción |
|-------|-------------|
| Correo | Su correo electrónico registrado |
| Contraseña | Su contraseña |

### 1.3 Recuperar Contraseña
Si olvida su contraseña, contacte al administrador del sistema.

---

## 2. Navegación del Dashboard

### 2.1 Estructura
El sistema cuenta con:
- **Sidebar (izquierda)**: Menú de navegación
- **Header**: Título de la página y botón de acción
- **Contenido principal**: Tablas, formularios y datos

### 2.2 Menú de Navegación

| Sección | Descripción | Nivel Requerido |
|---------|-------------|-----------------|
| 📋 Solicitudes | Gestión de solicitudes de producción | 1+ |
| 📦 Productos | Catálogo de productos | 3+ |
| 📊 Informes | Dashboard y exportación | 3+ |
| 👥 Usuarios | Gestión de usuarios | 3+ |

---

## 3. Módulo de Solicitudes

### 3.1 Ver Solicitudes
Al acceder a "Solicitudes", verá una tabla con:
- ID de solicitud
- Producto solicitado
- Tipo de envase
- Cantidad
- Estado actual
- Acciones disponibles

### 3.2 Crear Nueva Solicitud
1. Haga clic en **"+ Nueva Solicitud"**
2. Complete el formulario:
   - **Producto**: Seleccione del catálogo o ingrese personalizado
   - **Tipo de Envase**: Seleccione el tipo de envase
   - **Cantidad**: Ingrese la cantidad solicitada
   - **Nota**: (Opcional) Agregue alguna observación
3. Haga clic en **"Crear Solicitud"**

### 3.3 Estados de Solicitud

```
CREADA → APROBADA → EN_PRODUCCION → FINALIZADA
    ↓
  RECHAZADA
```

| Estado | Descripción |
|--------|-------------|
| CREADA | Solicitud creada, esperando aprobación |
| APROBADA | Aprobada para producción |
| EN_PRODUCCIÓN | En proceso de producción |
| FINALIZADA | Producción completada |
| RECHAZADA | Solicitud rechazada |

### 3.4 Gestionar Solicitud (Nivel 2+)
1. Haga clic en **"Gestionar"** en la fila de la solicitud
2. Según el estado actual, podrá:
   - **Aprobar**: Ingrese la fecha de finalización programada
   - **Rechazar**: Proporcione justificación
   - **Iniciar Producción**: Marque como en producción
   - **Finalizar**: Complete la solicitud

---

## 4. Módulo de Productos (Nivel 3+)

### 4.1 Ver Productos
Tabla con el catálogo de productos disponibles.

### 4.2 Crear Producto
1. Haga clic en **"+ Nuevo producto"**
2. Complete:
   - Nombre del producto
   - Descripción
   - Estado (activo/inactivo)
3. Guarde

---

## 5. Módulo de Informes (Nivel 3+)

### 5.1 Acceso
Haga clic en **"📊 Informes"** en el menú lateral.

### 5.2 Dashboard de Informes
El módulo de informes incluye:

#### Estadísticas
- **Total**: Total de solicitudes
- **CREADA**: Solicitudes pendientes
- **APROBADA**: Aprobadas
- **EN PROD.**: En producción
- **FINALIZADA**: Completadas
- **RECHAZADA**: Rechazadas

#### Filtros
| Filtro | Descripción |
|--------|-------------|
| Usuario | Filtrar por creador |
| Estado | Filtrar por estado |
| Desde | Fecha de creación inicial |
| Hasta | Fecha de creación final |

#### Tabla de Previsualización
Muestra todas las solicitudes con los filtros aplicados.

### 5.3 Exportar a Excel
1. Aplique los filtros deseados
2. Haga clic en **"📥 Exportar a Excel"**
3. Se descargará un archivo .xlsx con los datos

---

## 6. Módulo de Usuarios (Nivel 3+)

### 6.1 Gestión de Usuarios
Tabla con todos los usuarios del sistema.

### 6.2 Acciones por Usuario

| Botón | Función |
|-------|---------|
| ✏️ | Editar usuario (nombre, correo, nivel) |
| 🔑 | Restaurar contraseña |
| 🔴 | Desactivar usuario |
| 🟢 | Activar usuario |
| 🗑️ | Eliminar usuario |

### 6.3 Crear Usuario
1. Haga clic en **"+ Nuevo usuario"**
2. Complete el formulario:
   - Nombre completo
   - Correo electrónico
   - Contraseña provisional
   - Nivel de acceso
3. Guarde

### 6.4 Niveles de Acceso

| Nivel | Nombre | Permisos |
|-------|--------|----------|
| 1 | Operador | Crear solicitudes propias |
| 2 | Producción | Gestionar solicitudes |
| 3 | Supervisor | Informes, usuarios, productos |
| 4 | Administrador | Acceso total |

---

## 7. Cerrar Sesión

1. Haga clic en **"Cerrar Sesión"** en el panel inferior del sidebar
2. Será redirigido a la página de login

---

## 8. Solución de Problemas

### No puedo iniciar sesión
- Verifique sus credenciales
- Contacte al administrador si olvidó su contraseña

### No veo ciertas opciones del menú
- Su nivel de acceso puede no tener permisos
- Contacte al administrador

### La tabla no muestra datos
- Verifique la conexión a la base de datos
- Actualice la página (F5)

### Error al exportar a Excel
- Verifique que tenga permisos de nivel 3 o superior
- Intente con filtros más específicos

---

## Información de Soporte

Para soporte técnico, contacte al administrador del sistema.
