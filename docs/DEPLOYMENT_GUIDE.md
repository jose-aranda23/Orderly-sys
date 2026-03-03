# Guía de Despliegue

## Sistema de Gestión de Solicitudes de Producción

---

## 1. Preparación del Entorno

### 1.1 Requisitos del Servidor

| Recurso | Mínimo | Recomendado |
|---------|--------|-------------|
| CPU | 1 núcleo | 2+ núcleos |
| RAM | 512 MB | 1 GB+ |
| Almacenamiento | 5 GB | 10 GB+ |
| SO | Ubuntu 20.04+ / Windows Server 2019+ | Ubuntu 22.04 LTS |

### 1.2 Software Requerido

- **Node.js** v18 o superior
- **MariaDB** v10.4 o superior
- **Nginx** (recomendado para producción)
- **SSL Certificate** (para HTTPS)

---

## 2. Configuración de Base de Datos

### 2.1 Crear Base de Datos

```sql
CREATE DATABASE sistema_produccion CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 2.2 Ejecutar Schema

```bash
mysql -u root -p sistema_produccion < database/schema.sql
```

### 2.3 Configuración de Producción

Se recomienda crear un usuario específico para la aplicación:

```sql
CREATE USER 'sistema_user'@'localhost' IDENTIFIED BY 'password_seguro';
GRANT ALL PRIVILEGES ON sistema_produccion.* TO 'sistema_user'@'localhost';
FLUSH PRIVILEGES;
```

---

## 3. Configuración de Variables de Entorno

### 3.1 Archivo .env

```env
# Puerto del servidor
PORT=3000

# Configuración de Base de Datos
DB_HOST=localhost
DB_USER=sistema_user
DB_PASSWORD=password_seguro
DB_NAME=sistema_produccion
DB_PORT=3306

# Seguridad
JWT_SECRET=genera_un_secret_muy_largo_y_seguro
JWT_EXPIRES_IN=8h

# Entorno
NODE_ENV=production
```

### 3.2 Generar JWT Secret

```bash
# Opción 1: OpenSSL
openssl rand -base64 32

# Opción 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## 4. Despliegue en Producción

### 4.1 Opción A: Servidor Dedicado/VPS

#### Paso 1: Preparar el servidor
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar MariaDB
sudo apt install -y mariadb-server mariadb-client

# Instalar PM2 (gestor de procesos)
sudo npm install -g pm2
```

#### Paso 2: Desplegar aplicación
```bash
# Clonar o copiar archivos
git clone <repositorio> /var/www/sistema-produccion
cd /var/www/sistema-produccion

# Instalar dependencias
npm install --production

# Configurar variables de entorno
cp .env.example .env
nano .env  # Editar con valores de producción

# Iniciar con PM2
pm2 start src/server.js --name sistema-produccion

# Configurar inicio automático
pm2 startup
pm2 save
```

#### Paso 3: Configurar Nginx (Proxy Reverso)

```nginx
server {
    listen 80;
    server_name tudominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### Paso 4: Configurar SSL (Let's Encrypt)

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtener certificado
sudo certbot --nginx -d tudominio.com

#自动续期测试
sudo certbot renew --dry-run
```

---

### 4.2 Opción B: Servicios Cloud

#### Render.com
1. Conectar repositorio GitHub
2. Configurar:
   - Build Command: `npm install`
   - Start Command: `npm start`
3. Agregar variables de entorno
4. Desplegar

#### Railway
1. Crear proyecto Railway
2. Agregar MariaDB plugin
3. Desplegar desde GitHub
4. Configurar variables de entorno

#### Heroku
1. Crear app Heroku
2. Agregar ClearDB (MariaDB)
3. Desplegar:
   ```bash
   heroku git:remote -a tu-app
   git push heroku main
   ```

---

## 5. Configuración de Seguridad

### 5.1 Firewall (Ubuntu)

```bash
# Instalar UFW
sudo apt install -y ufw

# Configurar reglas
sudo ufw allow 22    # SSH
sudo ufw allow 80     # HTTP
sudo ufw allow 443    # HTTPS
sudo ufw enable
```

### 5.2 Variables de Seguridad Adicionales

```env
# Rate limiting
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGIN=https://tudominio.com

# Sesión
SESSION_SECRET=otro_secret_largo
```

---

## 6. Mantenimiento

### 6.1 Logs

```bash
# Ver logs de PM2
pm2 logs sistema-produccion

# Logs de nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 6.2 Backup

#### Base de datos
```bash
# Crear backup
mysqldump -u sistema_user -p sistema_produccion > backup_$(date +%Y%m%d).sql

# Restaurar
mysql -u sistema_user -p sistema_produccion < backup_20260301.sql
```

#### Archivos
```bash
# Comprimir directorio
tar -czf sistema_backup_$(date +%Y%m%d).tar.gz /var/www/sistema-produccion
```

### 6.3 Actualizaciones

```bash
# Actualizar aplicación
cd /var/www/sistema-produccion
git pull origin main
npm install --production

# Recargar sin downtime
pm2 restart sistema-produccion
```

---

## 7. Monitoreo

### 7.1 Health Check

```bash
# Endpoint de salud
curl http://localhost:3000/api/health
```

### 7.2 PM2 Plus (Opcional)
```bash
# Monitoreo en la nube
pm2 link <secret-key> <public-key>
```

---

## 8. Checklist de Producción

- [ ] Base de datos configurada y probada
- [ ] Variables de entorno configuradas
- [ ] SSL/HTTPS habilitado
- [ ] Firewall configurado
- [ ] Backup automático configurado
- [ ] Logs configurados
- [ ] Dominio apuntando al servidor
- [ ] Certificado SSL instalado y renew automático
- [ ] PM2 configurado para inicio automático
- [ ] Prueba de login exitosa
- [ ] Prueba de creación de solicitud
- [ ] Prueba de exportación a Excel

---

## 9. Soporte

Para problemas técnicos:
1. Revisar logs: `pm2 logs sistema-produccion`
2. Verificar estado de servicios: `pm2 status`
3. Verificar base de datos: `mysql -u sistema_user -p -e "SHOW DATABASES;"`

---
