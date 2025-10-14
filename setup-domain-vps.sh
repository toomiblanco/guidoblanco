#!/bin/bash

echo "🚀 Configurando dominio guidoblanco.com.ar en VPS"

# 1. Crear configuración de Nginx
echo "📝 Creando configuración de Nginx..."
sudo tee /etc/nginx/sites-available/guidoblanco.com.ar > /dev/null << 'EOF'
server {
    listen 80;
    server_name guidoblanco.com.ar www.guidoblanco.com.ar;

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

        # Buffer settings
        proxy_buffering on;
        proxy_buffer_size 128k;
        proxy_buffers 4 256k;
        proxy_busy_buffers_size 256k;
    }

    # Optimizaciones para archivos estáticos
    location /_next/static/ {
        proxy_pass http://localhost:3002;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }

    location /favicon.ico {
        proxy_pass http://localhost:3002;
        proxy_cache_valid 200 1y;
        add_header Cache-Control "public, immutable";
    }

    # Logs
    access_log /var/log/nginx/guidoblanco.com.ar.access.log;
    error_log /var/log/nginx/guidoblanco.com.ar.error.log;
}
EOF

# 2. Activar el sitio
echo "🔗 Activando configuración..."
sudo ln -sf /etc/nginx/sites-available/guidoblanco.com.ar /etc/nginx/sites-enabled/

# 3. Desactivar configuración anterior (si existe)
sudo rm -f /etc/nginx/sites-enabled/default
sudo rm -f /etc/nginx/sites-enabled/guidoblanco

# 4. Verificar configuración
echo "✅ Verificando configuración de Nginx..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuración válida. Reiniciando Nginx..."
    sudo systemctl reload nginx
    echo "🎉 ¡Nginx reiniciado exitosamente!"
    
    echo ""
    echo "📋 VERIFICACIONES:"
    echo "1. Verifica que tu aplicación esté corriendo en puerto 3002:"
    echo "   curl http://localhost:3002"
    echo ""
    echo "2. Verifica el estado de Nginx:"
    echo "   sudo systemctl status nginx"
    echo ""
    echo "3. Una vez que cambies los DNS en Cloudflare, prueba:"
    echo "   curl -I http://guidoblanco.com.ar"
    
else
    echo "❌ Error en la configuración de Nginx. Revisa los logs."
fi