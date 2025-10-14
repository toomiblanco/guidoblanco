#!/bin/bash

# Script de despliegue para VPS
# Configurar estas variables antes de ejecutar
PROJECT_NAME="guidoblanco"
DOMAIN="tu-dominio.com"  # Cambiar por tu dominio
VPS_USER="root"          # Cambiar por tu usuario del VPS
VPS_IP="162.240.174.46"  # Tu IP del VPS
GITHUB_REPO="https://github.com/toomiblanco/guidoblanco.git"  # Tu repo

echo "🚀 Iniciando despliegue de $PROJECT_NAME"

# 1. Clonar o actualizar repositorio
if [ -d "/var/www/$PROJECT_NAME" ]; then
    echo "📁 Actualizando repositorio existente..."
    cd /var/www/$PROJECT_NAME
    git pull origin main
else
    echo "📁 Clonando repositorio..."
    sudo mkdir -p /var/www
    cd /var/www
    sudo git clone $GITHUB_REPO $PROJECT_NAME
    sudo chown -R $USER:$USER /var/www/$PROJECT_NAME
    cd $PROJECT_NAME
fi

# 2. Instalar dependencias
echo "📦 Instalando dependencias..."
pnpm install

# 3. Construir aplicación
echo "🔨 Construyendo aplicación..."
pnpm run build

# 4. Configurar PM2
echo "⚙️ Configurando PM2..."
pm2 delete $PROJECT_NAME 2>/dev/null || true
pm2 start npm --name "$PROJECT_NAME" -- start
pm2 save
pm2 startup

echo "🎉 Despliegue completado!"
echo "📝 Siguiente paso: configurar Nginx y variables de entorno"