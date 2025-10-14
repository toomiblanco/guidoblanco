# Instrucciones para Reiniciar la Base de Datos desde Cero

**Fecha:** 2025-10-05

---

## 🎯 Objetivo

Recrear completamente la base de datos PostgreSQL en tu VPS con todas las tablas, datos de ejemplo y usuario administrador.

---

## 📋 Pre-requisitos

1. Acceso SSH a tu VPS
2. PostgreSQL instalado y corriendo
3. Credenciales de acceso a PostgreSQL

---

## 🗑️ PASO 1: Eliminar la Base de Datos Actual (OPCIONAL)

⚠️ **ADVERTENCIA:** Esto eliminará TODOS los datos existentes. Asegúrate de hacer backup si necesitas algo.

### Conectar a PostgreSQL como superusuario

```bash
# SSH a tu VPS
ssh usuario@162.240.174.46

# Conectar como postgres
sudo -u postgres psql
```

### Eliminar base de datos y usuario existente

```sql
-- Terminar todas las conexiones activas
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'guidoblanco_db'
  AND pid <> pg_backend_pid();

-- Eliminar base de datos
DROP DATABASE IF EXISTS guidoblanco_db;

-- Eliminar usuario
DROP USER IF EXISTS guidoblanco_user;

-- Salir
\q
```

---

## 🔧 PASO 2: Crear Base de Datos y Usuario

```bash
# Conectar nuevamente como postgres
sudo -u postgres psql
```

```sql
-- Crear usuario
CREATE USER guidoblanco_user WITH PASSWORD 'guidoblanco123';

-- Crear base de datos
CREATE DATABASE guidoblanco_db OWNER guidoblanco_user;

-- Dar permisos
GRANT ALL PRIVILEGES ON DATABASE guidoblanco_db TO guidoblanco_user;

-- Conectar a la nueva base de datos
\c guidoblanco_db

-- Dar permisos en el schema public
GRANT ALL ON SCHEMA public TO guidoblanco_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO guidoblanco_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO guidoblanco_user;

-- Configurar permisos por defecto para objetos futuros
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO guidoblanco_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO guidoblanco_user;

-- Salir
\q
```

---

## 📦 PASO 3: Ejecutar Migraciones

### Opción A: Ejecutar desde archivos locales (tu máquina)

Si tienes los archivos de migración en tu máquina local:

```bash
# Desde tu máquina local (carpeta del proyecto)
psql -h 162.240.174.46 -p 5432 -U guidoblanco_user -d guidoblanco_db -f database/migrations/001_initial_schema.sql

psql -h 162.240.174.46 -p 5432 -U guidoblanco_user -d guidoblanco_db -f database/migrations/002_seed_data.sql

psql -h 162.240.174.46 -p 5432 -U guidoblanco_user -d guidoblanco_db -f database/migrations/003_create_admin_credentials.sql
```

### Opción B: Ejecutar desde el VPS

Si los archivos están en el VPS:

```bash
# SSH al VPS
ssh usuario@162.240.174.46

# Navegar al directorio del proyecto
cd /ruta/al/proyecto/guidoblanco

# Ejecutar migraciones
psql -h localhost -p 5432 -U guidoblanco_user -d guidoblanco_db -f database/migrations/001_initial_schema.sql

psql -h localhost -p 5432 -U guidoblanco_user -d guidoblanco_db -f database/migrations/002_seed_data.sql

psql -h localhost -p 5432 -U guidoblanco_user -d guidoblanco_db -f database/migrations/003_create_admin_credentials.sql
```

### Opción C: Copiar y pegar SQL manualmente

```bash
# Conectar a la base de datos
psql -h 162.240.174.46 -p 5432 -U guidoblanco_user -d guidoblanco_db
```

Luego copia y pega el contenido de cada archivo SQL en orden:

1. `database/migrations/001_initial_schema.sql`
2. `database/migrations/002_seed_data.sql`
3. `database/migrations/003_create_admin_credentials.sql`

---

## ✅ PASO 4: Verificar la Instalación

### Verificar desde psql

