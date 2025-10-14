# 🔧 SOLUCIÓN - Error 502 Bad Gateway con Nginx

## 🔍 **QUÉ SIGNIFICA EL ERROR 502**

El error 502 Bad Gateway significa que:
- ✅ Nginx está funcionando
- ❌ Nginx NO puede conectarse a tu aplicación Next.js

---

## 🎯 **SOLUCIÓN PASO A PASO**

### **PASO 1: Verificar que la aplicación está corriendo**

```bash
# Conectar al VPS
ssh usuario@162.240.174.46

# Ver estado de PM2
pm2 status

# Ver qué está corriendo en el puerto 3002
sudo netstat -tlnp | grep 3002

# O con lsof
sudo lsof -i :3002
```

**Debes ver algo como:**
```
tcp6  0  0 :::3002  :::*  LISTEN  [PID]/node
```

**Si NO ves nada en el puerto 3002:**

```bash
# Ir a la carpeta del proyecto
cd /var/www/guidoblanco

# Iniciar la aplicación
pm2 start ecosystem.config.js

# Verificar
pm2 status
pm2 logs guidoblanco
```

---

### **PASO 2: Verificar configuración de Nginx**

```bash
# Ver configuración de Nginx para tu sitio
cat /etc/nginx/sites-available/guidoblanco

# O si está en otro archivo:
cat /etc/nginx/conf.d/guidoblanco.conf

# O buscar todos los archivos de configuración:
grep -r "162.240.174.46" /etc/nginx/
```

**La configuración de Nginx debe apuntar al puerto 3002:**

