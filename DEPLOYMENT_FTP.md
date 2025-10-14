# 🚀 Deployment por FTP - Paso a Paso

## 📦 **PASO 1: Preparar Archivos Localmente**

### 1.1 Limpiar carpetas innecesarias

Antes de subir por FTP, elimina estas carpetas (se crearán en el servidor):

```bash
# Desde tu proyecto local
rm -rf node_modules
rm -rf .next
rm -rf .git
```

**O manualmente en Windows:**
- Elimina la carpeta `node_modules` (si existe)
- Elimina la carpeta `.next` (si existe)
- Elimina la carpeta `.git` (si quieres, opcional)

### 1.2 Verificar que tienes todos estos archivos

✅ Archivos esenciales que DEBEN estar:
```
guidoblanco/
├── app/                          ✅ Código de la aplicación
├── components/                   ✅ Componentes
├── database/                     ✅ Migraciones SQL
│   └── migrations/
│       ├── 001_initial_schema.sql
│       ├── 002_seed_data.sql
│       └── 003_create_admin_credentials.sql
├── lib/                          ✅ Librerías
├── public/                       ✅ Archivos públicos
├── types/                        ✅ Tipos TypeScript
├── .env.production              ✅ Variables de entorno
├── ecosystem.config.js          ✅ Config de PM2
├── package.json                 ✅ Dependencias
├── package-lock.json            ✅ Lock file
├── next.config.js               ✅ Config de Next.js
├── tsconfig.json                ✅ Config de TypeScript
├── tailwind.config.ts           ✅ Config de Tailwind
├── check-vps.sh                 ✅ Script de verificación
└── test-connection.js           ✅ Test de BD
```

❌ NO subir (ocupan espacio y se regeneran):
```
node_modules/    ← Se instala con npm install
.next/           ← Se crea con npm run build
.git/            ← No necesario en producción
```

---

## 📤 **PASO 2: Subir por FTP**

### Opción A: Cliente FTP Gráfico (Recomendado)

**Usar FileZilla, WinSCP o Cyberduck:**

1. **Conectar al VPS:**
   - Host: `162.240.174.46`
   - Usuario: `tu_usuario`
   - Password: `tu_password`
   - Puerto: `21` (FTP) o `22` (SFTP/SSH)

2. **Crear carpeta destino:**
   - Navega a `/var/www/`
   - Crea carpeta `guidoblanco` (si no existe)

3. **Subir TODO:**
   - Arrastra toda la carpeta `guidoblanco` desde tu máquina local
   - A la carpeta `/var/www/guidoblanco/` en el servidor
   - **IMPORTANTE:** Asegúrate de subir también archivos ocultos (`.env.production`, etc.)

4. **Esperar a que termine** (puede tomar varios minutos)

### Opción B: SFTP por línea de comandos

```bash
# Comprimir todo primero (más rápido)
cd D:\
tar -czf guidoblanco.tar.gz guidoblanco --exclude='node_modules' --exclude='.next' --exclude='.git'

# Subir
scp guidoblanco.tar.gz usuario@162.240.174.46:/var/www/

# Conectar por SSH
ssh usuario@162.240.174.46

# Descomprimir
cd /var/www
tar -xzf guidoblanco.tar.gz
rm guidoblanco.tar.gz
```

---

## ⚙️ **PASO 3: Configurar en el VPS**

Ahora conecta por SSH y ejecuta estos comandos:

```bash
# 1. Conectar al VPS
ssh usuario@162.240.174.46

# 2. Ir a la carpeta del proyecto
cd /var/www/guidoblanco

# 3. Verificar que los archivos están ahí
ls -la

# Debes ver:
# - app/
# - components/
# - database/
# - lib/
# - package.json
# - ecosystem.config.js
# - .env.production
# etc.

# 4. Dar permisos de ejecución a scripts
chmod +x check-vps.sh
chmod +x DEPLOYMENT_COMMANDS.sh

# 5. Verificar entorno
bash check-vps.sh
```

