# 🔧 SOLUCIÓN - Error de Login 401 Unauthorized

## 🔍 **DIAGNÓSTICO DEL ERROR**

```
Error: CredentialsSignin
Status: 401 (Unauthorized)
```

Este error significa que:
1. ❌ El usuario no existe en la base de datos
2. ❌ La contraseña no coincide
3. ❌ La base de datos no está conectada
4. ❌ Las migraciones no se ejecutaron correctamente

---

## ✅ **SOLUCIÓN PASO A PASO**

### **PASO 1: Verificar que estás en el VPS**

```bash
ssh usuario@162.240.174.46
cd /var/www/guidoblanco
```

### **PASO 2: Verificar conexión a PostgreSQL**

```bash
# Probar conexión
psql -h localhost -U guidoblanco_user -d guidoblanco_db

# Si pide password, es: Tomi39917314!

# Si conecta, continuar. Si no, ir a PASO 3
```

**Dentro de psql:**
```sql
-- Verificar que las tablas existen
  \dt

-- Debes ver 5 tablas:
-- article_tags | articles | categories | tags | users

-- Si NO ves las tablas, ir a PASO 3
-- Si SÍ las ves, ir a PASO 4

\q
```

---

### **PASO 3: Crear/Recrear Base de Datos** (Si no existe)

```bash
# Ejecutar el script completo
sudo -u postgres psql -f database/setup-database-completo.sql
```

**Espera a que termine. Al final debe mostrar:**
```
SETUP COMPLETADO!
Tablas creadas:
article_tags
articles
categories
tags
users

Usuarios admin:
admin@guidoblanco.com
guidoblanco@gmail.com
```

Si ves eso, ✅ **la base de datos está lista**. Continúa al PASO 5.

---

### **PASO 4: Verificar Usuario Admin** (Si las tablas ya existían)

```bash
# Verificar que el usuario admin existe
psql -h localhost -U guidoblanco_user -d guidoblanco_db -c "SELECT email, is_admin FROM users WHERE is_admin = true;"
```

**Debes ver:**
```
           email            | is_admin
----------------------------+----------
 admin@guidoblanco.com      | t
 guidoblanco@gmail.com      | t
```

**Si NO ves ningún usuario:**

```bash
# Ejecutar solo la migración de usuarios admin
psql -h localhost -U guidoblanco_user -d guidoblanco_db -f database/migrations/003_create_admin_credentials.sql
```

**O crear manualmente:**

```bash
psql -h localhost -U guidoblanco_user -d guidoblanco_db

# Dentro de psql, pegar esto:
INSERT INTO users (email, password_hash, full_name, is_admin, email_verified) VALUES
('admin@guidoblanco.com', '$2a$10$Kq8QTfh8/ZZr5M4uS3vKL.YW9sZpZg5XzGQf8cHSXFqKJ9t8r1z2W', 'Guido Blanco', true, true)
ON CONFLICT (email) DO UPDATE SET
  password_hash = '$2a$10$Kq8QTfh8/ZZr5M4uS3vKL.YW9sZpZg5XzGQf8cHSXFqKJ9t8r1z2W',
  is_admin = true;

\q
```

---

### **PASO 5: Verificar Variables de Entorno**

```bash
# Verificar que .env.local existe
cat .env.local | grep DB_

# Debe mostrar:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=guidoblanco_db
# DB_USER=guidoblanco_user
# DB_PASSWORD=Tomi39917314!

# Si NO existe .env.local:
cp .env.production .env.local
```

---

### **PASO 6: Probar Conexión desde Node.js**

```bash
# Ejecutar script de prueba
node test-connection.js
```

**Debe mostrar:**
```
✅ Conectado a: guidoblanco_db
✅ Tabla 'users' existe
✅ Admin: admin@guidoblanco.com
```

**Si da error de conexión:**
- Verificar que PostgreSQL está corriendo: `sudo systemctl status postgresql`
- Verificar credenciales en `.env.local`

---

### **PASO 7: Reiniciar la Aplicación**

```bash
# Reiniciar PM2
pm2 restart guidoblanco

# Ver logs en tiempo real
pm2 logs guidoblanco

# Buscar errores de conexión a BD
# Presiona Ctrl+C para salir
```

---

### **PASO 8: Probar Login Nuevamente**

Abre tu navegador:

**http://162.240.174.46:3002/auth/login**

Intenta login con:
- **Email:** `admin@guidoblanco.com`
- **Password:** `admin123`

---

