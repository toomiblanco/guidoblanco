#!/bin/bash

echo "========================================"
echo "🔧 ARREGLANDO DEPENDENCIAS Y LOGIN"
echo "========================================"
echo ""

# 1. Instalar dependencias
echo "📦 Instalando dependencias completas..."
npm install
echo ""

# 2. Verificar que dotenv esté instalado
echo "✅ Verificando dotenv..."
npm list dotenv
echo ""

# 3. Verificar archivo .env.local
echo "📄 Verificando .env.local..."
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local no existe, copiando desde .env.production..."
    cp .env.production .env.local
fi

# 4. Corregir NEXTAUTH_URL (quitar :3002 porque Nginx está en puerto 80)
echo "🔧 Corrigiendo NEXTAUTH_URL para Nginx..."
sed -i 's|NEXTAUTH_URL=http://162.240.174.46:3002|NEXTAUTH_URL=http://162.240.174.46|g' .env.local
sed -i 's|NEXT_PUBLIC_SITE_URL=http://162.240.174.46:3002|NEXT_PUBLIC_SITE_URL=http://162.240.174.46|g' .env.local

echo ""
echo "📄 Configuración actualizada:"
cat .env.local
echo ""

# 5. Reiniciar PM2
echo "🔄 Reiniciando aplicación..."
pm2 restart guidoblanco
echo ""

# 6. Esperar 3 segundos
echo "⏳ Esperando 3 segundos..."
sleep 3
echo ""

# 7. Verificar logs
echo "📊 Logs de la aplicación:"
pm2 logs guidoblanco --lines 20 --nostream
echo ""

# 8. Probar conexión a base de datos
echo "🔍 Probando conexión a base de datos..."
node test-connection.js
echo ""

echo "========================================"
echo "✅ CONFIGURACIÓN COMPLETADA"
echo "========================================"
echo ""
echo "🌐 Ahora intenta acceder a:"
echo "   http://162.240.174.46/auth/login"
echo ""
echo "🔑 Credenciales:"
echo "   Email: admin@guidoblanco.com"
echo "   Password: admin123"
echo ""
echo "💡 Si sigue sin funcionar, ejecuta:"
echo "   pm2 logs guidoblanco"
echo "   y envíame la salida completa"
echo ""
