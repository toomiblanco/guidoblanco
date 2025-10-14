# Plan de Refactorización - Migración Supabase a PostgreSQL

**Proyecto:** Blog de Guido Blanco
**Fecha:** 2025-10-05
**Estado:** En progreso

---

## 📋 Análisis de la Situación Actual

### Problemas Identificados:
1. **Conexión de Base de Datos**: El proyecto migró de Supabase a PostgreSQL directo pero hay referencias mixtas
2. **Autenticación**: NextAuth configurado pero problemas con validación de admin
3. **Archivos Eliminados**: Varios archivos de Supabase marcados como "D" (deleted) en git
4. **Archivos Duplicados**: Múltiples versiones de páginas (`page.tsx`, `page_new.tsx`, `page-old.tsx`)
5. **Middleware**: Implementación incompleta de autenticación
6. **API Routes**: Inconsistencias en validación de usuarios admin
7. **Migraciones**: Base de datos tiene migraciones pero posiblemente no ejecutadas completamente

### Configuración Actual:
- **Base de Datos**: PostgreSQL en VPS (162.240.174.46:5432)
- **DB Name**: guidoblanco_db
- **DB User**: guidoblanco_user
- **Autenticación**: NextAuth con CredentialsProvider
- **Conexión**: Pool de pg con configuración directa

---

## 🎯 Objetivos del Plan

1. ✅ Asegurar conexión estable a PostgreSQL
2. ✅ Completar migración de base de datos
3. ✅ Limpiar código legacy de Supabase
4. ✅ Implementar autenticación completa con NextAuth
5. ✅ Eliminar archivos duplicados
6. ✅ Validar todas las rutas API
7. ✅ Configurar middleware de protección
8. ✅ Probar el sistema completo

---

## 📝 TAREAS DETALLADAS

### FASE 1: Preparación y Limpieza (CRÍTICO)

#### 1.1 Verificar Conexión a Base de Datos
- [ ] Probar conexión a PostgreSQL desde VPS
- [ ] Verificar que el puerto 5432 está abierto
- [ ] Confirmar credenciales en `.env.local`
- [ ] Agregar manejo de errores mejorado en `lib/database/connection.ts`
- [ ] Implementar retry logic para conexiones fallidas

**Archivos a modificar:**
- `lib/database/connection.ts`

**Comandos a ejecutar:**
```bash
# Test de conexión desde local
psql -h 162.240.174.46 -p 5432 -U guidoblanco_user -d guidoblanco_db
```

#### 1.2 Ejecutar/Verificar Migraciones
- [ ] Conectarse a PostgreSQL en VPS
- [ ] Ejecutar `001_initial_schema.sql` si no existe
- [ ] Ejecutar `002_seed_data.sql` para datos iniciales
- [ ] Ejecutar `003_create_admin_credentials.sql` para usuario admin
- [ ] Verificar que todas las tablas existen
- [ ] Verificar índices creados
- [ ] Verificar funciones y triggers

**Archivos involucrados:**
- `database/migrations/001_initial_schema.sql`
- `database/migrations/002_seed_data.sql`
- `database/migrations/003_create_admin_credentials.sql`

**Comandos a ejecutar:**
```bash
# Ejecutar migraciones en orden
psql -h 162.240.174.46 -p 5432 -U guidoblanco_user -d guidoblanco_db -f database/migrations/001_initial_schema.sql
psql -h 162.240.174.46 -p 5432 -U guidoblanco_user -d guidoblanco_db -f database/migrations/002_seed_data.sql
psql -h 162.240.174.46 -p 5432 -U guidoblanco_user -d guidoblanco_db -f database/migrations/003_create_admin_credentials.sql
```

#### 1.3 Limpiar Archivos Duplicados y Legacy
- [ ] Eliminar archivos con sufijo `_new.tsx`
- [ ] Eliminar archivos con sufijo `_old.tsx` y `-old.tsx`
- [ ] Eliminar archivos `-broken.tsx`
- [ ] Eliminar archivos eliminados de Supabase del git staging
- [ ] Limpiar carpeta `scripts/` (archivos .sql antiguos)
- [ ] Eliminar componentes de Supabase no utilizados

**Archivos a eliminar:**
```
app/admin/articulos/nuevo/page_new.tsx
app/admin/articulos/page_new.tsx
app/admin/categorias/page_new.tsx
app/admin/page-broken.tsx
app/api/admin/migrate-subcategories/route_new.ts
app/noticias/page-old.tsx
app/page-full.tsx.bak
app/page-simple.tsx
components/admin/create-category-form-old.tsx
components/admin/create-tag-form-old.tsx
components/featured-news-section_new.tsx
components/latest-articles-section_new.tsx
proyecto_actualizado.zip
```

---

### FASE 2: Refactorización de Autenticación

#### 2.1 Corregir NextAuth Configuration
- [ ] Revisar y corregir `authOptions` en `/app/api/auth/[...nextauth]/route.ts`
- [ ] Asegurar que el campo `isAdmin` se pase correctamente en la sesión
- [ ] Agregar tipado TypeScript para la sesión extendida
- [ ] Implementar manejo de errores detallado