```nginx
server {
    listen 80;
    server_name 162.240.174.46;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

### **PASO 3: Crear/Corregir configuración de Nginx**

Si no existe o está mal configurada, créala:

```bash
# Crear archivo de configuración
sudo nano /etc/nginx/sites-available/guidoblanco
```

**Pegar esta configuración:**

```nginx
server {
    listen 80;
    server_name 162.240.174.46;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

**Guardar:** `Ctrl+X` → `Y` → `Enter`

**Activar el sitio:**

```bash
# Crear enlace simbólico
sudo ln -s /etc/nginx/sites-available/guidoblanco /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Si dice "syntax is ok", recargar Nginx
sudo systemctl reload nginx
```

---

### **PASO 4: Verificar que todo está corriendo**

```bash
# 1. Verificar PM2
pm2 status
# Debe mostrar: guidoblanco | online

# 2. Verificar puerto 3002
sudo netstat -tlnp | grep 3002
# Debe mostrar que algo está escuchando en 3002

# 3. Verificar Nginx
sudo systemctl status nginx
# Debe estar: active (running)

# 4. Ver logs de Nginx
sudo tail -f /var/log/nginx/error.log
```

---

### **PASO 5: Reiniciar todo si es necesario**

```bash
# Reiniciar la aplicación
pm2 restart guidoblanco

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver logs
pm2 logs guidoblanco
```

---

## 🔍 **DIAGNÓSTICO COMPLETO**

Ejecuta este script para ver todo:

```bash
#!/bin/bash

echo "==================================="
echo "DIAGNÓSTICO DE ERROR 502"
echo "==================================="
echo ""

echo "1. Estado de PM2:"
pm2 status | grep guidoblanco
echo ""

echo "2. Puerto 3002:"
sudo netstat -tlnp | grep 3002 || echo "   ❌ Nada escuchando en 3002"
echo ""

echo "3. Estado de Nginx:"
sudo systemctl status nginx --no-pager | grep Active
echo ""

echo "4. Archivos de configuración de Nginx:"
ls -la /etc/nginx/sites-enabled/ | grep -v "^d"
echo ""

echo "5. Últimos errores de Nginx:"
sudo tail -20 /var/log/nginx/error.log
echo ""

echo "6. Últimos logs de la app:"
pm2 logs guidoblanco --lines 20 --nostream
echo ""

echo "==================================="
```

**Guardar como `diagnostico-502.sh` y ejecutar:**

```bash
bash diagnostico-502.sh
```

---

## 🚨 **SOLUCIONES RÁPIDAS POR PROBLEMA**

### **Problema: La app no está corriendo**

```bash
cd /var/www/guidoblanco
pm2 delete guidoblanco
pm2 start ecosystem.config.js
pm2 save
```

### **Problema: Puerto 3002 no responde**

```bash
# Ver qué está usando el puerto
sudo lsof -i :3002

# Si hay algo en otro puerto, cambiar en ecosystem.config.js
nano ecosystem.config.js
# Cambiar PORT: 3002 a otro puerto libre

# O matar el proceso que usa 3002
sudo kill -9 [PID]

# Reiniciar
pm2 restart guidoblanco
```

### **Problema: Nginx no encuentra el proxy**

```bash
# Editar configuración
sudo nano /etc/nginx/sites-available/guidoblanco

# Asegurarse de que dice:
# proxy_pass http://localhost:3002;

# Verificar y recargar
sudo nginx -t
sudo systemctl reload nginx
```

### **Problema: Hay otro sitio en el puerto 80**

```bash
# Ver qué sitios están habilitados
ls -la /etc/nginx/sites-enabled/

# Ver configuración del sitio default
cat /etc/nginx/sites-enabled/default

# Si hay conflicto, deshabilitar default:
sudo rm /etc/nginx/sites-enabled/default
sudo systemctl reload nginx
```

---

## ✅ **VERIFICACIÓN FINAL**

Después de arreglar, verifica:

```bash
# 1. App corriendo
pm2 status | grep guidoblanco
# Debe mostrar: online

# 2. Puerto escuchando
sudo netstat -tlnp | grep 3002
# Debe mostrar: LISTEN

# 3. Nginx funcionando
sudo systemctl status nginx
# Debe mostrar: active (running)

# 4. Probar desde el servidor
curl http://localhost:3002
# Debe retornar HTML

# 5. Probar desde el servidor con Nginx
curl http://162.240.174.46
# Debe retornar HTML
```

---

## 📝 **COMANDOS RÁPIDOS TODO-EN-UNO**

```bash
# Conectar al VPS
ssh usuario@162.240.174.46

# Ir al proyecto
cd /var/www/guidoblanco

# Reiniciar app
pm2 restart guidoblanco

# Ver si está corriendo en 3002
sudo netstat -tlnp | grep 3002

# Ver logs
pm2 logs guidoblanco --lines 50

# Reiniciar Nginx
sudo systemctl restart nginx

# Ver errores de Nginx
sudo tail -50 /var/log/nginx/error.log

# Probar
curl http://localhost:3002
```

---

## 🔧 **CONFIGURACIÓN COMPLETA DE NGINX**

Si necesitas crear la configuración desde cero:

```bash
# Crear archivo
sudo nano /etc/nginx/sites-available/guidoblanco
```

**Copiar esta configuración:**

```nginx
server {
    listen 80;
    server_name 162.240.174.46;

    # Logs
    access_log /var/log/nginx/guidoblanco-access.log;
    error_log /var/log/nginx/guidoblanco-error.log;

    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # Buffer sizes
        proxy_buffer_size 4k;
        proxy_buffers 4 32k;
        proxy_busy_buffers_size 64k;
    }

    # Archivos estáticos
    location /_next/static/ {
        proxy_pass http://localhost:3002/_next/static/;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Public files
    location /public/ {
        proxy_pass http://localhost:3002/public/;
        add_header Cache-Control "public, max-age=3600";
    }
}
```

**Activar y recargar:**

```bash
sudo ln -sf /etc/nginx/sites-available/guidoblanco /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 📞 **SIGUIENTE PASO**

Ejecuta estos comandos y envíame el resultado:

```bash
pm2 status
sudo netstat -tlnp | grep 3002
sudo systemctl status nginx
```

Así puedo ver exactamente qué está pasando.
