# 🚀 DEPLOYMENT - Editor Avanzado Implementado

## ✅ Nuevas Funcionalidades Agregadas

### 📝 **Editor WYSIWYG Avanzado**
- **Editor rico** con formato completo (negrita, cursiva, títulos, listas, etc.)
- **Subida de imágenes** directa desde el editor
- **Pegado desde Word/PDF** con limpieza automática de formato
- **Vista previa en tiempo real** del contenido
- **Herramientas avanzadas**: enlaces, citas, código, alineación

### 🖼️ **Sistema de Imágenes**
- **API de upload** en `/api/upload/image`
- **Almacenamiento local** en `/public/uploads/images/`
- **Validación** de tipo y tamaño (máx 5MB)
- **Nombres únicos** con timestamp
- **URLs públicas** automáticas

### 🎯 **Campos de Entrevista**
- Nombre del entrevistado
- Fecha de la entrevista
- Fecha de publicación
- Posición de imagen de portada

---

## 📦 PASOS PARA DEPLOYMENT

### 1. **Subir Código Actualizado**
```bash
# En tu máquina local
git add .
git commit -m "Editor WYSIWYG avanzado con upload de imágenes y campos de entrevista"
git push origin main
```

### 2. **Actualizar en el VPS**
```bash
# SSH al servidor
ssh root@162.240.174.46

# Ir al directorio del proyecto
cd /var/www/guidoblanco

# Actualizar código
git pull origin main

# Instalar dependencias (react-quill ya está en package.json)
npm install

# Crear directorio de uploads si no existe
mkdir -p public/uploads/images
chmod 755 public/uploads/images

# Compilar proyecto
npm run build

# Reiniciar aplicación
pm2 restart guidoblanco

# Verificar estado
pm2 status
pm2 logs guidoblanco --lines 10
```

### 3. **Verificar Funcionamiento**
```bash
# Probar que el servidor responde
curl http://localhost:3002

# Verificar directorio de uploads
ls -la public/uploads/images/

# Probar upload de imagen (opcional)
curl -X POST http://localhost:3002/api/upload/image \
  -H "Content-Type: multipart/form-data" \
  -F "image=@/path/to/test-image.jpg"
```

---

## 🎨 **Características del Nuevo Editor**

### **Barra de Herramientas Completa**
- **Títulos**: H1, H2, H3, H4, H5, H6
- **Formato**: Negrita, cursiva, subrayado, tachado
- **Colores**: Texto y fondo
- **Alineación**: Izquierda, centro, derecha
- **Listas**: Numeradas y con viñetas
- **Elementos**: Enlaces, imágenes, videos, citas, código

### **Funciones Especiales**
- **Pegado inteligente**: Desde Word, PDF, otras webs
- **Upload de imágenes**: Arrastra o click para subir
- **Historial**: Deshacer/rehacer con Ctrl+Z/Ctrl+Y
- **Responsive**: Se adapta a móviles y tablets

### **Integración Completa**
- **Base de datos**: Nuevos campos agregados
- **APIs**: CRUD completo actualizado
- **Formularios**: Editor integrado en creación/edición
- **Validación**: Campos requeridos y opcionales

---

## 🛠️ **Archivos Modificados/Creados**

### **Nuevos Archivos**
- `components/admin/rich-text-editor.tsx` - Editor WYSIWYG
- `app/api/upload/image/route.ts` - API para subir imágenes
- `public/uploads/images/` - Directorio de imágenes

### **Archivos Modificados**
- `components/admin/article-editor.tsx` - Integración del nuevo editor
- `lib/database/queries.ts` - Nuevos campos en Article interface
- Funciones `createArticle` y `updateArticle` actualizadas

### **Base de Datos**
- Tabla `articles` actualizada con campos:
  - `interviewee_name`
  - `interview_date` 
  - `published_date`
  - `featured_image_position`

---

## 🎯 **Cómo Usar el Nuevo Editor**

### **Para Crear un Artículo**
1. Ir a `/admin/articulos/nuevo`
2. Llenar título, slug, resumen
3. **Usar el editor rico** para el contenido:
   - Formatear texto con la barra de herramientas
   - Subir imágenes con el botón 🖼️
   - Pegar desde Word/PDF directamente
4. Configurar campos de entrevista (opcional)
5. Seleccionar imagen de portada y posición
6. Asignar categoría y etiquetas
7. Guardar como borrador o publicar

### **Funciones Avanzadas**
- **Ctrl+V**: Pegar contenido formateado
- **Ctrl+B**: Negrita
- **Ctrl+I**: Cursiva  
- **Ctrl+Z**: Deshacer
- **Ctrl+Y**: Rehacer

---

## 🚨 **Notas Importantes**

### **Permisos de Archivos**
- El directorio `/public/uploads/images/` debe tener permisos de escritura
- Las imágenes se guardan con nombres únicos para evitar conflictos

### **Límites**
- Tamaño máximo de imagen: **5MB**
- Formatos soportados: **JPG, PNG, GIF, WEBP**
- Las imágenes se almacenan localmente en el servidor

### **Seguridad**
- Solo administradores pueden subir imágenes
- Validación de tipos de archivo
- Nombres de archivo sanitizados

---

¡El sistema está listo para usar con todas las funcionalidades avanzadas implementadas! 🎉