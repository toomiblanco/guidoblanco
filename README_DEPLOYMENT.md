# 🚀 Deployment - Blog Guido Blanco

## ✅ Estado Actual

**✓ Refactorización completada**
**✓ Build exitoso sin errores**
**✓ Listo para deployment en VPS**

---

## 📁 Archivos Importantes

| Archivo | Descripción |
|---------|-------------|
| `RESUMEN_REFACTORIZACION.md` | 📌 **LEER PRIMERO** - Resumen completo |
| `CAMBIOS_REALIZADOS.md` | 📝 Cambios detallados |
| `INSTRUCCIONES_DATABASE.md` | 🗄️ Cómo recrear la base de datos |
| `PLAN_REFACTORIZACION.md` | 📋 Plan original de refactorización |
| `DEPLOYMENT_COMMANDS.sh` | 🚀 Script automatizado de deployment |
| `test-connection.js` | 🔍 Prueba de conexión a PostgreSQL |
| `.env.production` | ⚙️ Variables de entorno para VPS |

---

## 🎯 Quick Start - 3 Pasos

### 1️⃣ Verificar Conexión Local

```bash
node test-connection.js
```

**Debes ver:**
```
✅ Conectado a: guidoblanco_db
✅ Tabla 'users' existe
✅ Admin: admin@guidoblanco.com
```

### 2️⃣ Recrear Base de Datos (si es necesario)

```bash
# Opción A: Desde tu máquina
psql -h 162.240.174.46 -U guidoblanco_user -d guidoblanco_db < database/migrations/001_initial_schema.sql
psql -h 162.240.174.46 -U guidoblanco_user -d guidoblanco_db < database/migrations/002_seed_data.sql
psql -h 162.240.174.46 -U guidoblanco_user -d guidoblanco_db < database/migrations/003_create_admin_credentials.sql

# Opción B: Ver instrucciones completas en INSTRUCCIONES_DATABASE.md
```

### 3️⃣ Deploy en VPS

```bash
# SSH al VPS
ssh usuario@162.240.174.46
cd /var/www/guidoblanco

# Ejecutar script de deployment
bash DEPLOYMENT_COMMANDS.sh

# O manual:
cp .env.production .env.local
npm install --production
npm run build
pm2 start npm --name "guidoblanco" -- start
```

---

## 🔑 Credenciales

### PostgreSQL:
- **Host (local):** `162.240.174.46`
- **Host (VPS):** `localhost`
- **Base de datos:** `guidoblanco_db`
- **Usuario:** `guidoblanco_user`
- **Password:** Ver `.env.production`

### Admin App:
- **Email:** `admin@guidoblanco.com`
- **Password:** `admin123`

---

## 🌐 URLs

### Desarrollo:
- **App:** http://localhost:3000
- **Login:** http://localhost:3000/auth/login
- **Admin:** http://localhost:3000/admin

### Producción (VPS):
- **App:** http://162.240.174.46:3000
- **Login:** http://162.240.174.46:3000/auth/login
- **Admin:** http://162.240.174.46:3000/admin

---

## 📊 Comandos Útiles

### Development:
```bash
npm run dev          # Iniciar desarrollo
npm run build        # Compilar
npm start            # Producción local
node test-connection.js  # Probar DB
```

### Production (VPS):
```bash
pm2 status              # Ver estado
pm2 logs guidoblanco    # Ver logs
pm2 restart guidoblanco # Reiniciar
pm2 monit               # Monitor
```

### Database:
```bash
# Conectar a PostgreSQL
psql -h 162.240.174.46 -U guidoblanco_user -d guidoblanco_db

# Verificar tablas
\dt

# Ver usuarios admin
SELECT email, is_admin FROM users WHERE is_admin = true;
```

---

## ✅ Checklist Pre-Deployment

- [ ] `node test-connection.js` pasa todos los tests
- [ ] `npm run build` compila sin errores
- [ ] Base de datos tiene todas las tablas
- [ ] Usuario admin existe en la BD
- [ ] `.env.production` configurado correctamente
- [ ] Login funciona localmente

---

## 🚀 Deployment en VPS

### Automático (Recomendado):
```bash
ssh usuario@162.240.174.46
cd /var/www/guidoblanco
bash DEPLOYMENT_COMMANDS.sh
```

### Manual:
```bash
# 1. Copiar archivos al VPS
scp -r * usuario@162.240.174.46:/var/www/guidoblanco/

# 2. SSH al VPS
ssh usuario@162.240.174.46
cd /var/www/guidoblanco

# 3. Configurar env
cp .env.production .env.local

# 4. Build
npm install --production
npm run build

# 5. PM2
pm2 start npm --name "guidoblanco" -- start
pm2 save
pm2 startup
```

---

## 🆘 Troubleshooting

### Login no funciona:
```bash
# Verificar NEXTAUTH_URL
cat .env.local | grep NEXTAUTH_URL

# Debe ser: http://162.240.174.46:3000
# Reiniciar
pm2 restart guidoblanco
```

### Error de conexión a BD:
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Probar conexión
node test-connection.js
```

### Error 401 en admin:
```bash
# Verificar usuario es admin
psql -h localhost -U guidoblanco_user -d guidoblanco_db
SELECT email, is_admin FROM users WHERE email = 'admin@guidoblanco.com';
```

---

## 📚 Estructura de Archivos Corregidos

```
├── app/
│   ├── api/
│   │   └── auth/[...nextauth]/route.ts  ✅ CORREGIDO
│   └── admin/
│       ├── page.tsx                      ✅ CORREGIDO
│       ├── articulos/page.tsx            ✅ CORREGIDO
│       ├── categorias/page.tsx           ✅ CORREGIDO
│       └── etiquetas/page.tsx            ✅ CORREGIDO
├── lib/
│   ├── auth/auth-helpers.ts              ✅ CORREGIDO
│   └── database/
│       ├── connection.ts                 ✅ MEJORADO
│       └── queries.ts                    ✅ CORREGIDO
├── types/
│   └── next-auth.d.ts                    ✅ NUEVO
├── middleware.ts                          ✅ CORREGIDO
├── .env.production                        ✅ CONFIGURADO
└── database/migrations/                   ✅ LISTAS
    ├── 001_initial_schema.sql
    ├── 002_seed_data.sql
    └── 003_create_admin_credentials.sql
```

---

## 🎉 Resultado Final

- ✅ **0 errores de compilación**
- ✅ **Autenticación funcionando**
- ✅ **Base de datos lista**
- ✅ **13 archivos duplicados eliminados**
- ✅ **Código limpio y consistente**
- ✅ **Documentación completa**

---

## 📞 Siguiente Paso

👉 **Lee:** `RESUMEN_REFACTORIZACION.md` para instrucciones detalladas

👉 **Ejecuta:** `bash DEPLOYMENT_COMMANDS.sh` en el VPS

👉 **Verifica:** http://162.240.174.46:3000/auth/login

---

**¡Tu proyecto está listo para producción! 🚀**