---

## 🗄️ **PASO 4: Configurar Base de Datos**

```bash
# 1. Conectar a PostgreSQL
sudo -u postgres psql

# 2. Crear usuario y base de datos (copiar TODO este bloque)
CREATE USER guidoblanco_user WITH PASSWORD 'Tomi39917314!';
CREATE DATABASE guidoblanco_db OWNER guidoblanco_user;
GRANT ALL PRIVILEGES ON DATABASE guidoblanco_db TO guidoblanco_user;
\c guidoblanco_db
GRANT ALL ON SCHEMA public TO guidoblanco_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO guidoblanco_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO guidoblanco_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO guidoblanco_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO guidoblanco_user;
\q

# 3. Ejecutar migraciones
psql -h localhost -U guidoblanco_user -d guidoblanco_db -f database/migrations/001_initial_schema.sql
psql -h localhost -U guidoblanco_user -d guidoblanco_db -f database/migrations/002_seed_data.sql
psql -h localhost -U guidoblanco_user -d guidoblanco_db -f database/migrations/003_create_admin_credentials.sql

# 4. Verificar que funcionó
psql -h localhost -U guidoblanco_user -d guidoblanco_db -c "\dt"
# Debes ver 5 tablas: users, categories, tags, articles, article_tags

psql -h localhost -U guidoblanco_user -d guidoblanco_db -c "SELECT email FROM users WHERE is_admin = true;"
# Debes ver: admin@guidoblanco.com y guidoblanco@gmail.com
```

---

## 📝 **PASO 5: Configurar Variables de Entorno**

```bash
# En el VPS, dentro de /var/www/guidoblanco

# Copiar .env.production a .env.local
cp .env.production .env.local

# Verificar contenido
cat .env.local

# Debe mostrar:
# DB_HOST=localhost
# DB_PORT=5432
# NEXTAUTH_URL=http://162.240.174.46:3002
# etc.
```

---

## 🔧 **PASO 6: Actualizar ecosystem.config.js**

```bash
# Editar ecosystem.config.js para poner la ruta correcta
nano ecosystem.config.js
```

**Cambiar esta línea:**
```javascript
cwd: '/var/www/guidoblanco', // ← Asegúrate de que sea la ruta correcta
```

**Guardar:** `Ctrl + X`, luego `Y`, luego `Enter`

---

## 📦 **PASO 7: Instalar Dependencias y Compilar**

```bash
# 1. Verificar versión de Node.js
node -v
# Debe ser 18 o superior

# 2. Instalar dependencias
npm install --production

# Si da error, intenta sin --production:
npm install

# 3. Compilar el proyecto
npm run build

# Esto tomará unos minutos...
# Al final debes ver:
# ✓ Compiled successfully
# ✓ Generating static pages (18/18)
```

---

## 🚀 **PASO 8: Iniciar con PM2**

```bash
# 1. Verificar que PM2 está instalado
pm2 -v

# Si no está instalado:
sudo npm install -g pm2

# 2. Eliminar instancia anterior (si existe)
pm2 delete guidoblanco

# 3. Iniciar la aplicación
pm2 start ecosystem.config.js

# 4. Verificar estado
pm2 status

# 5. Ver logs
pm2 logs guidoblanco

# Debes ver:
# ✓ Ready in [tiempo]
# ○ Local: http://localhost:3002

# 6. Guardar configuración
pm2 save

# 7. Configurar auto-inicio
pm2 startup
# Ejecuta el comando que te muestre
```

---

## 🔥 **PASO 9: Configurar Firewall (si es necesario)**

```bash
# Verificar firewall
sudo ufw status

# Si está activo, abrir puerto 3002
sudo ufw allow 3002/tcp
sudo ufw reload

# Verificar
sudo ufw status | grep 3002
```

---

## ✅ **PASO 10: Verificar que Funciona**

### 10.1 Verificar puerto

