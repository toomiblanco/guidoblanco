# 🐛 Guía de Debugging para VPS

## 🚀 Pasos para Diagnosticar el Error de Creación de Artículos

### 1. **Subir Archivos Actualizados al VPS**

```bash
# En tu máquina local
git add .
git commit -m "Mejorar logging para debugging"
git push origin main

# En el VPS
ssh usuario@162.240.174.46
cd /var/www/guidoblanco
git pull origin main
npm install
npm run build
pm2 restart guidoblanco
```

### 2. **Ejecutar Script de Debugging**

```bash
# En el VPS, hacer ejecutable el script
chmod +x debug-script.sh
./debug-script.sh
```

### 3. **Ver Logs en Tiempo Real**

```bash
# Terminal 1: Logs de la aplicación
pm2 logs guidoblanco --lines 0

# Terminal 2: Probar la API de salud
curl http://localhost:3002/api/health

# Terminal 3: Monitorear PostgreSQL (si es necesario)
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### 4. **Reproducir el Error**

1. Ve a la aplicación en el navegador: `http://162.240.174.46:3002/admin/articulos/nuevo`
2. Intenta crear un artículo
3. Observa los logs en tiempo real en la terminal

### 5. **Comandos de Diagnosis Específicos**

```bash
# Verificar estado de PM2
pm2 status
pm2 describe guidoblanco

# Ver logs detallados de errores
pm2 logs guidoblanco --err --lines 50

# Ver logs completos (stdout + stderr)
pm2 logs guidoblanco --lines 100

# Verificar base de datos
psql -h localhost -U guidoblanco_user -d guidoblanco_db -c "\d articles"

# Probar inserción manual en BD
psql -h localhost -U guidoblanco_user -d guidoblanco_db -c "
INSERT INTO articles (title, slug, content, author_id) 
VALUES ('Test Manual', 'test-manual', 'Contenido de prueba', 
        (SELECT id FROM users WHERE email = 'admin@guidoblanco.com' LIMIT 1));"
```

### 6. **Archivos de Log a Revisar**

```bash
# Logs de la aplicación (si existen)
cat /var/www/guidoblanco/logs/pm2-error.log
cat /var/www/guidoblanco/logs/pm2-out.log
cat /var/www/guidoblanco/logs/pm2-combined.log

# Si no existen, PM2 los guarda en:
cat ~/.pm2/logs/guidoblanco-error.log
cat ~/.pm2/logs/guidoblanco-out.log
```

### 7. **Descargar Logs a tu Máquina Local**

```bash
# Desde tu máquina local
mkdir logs_debugging
cd logs_debugging

# Descargar logs de PM2
scp usuario@162.240.174.46:~/.pm2/logs/guidoblanco-*.log ./

# Descargar logs de aplicación (si existen)
scp usuario@162.240.174.46:/var/www/guidoblanco/logs/*.log ./

# Descargar script de debug ejecutado
scp usuario@162.240.174.46:/var/www/guidoblanco/debug-output.txt ./
```

### 8. **Habilitar Logging Máximo Temporalmente**

```bash
# En el VPS, editar ecosystem.config.js para más logging
nano /var/www/guidoblanco/ecosystem.config.js

# Agregar variables de debug:
env: {
  NODE_ENV: 'production',
  PORT: 3002,
  DEBUG: '*',
  VERBOSE_LOGGING: 'true'
}

# Reiniciar con nuevo config
pm2 restart guidoblanco
```

### 9. **Probar API Directamente**

```bash
# Obtener cookie de sesión primero (login)
curl -c cookies.txt -X POST http://localhost:3002/api/auth/signin/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@guidoblanco.com","password":"admin123"}'

# Probar creación de artículo
curl -b cookies.txt -X POST http://localhost:3002/api/admin/articles \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Article",
    "slug": "test-article", 
    "content": "Test content",
    "summary": "Test summary",
    "is_featured": false,
    "is_published": false,
    "category_id": null
  }'
```

### 10. **Errores Comunes y Soluciones**

#### Error de Conexión a BD:
```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verificar permisos
psql -h localhost -U guidoblanco_user -d guidoblanco_db -c "\dp"
```

#### Error de Permisos de Archivos:
```bash
# Verificar permisos del directorio
ls -la /var/www/guidoblanco/
sudo chown -R www-data:www-data /var/www/guidoblanco/public/uploads/
```

#### Error de Variables de Entorno:
```bash
# Verificar .env.local
cat /var/www/guidoblanco/.env.local
```

---

## 📞 **Resultado Esperado**

Después de seguir estos pasos, deberías tener:
1. Logs detallados del error específico
2. Identificación de si es problema de BD, permisos, o código
3. Información suficiente para resolver el problema

**¡Ejecuta estos pasos y comparte los logs para que pueda ayudarte mejor!**