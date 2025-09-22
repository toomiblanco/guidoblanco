#!/bin/bash

# Script de instalación para Alma Linux VPS
# Ejecutar como: bash install-requirements.sh

echo "🚀 Instalando requisitos del sistema en Alma Linux..."

# Actualizar sistema
sudo dnf update -y

# Instalar EPEL repository (necesario para algunos paquetes)
sudo dnf install -y epel-release

# Instalar curl si no está instalado
sudo dnf install -y curl

# Instalar Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo dnf install -y nodejs

# Instalar pnpm (ya que tu proyecto usa pnpm-lock.yaml)
npm install -g pnpm

# Instalar PM2 para gestión de procesos
npm install -g pm2

# Instalar Nginx
sudo dnf install -y nginx

# Instalar Git (si no está instalado)
sudo dnf install -y git

# Verificar instalaciones
echo "✅ Verificando instalaciones:"
echo "Node.js: $(node --version)"
echo "npm: $(npm --version)"
echo "pnpm: $(pnpm --version)"
echo "pm2: $(pm2 --version)"
echo "nginx: $(nginx -v)"
echo "git: $(git --version)"

echo "🎉 Instalación completada!"