## 🔍 **VERIFICACIÓN ADICIONAL**

### Ver logs de autenticación en tiempo real:

```bash
pm2 logs guidoblanco --lines 100
```

**Busca estos mensajes:**

✅ **Login exitoso:**
```
✅ Login exitoso para: admin@guidoblanco.com | Admin: true
```

❌ **Usuario no encontrado:**
```
❌ Usuario no encontrado
```

❌ **Contraseña incorrecta:**
```
❌ Contraseña incorrecta
```

❌ **Error de conexión:**
```
❌ Auth error: connect ECONNREFUSED
```

---

## 🆘 **SOLUCIONES RÁPIDAS POR TIPO DE ERROR**

### Error: "Usuario no encontrado"

```bash
# El usuario no existe en la BD
psql -h localhost -U guidoblanco_user -d guidoblanco_db

INSERT INTO users (email, password_hash, full_name, is_admin, email_verified) VALUES
('admin@guidoblanco.com', '$2a$10$Kq8QTfh8/ZZr5M4uS3vKL.YW9sZpZg5XzGQf8cHSXFqKJ9t8r1z2W', 'Guido Blanco', true, true);

\q
```

### Error: "connect ECONNREFUSED"

```bash
# PostgreSQL no está corriendo
sudo systemctl start postgresql
sudo systemctl status postgresql

# Reiniciar app
pm2 restart guidoblanco
```

### Error: "password authentication failed"

```bash
# Verificar password en .env.local
cat .env.local | grep DB_PASSWORD

# Debe ser: DB_PASSWORD=Tomi39917314!

# Si es diferente, corregir:
nano .env.local
# Cambiar DB_PASSWORD
# Guardar: Ctrl+X, Y, Enter

pm2 restart guidoblanco
```

---

## 🎯 **SCRIPT DE DIAGNÓSTICO COMPLETO**

Ejecuta este script para diagnosticar TODO:

```bash
#!/bin/bash

echo "🔍 DIAGNÓSTICO COMPLETO DE LOGIN"
echo "================================"
echo ""

echo "1. PostgreSQL está corriendo?"
sudo systemctl status postgresql --no-pager | grep Active

echo ""
echo "2. Base de datos existe?"
sudo -u postgres psql -lqt | cut -d \| -f 1 | grep guidoblanco_db

echo ""
echo "3. Tablas creadas?"
psql -h localhost -U guidoblanco_user -d guidoblanco_db -c "\dt" 2>&1 | grep -E "users|categories|articles"

echo ""
echo "4. Usuario admin existe?"
psql -h localhost -U guidoblanco_user -d guidoblanco_db -c "SELECT email, is_admin FROM users WHERE is_admin = true;" 2>&1

echo ""
echo "5. Variables de entorno correctas?"
cat .env.local | grep -E "DB_HOST|DB_NAME|DB_USER"

echo ""
echo "6. PM2 corriendo?"
pm2 status | grep guidoblanco

echo ""
echo "================================"
echo "Fin del diagnóstico"
```

**Guardar como `diagnostico.sh` y ejecutar:**

```bash
chmod +x diagnostico.sh
bash diagnostico.sh
```

---

## 📝 **COMANDOS RÁPIDOS (Copy-Paste)**

```bash
# TODO EN UNO - Si quieres empezar desde cero

# 1. Recrear BD
sudo -u postgres psql -f database/setup-database-completo.sql

# 2. Verificar
psql -h localhost -U guidoblanco_user -d guidoblanco_db -c "SELECT email FROM users WHERE is_admin = true;"

# 3. Probar conexión
node test-connection.js

# 4. Verificar .env.local
cp .env.production .env.local

# 5. Reiniciar app
pm2 restart guidoblanco
pm2 logs guidoblanco
```

---

## ✅ **VERIFICACIÓN FINAL**

Después de seguir los pasos:

- [ ] PostgreSQL está corriendo
- [ ] Base de datos `guidoblanco_db` existe
- [ ] 5 tablas creadas (users, categories, tags, articles, article_tags)
- [ ] Usuario `admin@guidoblanco.com` existe con `is_admin = true`
- [ ] `.env.local` tiene credenciales correctas
- [ ] `node test-connection.js` pasa todos los tests
- [ ] PM2 está corriendo sin errores
- [ ] Login funciona

---

**Si después de esto sigue sin funcionar, ejecuta:**

```bash
pm2 logs guidoblanco --lines 100
```

**Y envíame el error EXACTO que aparece en los logs.**
