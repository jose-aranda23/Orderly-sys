# Changelog

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-03-01

### Added
- Complete API documentation (`docs/API_DOCUMENTATION.md`)
- User manual (`docs/USER_GUIDE.md`)
- Deployment guide (`docs/DEPLOYMENT_GUIDE.md`)
- User management endpoints (activate, deactivate, user list)
- Reports functionality with filters (date, status, priority, user)
- Excel export functionality for requests
- Dashboard UI redesign with modern dark sidebar (#1E293B) and light content (#F1F5F9)

### Backend Endpoints Added
- `POST /api/solicitudes/exportar` - Export requests to Excel
- `GET /api/solicitudes/todos` - Get all requests with filters
- `GET /api/usuarios/list` - Get all users for management
- `POST /api/usuarios/:id/activar` - Activate user
- `POST /api/usuarios/:id/desactivar` - Deactivate user

### Dependencies
- `exceljs` - For Excel file generation

## [0.1.0] - Initial Release

### Features
- User authentication (JWT)
- Request management (CRUD)
- Four user levels (1-4) with permissions
- Priority levels (baja, media, alta, urgente)
- Status workflow (pendiente, en_proceso, completada, cancelada)
- MariaDB database
