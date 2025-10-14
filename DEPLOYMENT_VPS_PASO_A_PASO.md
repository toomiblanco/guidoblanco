# 🚀 Deployment en VPS - Paso a Paso (Puerto 3002)

**IMPORTANTE:** Este proyecto usará el puerto **3002** porque los demás están ocupados.

---

## 📋 PRE-REQUISITOS

Antes de empezar, asegúrate de tener:
- ✅ Acceso SSH al VPS (162.240.174.46)
- ✅ PostgreSQL instalado y corriendo en el VPS
- ✅ Node.js 18+ instalado
- ✅ PM2 instalado (`npm install -g pm2` si no lo tienes)

---

## 🗂️ PASO 1: SUBIR ARCHIVOS AL VPS

### Opción A: Con Git (Recomendado)

```bash
# En tu máquina local, commitea los cambios
git add .
git commit -m "Refactorización completa - migración a PostgreSQL"
git push origin main

# Luego en el VPS
ssh usuario@162.240.174.46
cd /ruta/donde/quieras/el/proyecto
git clone [URL_DE_TU_REPO]
cd guidoblanco
```

### Opción B: Con SCP (Si no usas Git)

```bash
# Desde tu máquina local (en la carpeta del proyecto)
scp -r * usuario@162.240.174.46:/var/www/guidoblanco/

# O si prefieres un zip
zip -r guidoblanco.zip . -x "node_modules/*" -x ".next/*"
scp guidoblanco.zip usuario@162.240.174.46:/var/www/
ssh usuario@162.240.174.46
cd /var/www
unzip guidoblanco.zip -d guidoblanco
cd guidoblanco
```

---

## 🗄️ PASO 2: CONFIGURAR BASE DE DATOS

### 2.1 Conectar a PostgreSQL

```bash
# SSH al VPS
ssh usuario@162.240.174.46

# Conectar como postgres
sudo -u postgres psql
```

### 2.2 Crear Base de Datos y Usuario (si no existen)

```sql
-- Crear usuario (si no existe)
CREATE USER guidoblanco_user WITH PASSWORD 'Tomi39917314!';

-- Crear base de datos (si no existe)
CREATE DATABASE guidoblanco_db OWNER guidoblanco_user;

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE guidoblanco_db TO guidoblanco_user;

-- Conectar a la nueva base de datos
\c guidoblanco_db

-- Dar permisos en el schema public
GRANT ALL ON SCHEMA public TO guidoblanco_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO guidoblanco_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO guidoblanco_user;

-- Configurar permisos por defecto
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO guidoblanco_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO guidoblanco_user;

-- Salir
\q
```

### 2.3 Ejecutar Migraciones

```bash
# Asegúrate de estar en la carpeta del proyecto
cd /var/www/guidoblanco

# Ejecutar migraciones en orden
psql -h localhost -U guidoblanco_user -d guidoblanco_db -f database/migrations/001_initial_schema.sql

psql -h localhost -U guidoblanco_user -d guidoblanco_db -f database/migrations/002_seed_data.sql

psql -h localhost -U guidoblanco_user -d guidoblanco_db -f database/migrations/003_create_admin_credentials.sql
```

**Verificar que funcionó:**
```bash
psql -h localhost -U guidoblanco_user -d guidoblanco_db

# Dentro de psql:
\dt
# Debes ver: users, categories, tags, articles, article_tags

SELECT email, is_admin FROM users WHERE is_admin = true;
# Debes ver: admin@guidoblanco.com | t

\q
```

---

## ⚙️ PASO 3: CONFIGURAR VARIABLES DE ENTORNO

```bash
# Copiar .env.production a .env.local
cp .env.production .env.local

# Verificar que el contenido sea correcto
cat .env.local
```

**Debe contener (puerto 3002):**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=guidoblanco_db
DB_USER=guidoblanco_user
DB_PASSWORD=Tomi39917314!
DB_SSL=false

NEXTAUTH_URL=http://162.240.174.46:3002
NEXTAUTH_SECRET=xK8mP2vN9qR5sT8wE3zY6cA1bD4fG7hJ

NODE_ENV=production
NEXT_PUBLIC_SITE_URL=http://162.240.174.46:3002
```

---

## 📦 PASO 4: INSTALAR DEPENDENCIAS Y COMPILAR

```bash
# Instalar dependencias
npm install --production

# Si da error, intenta sin --production
npm install

# Compilar el proyecto
npm run build
```

**Verificar que el build fue exitoso:**
Debes ver al final:
```
✓ Compiled successfully
✓ Generating static pages (18/18)
```

---

## 🚀 PASO 5: INICIAR CON PM2 EN PUERTO 3002

### 5.1 Crear archivo de configuración de PM2

```bash
# Crear archivo ecosystem.config.js
nano ecosystem.config.js
```

**Pegar este contenido:**
```javascript
module.exports = {
  apps: [{
    name: 'guidoblanco',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/guidoblanco',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
  }]
}
```

**Guardar:** `Ctrl + X`, luego `Y`, luego `Enter`

### 5.2 Iniciar con PM2

```bash
# Si ya tienes una app con el nombre guidoblanco, elimínala primero
pm2 delete guidoblanco

# Iniciar la aplicación
pm2 start ecosystem.config.js

# Ver estado
pm2 status

# Ver logs
pm2 logs guidoblanco --lines 50
```

### 5.3 Guardar configuración de PM2

```bash
# Guardar para que se mantenga después de reiniciar
pm2 save

# Configurar auto-inicio
pm2 startup
# Ejecuta el comando que PM2 te muestre
```

---

## ✅ PASO 6: VERIFICAR QUE FUNCIONA

### 6.1 Verificar que el servidor está escuchando en el puerto 3002

```bash
# Ver procesos en el puerto 3002
sudo netstat -tlnp | grep 3002

