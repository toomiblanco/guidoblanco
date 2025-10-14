# 📤 CÓMO SUBIR TODO POR FTP Y QUE FUNCIONE

## 🎯 **OBJETIVO**
Subir TODO el proyecto por FTP y que funcione en el VPS (puerto 3002)

---

## ✅ **PASO 1: PREPARAR EN TU MÁQUINA (ANTES DE SUBIR)**

### 1.1 Limpiar carpetas innecesarias

**Elimina estas carpetas** (ocupan mucho espacio y se regeneran en el servidor):

```
guidoblanco/
├── node_modules/     ← ELIMINAR (se instala con npm install)
├── .next/            ← ELIMINAR (se crea con npm run build)
└── .git/             ← ELIMINAR (opcional, no necesario en producción)
```

**En Windows:** Click derecho → Eliminar

---

## 📤 **PASO 2: SUBIR POR FTP**

### Opción A: FileZilla / WinSCP (Recomendado para ti)

1. **Abrir FileZilla o WinSCP**

2. **Conectar al VPS:**
   - Host: `162.240.174.46`
   - Usuario: `tu_usuario_vps`
   - Contraseña: `tu_contraseña`
   - Puerto: `22` (SFTP) o `21` (FTP)

3. **Navegar a la carpeta destino:**
   - En el servidor (lado derecho): `/var/www/`
   - Si no existe la carpeta `guidoblanco`, créala

4. **ARRASTRAR TODO:**
   - Lado izquierdo: Tu carpeta `D:\guidoblanco`
   - Lado derecho: `/var/www/guidoblanco/`
   - **Arrastra toda la carpeta** (o selecciona todo dentro y arrastra)
   - Espera a que termine (puede tomar 5-15 minutos dependiendo de tu conexión)

5. **Verificar que TODO se subió:**
   - Verifica que en `/var/www/guidoblanco/` están:
     - app/
     - components/
     - database/
     - lib/
     - public/
     - types/
     - package.json
     - ecosystem.config.js
     - .env.production
     - etc.

---

## 🖥️ **PASO 3: CONFIGURAR EN EL VPS**

### 3.1 Conectar por SSH

**Descarga PuTTY** (si no lo tienes) o usa el terminal:

```bash
ssh tu_usuario@162.240.174.46
```

Ingresa tu contraseña.

### 3.2 Ir a la carpeta del proyecto

```bash
cd /var/www/guidoblanco
```

### 3.3 Verificar que los archivos están ahí

```bash
ls -la
```

Debes ver todos tus archivos.

---

## 🗄️ **PASO 4: CONFIGURAR BASE DE DATOS (UNA SOLA VEZ)**

### Opción A: Script Todo-en-Uno (Más Fácil)

```bash
# Ejecutar el script completo
sudo -u postgres psql -f database/setup-database-completo.sql
```

Este script hace TODO automáticamente:
- Crea el usuario `guidoblanco_user`
- Crea la base de datos `guidoblanco_db`
- Crea todas las tablas
- Inserta datos de ejemplo
- Crea usuarios admin

**¡LISTO! Con un solo comando.**

### Opción B: Paso a Paso (Si prefieres)

```bash
# 1. Conectar a PostgreSQL
sudo -u postgres psql

# 2. Copiar y pegar ESTE BLOQUE COMPLETO:

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
```

---

## ⚙️ **PASO 5: CONFIGURAR VARIABLES DE ENTORNO**

```bash
# Copiar .env.production a .env.local
cp .env.production .env.local

# Verificar que está bien
cat .env.local
```

Debe mostrar:
```
DB_HOST=localhost
NEXTAUTH_URL=http://162.240.174.46:3002
...
```

---

## 🔧 **PASO 6: ACTUALIZAR ecosystem.config.js**

```bash
# Editar el archivo
nano ecosystem.config.js
```

**Cambiar esta línea** (alrededor de la línea 5):
```javascript
cwd: '/var/www/guidoblanco',  // ← Asegúrate que sea la ruta correcta
```

**Guardar:** `Ctrl + X` → `Y` → `Enter`

---

## 📦 **PASO 7: INSTALAR Y COMPILAR**

```bash
# 1. Instalar dependencias
npm install

# Esto tomará varios minutos la primera vez...
# Espera a que termine

# 2. Compilar el proyecto
npm run build

# Esto también toma unos minutos...
# Al final debes ver:
# ✓ Compiled successfully
# ✓ Generating static pages (18/18)
```

**Si da error:** Lee el mensaje de error y pregúntame.

---

## 🚀 **PASO 8: INICIAR LA APLICACIÓN**

