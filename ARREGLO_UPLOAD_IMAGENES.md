# 🔧 Arreglo Upload de Imágenes de Portada

## 🚨 Problema Identificado
El botón de upload de imagen de portada fallaba porque:
1. **URL incorrecta**: Llamaba a `/api/upload` en lugar de `/api/upload/image`
2. **Directorio faltante**: El directorio `public/uploads/images/` no existe en el VPS
3. **Falta de logging**: No había información de debugging

## ✅ Soluciones Implementadas

### 1. **Corregida la URL de la API**
- Cambiado de `/api/upload` a `/api/upload/image`
- Agregado más logging y manejo de errores

### 2. **Mejorado el manejo de errores**
- Más información de debugging en consola
- Mejor manejo de respuestas de error

### 3. **Agregado logging detallado**
- La API ahora registra cada paso del upload
- Más fácil identificar problemas

---

## 🚀 PASOS PARA DEPLOYMENT

### 1. **Subir Código Actualizado**
```bash
# En tu máquina local
git add .
git commit -m "Arreglar upload de imagen de portada - corregir URL y mejorar debugging"
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

# **IMPORTANTE: Crear directorio de uploads**
mkdir -p public/uploads/images
chmod 755 public/uploads/images
chown -R root:root public/uploads/images

# Verificar que el directorio existe
ls -la public/uploads/

# Compilar proyecto
npm run build

# Reiniciar aplicación
pm2 restart guidoblanco

# Ver logs en tiempo real para debugging
pm2 logs guidoblanco --lines 0
```

### 3. **Probar Upload de Imagen**
1. Ve a `http://162.240.174.46:3002/admin/articulos/nuevo`
2. Haz clic en el botón de upload (📤) junto a "URL de Imagen"
3. Selecciona una imagen
4. **Monitorea los logs** en la terminal mientras subes la imagen

### 4. **Debugging en Tiempo Real**
```bash
# En una terminal separada, monitorear logs
pm2 logs guidoblanco --lines 0

# Verás logs como estos cuando subas una imagen:
# 🖼️ Upload image request received
# 📁 File details: {name: "image.jpg", size: 123456, type: "image/jpeg"}
# 📂 Uploads directory: /var/www/guidoblanco/public/uploads/images
# 💾 Saving file to: /var/www/guidoblanco/public/uploads/images/image-1728567890123.jpg
# ✅ File saved successfully
# 🌐 Image URL: /uploads/images/image-1728567890123.jpg
```

### 5. **Verificar que las Imágenes se Suben**
```bash
# Verificar que las imágenes se están guardando
ls -la /var/www/guidoblanco/public/uploads/images/

# Verificar permisos
ls -ld /var/www/guidoblanco/public/uploads/images/
```

---

## 🎯 **Esperado Después del Arreglo**

### ✅ **Upload Funcionando**
- El botón de upload ahora debería funcionar
- Las imágenes se guardan en `/public/uploads/images/`
- El campo "URL de Imagen" se llena automáticamente
- La vista previa se muestra correctamente

### ✅ **Debugging Mejorado**
- Los logs muestran cada paso del proceso
- Fácil identificar si hay problemas de permisos
- Información detallada de archivos subidos

### ✅ **URL Correcta**
- La API `/api/upload/image` funciona correctamente
- Las imágenes son accesibles en `http://162.240.174.46:3002/uploads/images/nombre-archivo.jpg`

---

## 🛠️ **Si Aún Hay Problemas**

### **Verificar Permisos**
```bash
# Asegurar permisos correctos
sudo chown -R root:root /var/www/guidoblanco/public/uploads/
sudo chmod -R 755 /var/www/guidoblanco/public/uploads/
```

### **Verificar Espacio en Disco**
```bash
df -h
```

### **Probar Upload Manualmente**
```bash
# Probar la API directamente
curl -X POST http://localhost:3002/api/upload/image \
  -F "image=@/path/to/test-image.jpg"
```

---

¡Ahora el sistema de upload de imágenes debería funcionar perfectamente! 🎉