```bash
# Ver que el puerto 3002 está escuchando
sudo netstat -tlnp | grep 3002

# Debes ver algo como:
# tcp6  0  0 :::3002  :::*  LISTEN  [PID]/node
```

### 10.2 Verificar logs

```bash
pm2 logs guidoblanco --lines 50
```

### 10.3 Abrir en navegador

Desde tu navegador:

1. **Home:** http://162.240.174.46:3002
2. **Login:** http://162.240.174.46:3002/auth/login
   - Email: `admin@guidoblanco.com`
   - Password: `admin123`
3. **Admin:** http://162.240.174.46:3002/admin

---

## 🔄 **ACTUALIZAR LA APLICACIÓN (después de cambios)**

Cuando hagas cambios y quieras actualizar:

```bash
# 1. Desde tu máquina, sube los archivos nuevos por FTP
#    (sobrescribe los existentes)

# 2. En el VPS, reconstruir y reiniciar
ssh usuario@162.240.174.46
cd /var/www/guidoblanco
npm install  # Solo si agregaste dependencias nuevas
npm run build
pm2 restart guidoblanco
pm2 logs guidoblanco
```

---

## 📋 **CHECKLIST COMPLETO**

### Antes de subir por FTP:
- [ ] Eliminaste `node_modules/` local
- [ ] Eliminaste `.next/` local
- [ ] Tienes `.env.production` con puerto 3002
- [ ] Tienes `ecosystem.config.js` con puerto 3002
- [ ] Tienes las migraciones en `database/migrations/`

### Después de subir por FTP:
- [ ] Todos los archivos están en `/var/www/guidoblanco/`
- [ ] Base de datos creada
- [ ] Migraciones ejecutadas (5 tablas)
- [ ] Usuario admin existe
- [ ] `.env.local` copiado de `.env.production`
- [ ] `npm install` completado
- [ ] `npm run build` exitoso
- [ ] PM2 corriendo la app
- [ ] Puerto 3002 abierto
- [ ] Login funciona en http://162.240.174.46:3002

---

## 🆘 **PROBLEMAS COMUNES**

### Error: "ENOENT: no such file or directory"
```bash
# Verificar que estás en la carpeta correcta
pwd
# Debe mostrar: /var/www/guidoblanco
```

### Error: "Permission denied"
```bash
# Dar permisos al usuario
cd /var/www
sudo chown -R $USER:$USER guidoblanco
```

### Error: "Port 3002 already in use"
```bash
# Ver qué está usando el puerto
sudo lsof -i :3002

# Matar el proceso
sudo kill -9 [PID]

# O cambiar de puerto en ecosystem.config.js
```

### Error: Login no funciona
```bash
# Verificar NEXTAUTH_URL
cat .env.local | grep NEXTAUTH_URL
# Debe ser: http://162.240.174.46:3002

# Reiniciar
pm2 restart guidoblanco
```

---

## 📁 **ESTRUCTURA FINAL EN EL VPS**

```
/var/www/guidoblanco/
├── app/
├── components/
├── database/
│   └── migrations/
├── lib/
├── public/
├── types/
├── node_modules/        ← Se crea con npm install
├── .next/               ← Se crea con npm run build
├── .env.local           ← Se copia de .env.production
├── ecosystem.config.js
├── package.json
└── ... (otros archivos)
```

---

## 🎯 **RESUMEN DE COMANDOS PARA COPIAR-PEGAR**

```bash
# Conectar al VPS
ssh usuario@162.240.174.46

# Ir a la carpeta
cd /var/www/guidoblanco

# Verificar archivos
ls -la

# Verificar entorno
bash check-vps.sh

# Configurar env
cp .env.production .env.local

# Instalar y compilar
npm install
npm run build

# Iniciar
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# Ver logs
pm2 logs guidoblanco
```

---

**¡Listo! Tu aplicación estará corriendo en http://162.240.174.46:3002 🚀**