**Archivos a modificar:**
- `app/api/auth/[...nextauth]/route.ts`
- Crear: `types/next-auth.d.ts` (para extender tipos)

#### 2.2 Corregir Auth Helpers
- [ ] Actualizar `lib/auth/auth-helpers.ts`
- [ ] Corregir función `requireAdmin()` para usar `session.user.role`
- [ ] Remover función `checkUserAdmin()` si es redundante
- [ ] Agregar validación consistente de admin

**Archivos a modificar:**
- `lib/auth/auth-helpers.ts`

#### 2.3 Implementar Middleware Completo
- [ ] Completar `middleware.ts` con protección de rutas admin
- [ ] Verificar sesión antes de permitir acceso
- [ ] Redirigir a login si no autenticado
- [ ] Verificar rol de admin para rutas `/admin/*`

**Archivos a modificar:**
- `middleware.ts`

---

### FASE 3: Corrección de API Routes

#### 3.1 Estandarizar Validación en APIs
- [ ] Revisar todas las rutas en `app/api/admin/`
- [ ] Usar helper `requireAdmin()` en lugar de validación manual
- [ ] Implementar manejo de errores consistente
- [ ] Agregar logging adecuado

**Archivos a revisar y modificar:**
- `app/api/admin/articles/route.ts`
- `app/api/admin/articles/[id]/route.ts`
- `app/api/admin/categories/route.ts`
- `app/api/admin/categories/[id]/route.ts`
- `app/api/admin/tags/route.ts`
- `app/api/admin/tags/[id]/route.ts`

#### 3.2 Corregir Queries de Base de Datos
- [ ] Revisar `lib/database/queries.ts`
- [ ] Asegurar que todas las queries usan `author_id` como UUID (no email)
- [ ] Corregir función `createArticle` para buscar user ID por email
- [ ] Agregar transacciones donde sea necesario
- [ ] Implementar mejor manejo de errores SQL

**Archivos a modificar:**
- `lib/database/queries.ts`

---

### FASE 4: Corrección de Páginas Admin

#### 4.1 Corregir Validación de Admin en Páginas
- [ ] Revisar todas las páginas en `app/admin/`
- [ ] Cambiar validación de `session?.user?.isAdmin` a `session?.user?.role === 'admin'`
- [ ] Agregar manejo de errores consistente
- [ ] Implementar loading states

**Archivos a modificar:**
- `app/admin/page.tsx`
- `app/admin/articulos/page.tsx`
- `app/admin/articulos/nuevo/page.tsx`
- `app/admin/articulos/[id]/editar/page.tsx`
- `app/admin/categorias/page.tsx`
- `app/admin/etiquetas/page.tsx`

#### 4.2 Revisar Componentes Admin
- [ ] Verificar que `AdminHeader` funcione correctamente
- [ ] Verificar `ArticlesTable` con datos de PostgreSQL
- [ ] Verificar `ArticleEditor` con nuevas queries
- [ ] Verificar tablas de categorías y etiquetas

**Archivos a revisar:**
- `components/admin/admin-header.tsx`
- `components/admin/article-editor.tsx`
- `components/admin/categories-table.tsx`

---

### FASE 5: Configuración de Producción

#### 5.1 Actualizar Variables de Entorno
- [ ] Crear `.env.production` para VPS
- [ ] Configurar `NEXTAUTH_URL` con la IP/dominio del VPS
- [ ] Configurar `NEXT_PUBLIC_SITE_URL` correctamente
- [ ] Generar nuevo `NEXTAUTH_SECRET` seguro

**Archivo a crear:**
- `.env.production`

**Contenido sugerido:**
```env
# Database Configuration (VPS)
DB_HOST=localhost
DB_PORT=5432
DB_NAME=guidoblanco_db
DB_USER=guidoblanco_user
DB_PASSWORD=guidoblanco123

# NextAuth Configuration
NEXTAUTH_URL=http://TU_IP_VPS:3000
NEXTAUTH_SECRET=GENERAR_SECRETO_SEGURO_AQUI

# Application Environment
NODE_ENV=production

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://TU_IP_VPS:3000
```

#### 5.2 Optimizar Conexión PostgreSQL
- [ ] Configurar pool de conexiones para producción
- [ ] Usar `DB_HOST=localhost` en VPS (conexión local más rápida)
- [ ] Ajustar timeouts y límites de pool
- [ ] Configurar SSL si es necesario

**Archivos a modificar:**
- `lib/database/connection.ts`

---

### FASE 6: Testing y Validación

#### 6.1 Tests de Conexión
- [ ] Probar conexión a base de datos desde local
- [ ] Probar conexión desde VPS
- [ ] Verificar que todas las queries funcionan
- [ ] Probar con pool de múltiples conexiones

#### 6.2 Tests de Autenticación
- [ ] Probar login con usuario admin
- [ ] Probar acceso a rutas protegidas
- [ ] Probar redirección si no autenticado
- [ ] Verificar que rol admin se valide correctamente