```sql
-- Conectar a la base de datos
psql -h 162.240.174.46 -p 5432 -U guidoblanco_user -d guidoblanco_db

-- Listar todas las tablas
\dt

-- Deberías ver:
--  public | article_tags | table | guidoblanco_user
--  public | articles     | table | guidoblanco_user
--  public | categories   | table | guidoblanco_user
--  public | tags         | table | guidoblanco_user
--  public | users        | table | guidoblanco_user

-- Verificar usuarios admin
SELECT email, is_admin, created_at FROM users WHERE is_admin = true;

-- Deberías ver:
--  admin@guidoblanco.com    | t       | 2025-10-05...
--  guidoblanco@gmail.com    | t       | 2025-10-05...

-- Verificar categorías
SELECT name, slug FROM categories;

-- Verificar tags
SELECT name, slug FROM tags;

-- Salir
\q
```

### Verificar desde tu máquina local

```bash
# Desde tu proyecto local
npm install    # Si no lo has hecho
node test-connection.js
```

Deberías ver:

```
🔍 Probando conexión a PostgreSQL...

📝 Configuración:
   Host: 162.240.174.46
   Puerto: 5432
   Base de datos: guidoblanco_db
   Usuario: guidoblanco_user

1️⃣ Probando conexión básica...
   ✅ Conectado a: guidoblanco_db
   ⏰ Timestamp: 2025-10-05...
   🐘 PostgreSQL 14.x on x86_64...

2️⃣ Verificando tablas existentes...
   ✅ Tabla 'users' existe
   ✅ Tabla 'categories' existe
   ✅ Tabla 'tags' existe
   ✅ Tabla 'articles' existe
   ✅ Tabla 'article_tags' existe

3️⃣ Verificando usuarios admin...
   ✅ Admin: admin@guidoblanco.com
   ✅ Admin: guidoblanco@gmail.com

4️⃣ Estadísticas de la base de datos:
   👥 Usuarios: 2
   📁 Categorías: 7
   🏷️  Etiquetas: 10
   📄 Artículos: 0

✅ ¡Todas las pruebas completadas exitosamente!
```

---

## 🔐 PASO 5: Configurar Seguridad (Recomendado)

### 1. Cambiar contraseña del usuario de BD

```sql
-- Conectar como postgres
sudo -u postgres psql

-- Cambiar contraseña
ALTER USER guidoblanco_user WITH PASSWORD 'NUEVA_CONTRASEÑA_SEGURA';

\q
```

No olvides actualizar `.env.local` con la nueva contraseña.

### 2. Restringir acceso externo (en producción)

```bash
# Editar pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Cambiar de:
# host    all             all             0.0.0.0/0            md5

# A (solo localhost):
# host    all             all             127.0.0.1/32         md5
```

```bash
# Reiniciar PostgreSQL
sudo systemctl restart postgresql
```

⚠️ **Importante:** Si haces esto, desde tu máquina local NO podrás conectar. Solo desde el VPS.

En ese caso, actualiza `.env.production` en el VPS:
```env
DB_HOST=localhost
```

---

## 🧪 PASO 6: Probar la Aplicación

### Localmente (desde tu máquina)

```bash
# Asegúrate de que .env.local tenga la configuración correcta
cat .env.local

# Iniciar en modo desarrollo
npm run dev

# Abrir navegador
# http://localhost:3000/auth/login
```

**Credenciales de prueba:**
- Email: `admin@guidoblanco.com`
- Password: `admin123`

### En el VPS (producción)

```bash
# SSH al VPS
ssh usuario@162.240.174.46

# Navegar al proyecto
cd /ruta/al/proyecto/guidoblanco

# Actualizar .env.local con configuración de producción
cp .env.production .env.local

# Editar si es necesario
nano .env.local

# Build
npm run build

# Iniciar con PM2
pm2 start npm --name "guidoblanco" -- start

# Verificar logs
pm2 logs guidoblanco
```

---

## 📝 Contenido de los Archivos de Migración

### 001_initial_schema.sql

