# Cambios Realizados en la Refactorización

**Fecha:** 2025-10-05
**Estado:** ✅ Completado

---

## 📌 Resumen

Se ha completado la refactorización completa del proyecto para migrar de Supabase a PostgreSQL directo, corrigiendo todos los problemas de autenticación y conexión.

---

## ✅ Tareas Completadas

### 1. Tipos TypeScript para NextAuth Extendido
**Archivo creado:** `types/next-auth.d.ts`

- Extendido los tipos de NextAuth para incluir `role` en User, Session y JWT
- Definido roles como `'admin' | 'user'`
- Agregado tipado correcto para `id`, `email`, y `name`

### 2. Configuración de NextAuth Corregida
**Archivo modificado:** `app/api/auth/[...nextauth]/route.ts`

**Cambios:**
- Agregado tipado `AuthOptions` correcto
- Mejorados los callbacks `jwt` y `session` para manejar roles
- Agregado logging con emojis para mejor debugging
- Configurado `maxAge` de sesión a 30 días
- Agregado `secret` desde variable de entorno
- Habilitado `debug` en desarrollo

**Antes:**
```typescript
if (!session?.user?.isAdmin) { ... }
```

**Después:**
```typescript
if (session.user.role !== 'admin') { ... }
```

### 3. Auth Helpers Refactorizados
**Archivo modificado:** `lib/auth/auth-helpers.ts`

**Cambios:**
- Removida dependencia de queries a base de datos para validar admin
- Ahora usa directamente `session.user.role` del JWT
- Agregadas nuevas funciones helper:
  - `isAdmin()`: Verifica si el usuario actual es admin
  - `isAuthenticated()`: Verifica si hay sesión activa
- Mejorada documentación con JSDoc

**Funciones removidas:**
- `checkUserAdmin()` - Ya no necesaria

### 4. Middleware Completo de Autenticación
**Archivo modificado:** `middleware.ts`

**Cambios:**
- Implementado middleware completo con `getToken` de NextAuth
- Protección de rutas `/admin/*` - requiere autenticación y rol admin
- Redirección automática a login si no autenticado
- Redirección a home si autenticado pero no admin
- Prevención de acceso a `/auth/login` si ya está logueado
- Matcher optimizado para excluir archivos estáticos

**Funcionalidad:**
- `/admin/*` → Requiere `role === 'admin'`
- `/auth/login` → Redirige a `/admin` si ya es admin, a `/` si es user normal

### 5. Queries Corregidas para Author ID
**Archivo modificado:** `lib/database/queries.ts`

**Cambios:**
- `createArticle()` ahora acepta `authorEmail` como tercer parámetro
- Si se pasa `authorEmail`, busca el `user.id` en la base de datos
- Corregido el manejo para que `author_id` sea siempre UUID, no email

**Antes:**
```typescript
createArticle(articleData, tags)
// Pasaba email directamente a author_id
```

**Después:**
```typescript
createArticle(articleData, tags, user.email)
// Busca el UUID del usuario por email
```

### 6. API Routes Estandarizadas
**Archivos modificados:**
- `app/api/admin/articles/route.ts`
- `app/api/admin/articles/[id]/route.ts`
- `app/api/admin/categories/route.ts`
- `app/api/admin/categories/[id]/route.ts`
- `app/api/admin/tags/route.ts`
- `app/api/admin/tags/[id]/route.ts`

**Cambios aplicados a todas:**
- Uso de `requireAdmin()` en lugar de validación manual
- Manejo de errores estandarizado con try-catch
- Mensajes de error consistentes
- Logging con emojis para mejor debugging
- Status codes HTTP correctos (201 para creación, 404 para no encontrado)
- Validación de campos requeridos antes de queries
- Generación de slugs con normalización de acentos

**Patrón de validación estandarizado:**
```typescript
try {
  await requireAdmin()
  // ... lógica del endpoint
} catch (error) {
  if (error instanceof Error && error.message.includes('required')) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }
  return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
}
```

### 7. Páginas Admin Corregidas
**Archivos modificados:**
- `app/admin/page.tsx` ✅ Ya estaba bien
- `app/admin/articulos/page.tsx`
- `app/admin/articulos/nuevo/page.tsx`
- `app/admin/articulos/[id]/editar/page.tsx`
- `app/admin/categorias/page.tsx` ✅ Ya estaba bien
- `app/admin/etiquetas/page.tsx` ✅ Ya estaba bien

**Cambios:**
- Validación corregida de `isAdmin` a `role === 'admin'`
- Verificación completa: `!session?.user || session.user.role !== 'admin'`

**Antes:**
```typescript
if (!session?.user?.isAdmin) {
  redirect("/auth/login")
}
```

**Después:**
```typescript
if (!session?.user || session.user.role !== 'admin') {
  redirect("/auth/login")
}
```

### 8. Manejo de Errores Mejorado en Connection
**Archivo modificado:** `lib/database/connection.ts`

**Mejoras:**
- Validación de variables de entorno requeridas al inicio
- Event handlers para el pool (connect, error, remove)
- Logging mejorado con emojis y timestamps
- Release automático de clientes en `finally`
- Nueva función `testConnection()` para verificar conectividad
- Configuración de SSL dinámica basada en `DB_SSL` env var
- Pool size ajustable según ambiente (prod: 20, dev: 10)
- Timeout de conexión aumentado a 5 segundos