# O con lsof
sudo lsof -i :3002
```

Debes ver algo como:
```
tcp6  0  0 :::3002  :::*  LISTEN  [PID]/node
```

### 6.2 Verificar logs de PM2

```bash
pm2 logs guidoblanco --lines 100
```

Debes ver:
```
✓ Ready in [tiempo]
○ Local: http://localhost:3002
```

### 6.3 Probar desde el navegador

Abre tu navegador y ve a:

1. **Home:** http://162.240.174.46:3002
2. **Login:** http://162.240.174.46:3002/auth/login
3. **Admin:** http://162.240.174.46:3002/admin

**Credenciales de prueba:**
- Email: `admin@guidoblanco.com`
- Password: `admin123`

---

## 🔧 PASO 7: ABRIR PUERTO EN FIREWALL (SI ES NECESARIO)

```bash
# Ver reglas actuales del firewall
sudo ufw status

# Si está activo, agregar regla para puerto 3002
sudo ufw allow 3002/tcp

# Recargar firewall
sudo ufw reload

# Verificar
sudo ufw status | grep 3002
```

---

## 🆘 TROUBLESHOOTING

### Error: "Cannot connect to database"

```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Ver logs de PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log

# Probar conexión manual
psql -h localhost -U guidoblanco_user -d guidoblanco_db
```

### Error: "Port 3002 already in use"

```bash
# Ver qué proceso usa el puerto 3002
sudo lsof -i :3002

# Matar el proceso si es necesario
sudo kill -9 [PID]

# O cambiar a otro puerto (editar ecosystem.config.js)
```

### Error: Login no funciona / Session undefined

```bash
# Verificar que NEXTAUTH_URL es correcto
cat .env.local | grep NEXTAUTH_URL
# Debe ser: http://162.240.174.46:3002

# Reiniciar PM2
pm2 restart guidoblanco

# Ver logs
pm2 logs guidoblanco
```

### Error: "401 Unauthorized" en admin

```bash
# Verificar que el usuario tiene is_admin = true
psql -h localhost -U guidoblanco_user -d guidoblanco_db
SELECT email, is_admin FROM users WHERE email = 'admin@guidoblanco.com';
# Debe mostrar: is_admin = t

# Si no es admin, actualizar:
UPDATE users SET is_admin = true WHERE email = 'admin@guidoblanco.com';
```

### Ver logs en tiempo real

```bash
# Logs de PM2
pm2 logs guidoblanco --lines 100

# Logs de PostgreSQL
sudo tail -f /var/log/postgresql/postgresql-*.log

# Logs de sistema
sudo journalctl -u postgresql -f
```

---

## 📊 COMANDOS ÚTILES DE PM2

```bash
# Ver estado de todas las apps
pm2 status

# Ver logs en tiempo real
pm2 logs guidoblanco

# Reiniciar
pm2 restart guidoblanco

# Recargar (sin downtime)
pm2 reload guidoblanco

# Detener
pm2 stop guidoblanco

# Eliminar
pm2 delete guidoblanco

# Monitor en tiempo real
pm2 monit

# Ver información detallada
pm2 show guidoblanco

# Ver uso de CPU/memoria
pm2 status
```

---

## 🔄 ACTUALIZAR LA APLICACIÓN (Después de cambios)

```bash
# SSH al VPS
ssh usuario@162.240.174.46
cd /var/www/guidoblanco

# Si usas Git
git pull origin main

# Instalar nuevas dependencias (si hay)
npm install --production

# Rebuild
npm run build

# Reiniciar PM2
pm2 restart guidoblanco

# Ver logs
pm2 logs guidoblanco
```

---

## 📝 RESUMEN DE COMANDOS COMPLETOS

```bash
# 1. SSH al VPS
ssh usuario@162.240.174.46

# 2. Ir a la carpeta del proyecto
cd /var/www/guidoblanco

# 3. Ejecutar migraciones (solo la primera vez)
psql -h localhost -U guidoblanco_user -d guidoblanco_db -f database/migrations/001_initial_schema.sql
psql -h localhost -U guidoblanco_user -d guidoblanco_db -f database/migrations/002_seed_data.sql
psql -h localhost -U guidoblanco_user -d guidoblanco_db -f database/migrations/003_create_admin_credentials.sql

# 4. Configurar env
cp .env.production .env.local

# 5. Instalar y compilar
npm install
npm run build

# 6. Crear ecosystem.config.js
nano ecosystem.config.js
# (pegar el contenido de arriba con PORT: 3002)

# 7. Iniciar PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 8. Verificar
pm2 logs guidoblanco
```

---

## ✅ CHECKLIST FINAL

- [ ] PostgreSQL está corriendo
- [ ] Base de datos `guidoblanco_db` creada
- [ ] Usuario `guidoblanco_user` existe
- [ ] Migraciones ejecutadas (5 tablas creadas)
- [ ] Usuario admin existe (admin@guidoblanco.com)
- [ ] `.env.local` configurado con puerto 3002
- [ ] `npm run build` exitoso
- [ ] PM2 corriendo la app
- [ ] Puerto 3002 abierto en firewall
- [ ] http://162.240.174.46:3002 accesible
- [ ] Login funciona
- [ ] Admin panel accesible

---

## 🎯 URLs FINALES

Una vez todo funcionando:

- **Home:** http://162.240.174.46:3002
- **Login:** http://162.240.174.46:3002/auth/login
- **Admin:** http://162.240.174.46:3002/admin
- **API:** http://162.240.174.46:3002/api/*

---

**¡Listo! Tu aplicación estará corriendo en el puerto 3002 🚀**

Si tienes algún problema en algún paso, revisa la sección de Troubleshooting o pregúntame.