Este archivo crea:
- Extensión `uuid-ossp` para generar UUIDs
- Tabla `users` (reemplaza auth.users de Supabase)
- Tabla `categories` con soporte para subcategorías
- Tabla `tags`
- Tabla `articles`
- Tabla `article_tags` (relación many-to-many)
- Índices para optimización
- Función `update_updated_at_column()`
- Triggers para actualizar `updated_at` automáticamente

### 002_seed_data.sql

Este archivo crea datos de ejemplo:
- 4 categorías principales: Política, Economía, Sociedad, Internacional
- 3 subcategorías: Elecciones, Mercados, Educación
- 10 tags comunes: Análisis, Investigación, Entrevista, etc.

### 003_create_admin_credentials.sql

Este archivo crea usuarios administradores:
- `admin@guidoblanco.com` con password `admin123`
- `guidoblanco@gmail.com` con password `admin123`

⚠️ **Cambiar estas contraseñas en producción!**

---

## 🆘 Troubleshooting

### Error: "FATAL: password authentication failed"

```bash
# Verificar que el usuario existe
sudo -u postgres psql -c "\du"

# Recrear usuario
sudo -u postgres psql -c "DROP USER IF EXISTS guidoblanco_user;"
sudo -u postgres psql -c "CREATE USER guidoblanco_user WITH PASSWORD 'guidoblanco123';"
```

### Error: "FATAL: database does not exist"

```bash
# Crear base de datos
sudo -u postgres psql -c "CREATE DATABASE guidoblanco_db OWNER guidoblanco_user;"
```

### Error: "Connection refused"

```bash
# Verificar que PostgreSQL está corriendo
sudo systemctl status postgresql

# Iniciarlo si es necesario
sudo systemctl start postgresql

# Verificar que escucha en el puerto correcto
sudo netstat -tlnp | grep 5432
```

### Error: "Permission denied for schema public"

```bash
# Conectar como postgres
sudo -u postgres psql guidoblanco_db

# Dar permisos
GRANT ALL ON SCHEMA public TO guidoblanco_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO guidoblanco_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO guidoblanco_user;
```

### No puedo conectar desde mi máquina local

```bash
# Verificar postgresql.conf
sudo nano /etc/postgresql/14/main/postgresql.conf

# Buscar:
# listen_addresses = 'localhost'

# Cambiar a:
# listen_addresses = '*'

# Verificar pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Debe tener:
# host    all             all             0.0.0.0/0            md5

# Reiniciar
sudo systemctl restart postgresql

# Verificar firewall
sudo ufw allow 5432/tcp
```

---

## 📚 Comandos Útiles de PostgreSQL

```sql
-- Ver todas las bases de datos
\l

-- Conectar a una base de datos
\c guidoblanco_db

-- Listar tablas
\dt

-- Describir una tabla
\d users

-- Ver usuarios de PostgreSQL
\du

-- Ver conexiones activas
SELECT * FROM pg_stat_activity WHERE datname = 'guidoblanco_db';

-- Vaciar una tabla (mantener estructura)
TRUNCATE TABLE articles CASCADE;

-- Ver tamaño de la base de datos
SELECT pg_size_pretty(pg_database_size('guidoblanco_db'));
```

---

## ✅ Checklist Final

Después de completar todos los pasos, verifica:

- [ ] PostgreSQL está corriendo
- [ ] Base de datos `guidoblanco_db` existe
- [ ] Usuario `guidoblanco_user` existe y tiene permisos
- [ ] 5 tablas creadas (users, categories, tags, articles, article_tags)
- [ ] Índices creados correctamente
- [ ] Función y triggers funcionando
- [ ] Usuario admin existe en la tabla users
- [ ] Categorías de ejemplo cargadas (mínimo 4)
- [ ] Tags de ejemplo cargados (mínimo 10)
- [ ] Conexión desde local funciona (si es necesario)
- [ ] Script `test-connection.js` pasa todos los tests
- [ ] Login en la aplicación funciona con admin@guidoblanco.com

---

**¡Base de datos lista para usar! 🎉**

Si tienes algún problema, revisa la sección de Troubleshooting o verifica los logs:

```bash
# Logs de PostgreSQL en Ubuntu/Debian
sudo tail -f /var/log/postgresql/postgresql-14-main.log
```