#### 6.3 Tests de Funcionalidad Admin
- [ ] Crear nuevo artículo
- [ ] Editar artículo existente
- [ ] Eliminar artículo
- [ ] Gestionar categorías
- [ ] Gestionar etiquetas
- [ ] Marcar artículo como destacado

#### 6.4 Tests de Frontend Público
- [ ] Verificar página principal carga artículos
- [ ] Verificar página de noticias
- [ ] Verificar artículo individual por slug
- [ ] Verificar meta tags para redes sociales

---

### FASE 7: Deployment en VPS

#### 7.1 Preparar Build de Producción
- [ ] Ejecutar `npm run build` localmente para verificar
- [ ] Corregir errores de build
- [ ] Verificar que no haya imports rotos
- [ ] Optimizar imágenes y assets

#### 7.2 Configurar VPS
- [ ] Instalar Node.js (versión 18+)
- [ ] Instalar PM2 para gestión de procesos
- [ ] Configurar Nginx como reverse proxy
- [ ] Configurar firewall (abrir puertos 80, 443, 3000)

#### 7.3 Deploy en VPS
- [ ] Clonar repositorio o subir archivos
- [ ] Copiar `.env.production` a `.env.local`
- [ ] Ejecutar `npm install`
- [ ] Ejecutar `npm run build`
- [ ] Iniciar con PM2: `pm2 start npm --name "guidoblanco" -- start`
- [ ] Configurar PM2 para auto-restart

#### 7.4 Configurar Nginx
- [ ] Crear configuración de sitio en Nginx
- [ ] Configurar proxy_pass a localhost:3000
- [ ] Configurar headers necesarios
- [ ] Reiniciar Nginx

---

## 🔧 Comandos Útiles

### Verificar Estado de Base de Datos
```bash
# Conectar a PostgreSQL
psql -h 162.240.174.46 -p 5432 -U guidoblanco_user -d guidoblanco_db

# Listar tablas
\dt

# Verificar usuarios
SELECT * FROM users;

# Verificar artículos
SELECT id, title, is_published, created_at FROM articles ORDER BY created_at DESC;

# Verificar categorías
SELECT * FROM categories;
```

### Desarrollo Local
```bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Build
npm run build

# Producción
npm start
```

### En VPS
```bash
# Build y deploy
npm install
npm run build
pm2 start npm --name "guidoblanco" -- start
pm2 save
pm2 startup

# Ver logs
pm2 logs guidoblanco

# Restart
pm2 restart guidoblanco
```

---

## 📊 Checklist de Verificación Final

### Base de Datos
- [ ] Todas las tablas creadas correctamente
- [ ] Índices configurados
- [ ] Usuario admin existe y puede loguearse
- [ ] Datos de ejemplo cargados (categorías, tags)

### Autenticación
- [ ] Login funciona correctamente
- [ ] Sesión persiste después de login
- [ ] Rutas admin protegidas
- [ ] Redirección a login si no autenticado

### Funcionalidad Admin
- [ ] Crear artículos funciona
- [ ] Editar artículos funciona
- [ ] Eliminar artículos funciona
- [ ] Gestión de categorías funciona
- [ ] Gestión de etiquetas funciona
- [ ] Artículos destacados funcionan

### Frontend Público
- [ ] Página principal muestra artículos
- [ ] Artículos individuales se muestran correctamente
- [ ] Navegación funciona
- [ ] Meta tags correctos
- [ ] Imágenes se cargan

### Performance
- [ ] Tiempo de respuesta < 2 segundos
- [ ] Pool de conexiones optimizado
- [ ] No hay memory leaks
- [ ] Build de producción optimizado

---

## 🚨 Problemas Conocidos a Resolver

1. **Author ID**: Las queries usan `author_id` pero en algunos lugares se pasa `email` en lugar de UUID
2. **Validación Admin**: Inconsistencia entre `isAdmin` y `role === 'admin'`
3. **Archivos Duplicados**: Múltiples versiones confusas del mismo archivo
4. **Middleware**: No implementado completamente
5. **Error Handling**: Necesita mejora en todas las API routes
6. **SSL**: PostgreSQL configurado sin SSL (puede ser necesario en producción)

---

## 📝 Notas Importantes

- **Credenciales Admin Actuales:**
  - Email: `admin@guidoblanco.com` o `guidoblanco@gmail.com`
  - Password: `admin123`

- **Conexión PostgreSQL:**
  - Desde local: usar IP `162.240.174.46`
  - Desde VPS: cambiar a `localhost` para mejor performance

- **Port Forwarding:**
  - Verificar que puerto 5432 está abierto en VPS para conexiones remotas
  - En producción, cerrar puerto 5432 y solo usar conexiones locales

---

## 🎯 Siguiente Paso Recomendado

**INICIAR CON FASE 1.2**: Verificar y ejecutar todas las migraciones en el VPS para asegurar que la base de datos está completa y funcional.

Luego proceder en orden con las fases restantes.

---

**Estado del Plan:** ⏳ Pendiente de Ejecución
**Última Actualización:** 2025-10-05