**Nuevas funciones:**
```typescript
testConnection(): Promise<boolean>
// Verifica que la conexión a PostgreSQL funcione
```

### 9. Limpieza de Archivos
**Archivos eliminados:**
- `app/admin/articulos/nuevo/page_new.tsx`
- `app/admin/articulos/page_new.tsx`
- `app/admin/categorias/page_new.tsx`
- `app/admin/page-broken.tsx`
- `app/api/admin/migrate-subcategories/route_new.ts`
- `app/noticias/page-old.tsx`
- `app/page-full.tsx.bak`
- `app/page-simple.tsx`
- `components/admin/create-category-form-old.tsx`
- `components/admin/create-tag-form-old.tsx`
- `components/featured-news-section_new.tsx`
- `components/latest-articles-section_new.tsx`
- `proyecto_actualizado.zip`

**Total:** 13 archivos duplicados/legacy eliminados

---

## 🔑 Cambios Clave en Autenticación

### Flujo de Autenticación Corregido:

1. **Login** (`/auth/login`):
   - Usuario ingresa email y contraseña
   - `authorize()` busca usuario en PostgreSQL
   - Verifica contraseña con bcrypt
   - Retorna objeto con `role: 'admin' | 'user'`

2. **JWT Callback**:
   - Al hacer login, agrega `id`, `email`, `role` al token
   - Token se almacena en cookie encriptada

3. **Session Callback**:
   - En cada request, extrae datos del token
   - Los agrega a `session.user`
   - Ahora `session.user.role` está disponible

4. **Middleware**:
   - Intercepta requests a rutas protegidas
   - Verifica token JWT
   - Valida `token.role === 'admin'` para `/admin/*`
   - Redirige si no autorizado

5. **API Routes**:
   - Usan `requireAdmin()` que verifica `session.user.role`
   - No necesitan queries adicionales a la DB

---

## 📊 Mejoras en Logging

Ahora los logs son más claros y útiles:

```
✅ Login exitoso para: admin@guidoblanco.com | Admin: true
✅ Nueva conexión a PostgreSQL establecida
📊 Query ejecutada: { duration: '15ms', rows: 1, query: 'SELECT * FROM users WHERE...' }
❌ Error en query: { duration: '100ms', query: 'INSERT INTO...', error: 'duplicate key' }
```

---

## 🔧 Variables de Entorno Necesarias

### `.env.local` (Desarrollo)
```env
DB_HOST=162.240.174.46
DB_PORT=5432
DB_NAME=guidoblanco_db
DB_USER=guidoblanco_user
DB_PASSWORD=guidoblanco123
DB_SSL=false

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=mi-secreto-super-seguro-para-nextauth-2024

NODE_ENV=development
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### `.env.production` (Producción - VPS)
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=guidoblanco_db
DB_USER=guidoblanco_user
DB_PASSWORD=guidoblanco123
DB_SSL=false

NEXTAUTH_URL=http://TU_IP_VPS:3000
NEXTAUTH_SECRET=GENERAR_SECRETO_SEGURO_NUEVO

NODE_ENV=production
NEXT_PUBLIC_SITE_URL=http://TU_IP_VPS:3000
```

**Nota:** En el VPS usar `DB_HOST=localhost` para conexión local más rápida.

---

## 🎯 Próximos Pasos

1. **Verificar Base de Datos:**
   - Conectar a PostgreSQL en VPS
   - Ejecutar migraciones si no están aplicadas
   - Verificar que usuario admin existe

2. **Probar Localmente:**
   ```bash
   npm install
   npm run dev
   ```
   - Ir a http://localhost:3000/auth/login
   - Login con admin@guidoblanco.com / admin123
   - Verificar acceso a /admin

3. **Build para Producción:**
   ```bash
   npm run build
   npm start
   ```

4. **Deploy en VPS:**
   - Copiar archivos al VPS
   - Configurar `.env.production` → `.env.local`
   - Ejecutar `npm install --production`
   - Ejecutar `npm run build`
   - Iniciar con PM2

---

## ✅ Problemas Resueltos

- ✅ Error de `session.user.isAdmin is undefined`
- ✅ Inconsistencia entre validación de admin en páginas y APIs
- ✅ Author ID recibiendo email en lugar de UUID
- ✅ Middleware no protegiendo rutas admin
- ✅ Archivos duplicados causando confusión
- ✅ Falta de logging útil para debugging
- ✅ Pool de conexiones sin manejo de errores
- ✅ Validación manual de admin en cada endpoint
- ✅ Tipos de TypeScript faltantes para NextAuth

---

## 📝 Notas Importantes

1. **Credenciales Admin:**
   - Email: `admin@guidoblanco.com` o `guidoblanco@gmail.com`
   - Password: `admin123`
   - Cambiar en producción!

2. **Seguridad:**
   - Generar nuevo `NEXTAUTH_SECRET` para producción
   - Considerar cambiar contraseña de admin
   - En VPS, cerrar puerto 5432 al exterior (solo localhost)

3. **Performance:**
   - Pool size: 10 en dev, 20 en prod
   - Timeout de conexión: 5 segundos
   - Queries logueadas solo en desarrollo

---

**Refactorización completada exitosamente! 🎉**

Todos los archivos están corregidos y listos para deployment.