```bash
# 1. Verificar que PM2 está instalado
pm2 -v

# Si NO está instalado:
sudo npm install -g pm2

# 2. Eliminar instancia anterior (si existe)
pm2 delete guidoblanco

# 3. Iniciar
pm2 start ecosystem.config.js

# 4. Ver logs para verificar que está corriendo
pm2 logs guidoblanco

# Debes ver:
# ✓ Ready in [tiempo]
# ○ Local: http://localhost:3002

# 5. Presiona Ctrl+C para salir de los logs

# 6. Guardar configuración
pm2 save

# 7. Auto-iniciar con el sistema
pm2 startup
# Ejecuta el comando que PM2 te muestre (copiar y pegar)
```

---

## 🌐 **PASO 9: ABRIR EN NAVEGADOR**

Abre tu navegador y ve a:

**http://162.240.174.46:3002**

Debes ver tu sitio funcionando! 🎉

### Probar Login:

**http://162.240.174.46:3002/auth/login**

- Email: `admin@guidoblanco.com`
- Password: `admin123`

### Probar Admin:

**http://162.240.174.46:3002/admin**

---

## ✅ **CHECKLIST COMPLETO**

Marca cada paso que completes:

### Antes de subir:
- [ ] Eliminé `node_modules/`
- [ ] Eliminé `.next/`
- [ ] Tengo `.env.production` con puerto 3002

### Subir por FTP:
- [ ] Conecté a FileZilla/WinSCP
- [ ] Arrastré toda la carpeta a `/var/www/guidoblanco/`
- [ ] Todos los archivos se subieron

### Configurar en VPS:
- [ ] Conecté por SSH
- [ ] Estoy en `/var/www/guidoblanco`
- [ ] Base de datos creada
- [ ] Migraciones ejecutadas
- [ ] Copié `.env.production` a `.env.local`
- [ ] Actualicé `ecosystem.config.js`
- [ ] Ejecuté `npm install` (terminó sin errores)
- [ ] Ejecuté `npm run build` (terminó exitoso)
- [ ] Inicié con PM2
- [ ] Guardé configuración de PM2

### Verificar:
- [ ] http://162.240.174.46:3002 funciona
- [ ] Login funciona
- [ ] Admin panel funciona

---

## 🆘 **SI ALGO SALE MAL**

### "npm install" da error

```bash
# Limpiar cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### "npm run build" da error

```bash
# Verificar versión de Node.js
node -v
# Debe ser 18 o superior

# Ver el error completo y pregúntame
```

### Puerto 3002 ocupado

```bash
# Ver qué usa el puerto
sudo lsof -i :3002

# Matar el proceso
sudo kill -9 [PID_QUE_TE_MUESTRE]

# Reintentar
pm2 restart guidoblanco
```

### Login no funciona

```bash
# Verificar .env.local
cat .env.local | grep NEXTAUTH_URL
# Debe ser: http://162.240.174.46:3002

# Reiniciar
pm2 restart guidoblanco
pm2 logs guidoblanco
```

### Ver logs en tiempo real

```bash
pm2 logs guidoblanco
```

---

## 🔄 **ACTUALIZAR DESPUÉS (cuando hagas cambios)**

```bash
# 1. Subir archivos nuevos por FTP (sobrescribe)

# 2. SSH al VPS
ssh tu_usuario@162.240.174.46
cd /var/www/guidoblanco

# 3. Si agregaste dependencias nuevas:
npm install

# 4. Recompilar
npm run build

# 5. Reiniciar
pm2 restart guidoblanco

# 6. Verificar
pm2 logs guidoblanco
```

---

## 📊 **COMANDOS ÚTILES**

```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs guidoblanco

# Reiniciar
pm2 restart guidoblanco

# Detener
pm2 stop guidoblanco

# Monitor en tiempo real
pm2 monit

# Ver proceso en puerto 3002
sudo netstat -tlnp | grep 3002
```

---

## 🎯 **RESUMEN SUPER RÁPIDO**

```bash
# 1. Subir por FTP a /var/www/guidoblanco/

# 2. SSH al VPS
ssh usuario@162.240.174.46
cd /var/www/guidoblanco

# 3. Base de datos (una vez)
sudo -u postgres psql -f database/setup-database-completo.sql

# 4. Configurar
cp .env.production .env.local
nano ecosystem.config.js  # Verificar ruta

# 5. Instalar y compilar
npm install
npm run build

# 6. Iniciar
pm2 start ecosystem.config.js
pm2 save
pm2 startup

# 7. Abrir navegador
http://162.240.174.46:3002
```

---

**¡YA ESTÁ! Tu sitio funcionando en el VPS 🚀**

Cualquier duda, pregúntame enviándome el error exacto que te salga.
