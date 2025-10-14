#!/bin/bash

# ================================================================
# COMANDOS DE DEPLOYMENT - Blog Guido Blanco
# ================================================================
# Este archivo contiene todos los comandos necesarios para
# deployment del proyecto en el VPS
# ================================================================

echo "======================================"
echo "DEPLOYMENT - Blog Guido Blanco"
echo "======================================"
echo ""

# ================================================================
# PARTE 1: RECREAR BASE DE DATOS (OPCIONAL)
# ================================================================
echo "PASO 1: ¿Recrear base de datos? (s/N)"
read -r recreate_db

if [ "$recreate_db" = "s" ] || [ "$recreate_db" = "S" ]; then
    echo ""
    echo "📦 Recreando base de datos..."
    echo ""

    # Conectar como postgres y recrear
    sudo -u postgres psql <<EOF
-- Terminar conexiones activas
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'guidoblanco_db'
  AND pid <> pg_backend_pid();

-- Eliminar y recrear
DROP DATABASE IF EXISTS guidoblanco_db;
DROP USER IF EXISTS guidoblanco_user;

CREATE USER guidoblanco_user WITH PASSWORD 'Tomi39917314!';
CREATE DATABASE guidoblanco_db OWNER guidoblanco_user;
GRANT ALL PRIVILEGES ON DATABASE guidoblanco_db TO guidoblanco_user;

\c guidoblanco_db

GRANT ALL ON SCHEMA public TO guidoblanco_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO guidoblanco_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO guidoblanco_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO guidoblanco_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO guidoblanco_user;
EOF

    echo ""
    echo "✅ Base de datos recreada"
    echo ""

    # Ejecutar migraciones
    echo "📄 Ejecutando migraciones..."

    psql -h localhost -U guidoblanco_user -d guidoblanco_db -f database/migrations/001_initial_schema.sql
    echo "✅ Migración 1/3 completada"

    psql -h localhost -U guidoblanco_user -d guidoblanco_db -f database/migrations/002_seed_data.sql
    echo "✅ Migración 2/3 completada"

    psql -h localhost -U guidoblanco_user -d guidoblanco_db -f database/migrations/003_create_admin_credentials.sql
    echo "✅ Migración 3/3 completada"

    echo ""
    echo "✅ Todas las migraciones ejecutadas"
    echo ""
fi

# ================================================================
# PARTE 2: CONFIGURAR VARIABLES DE ENTORNO
# ================================================================
echo ""
echo "PASO 2: Configurar variables de entorno"
echo ""

if [ ! -f .env.local ]; then
    echo "📝 Copiando .env.production a .env.local..."
    cp .env.production .env.local
    echo "✅ .env.local creado"
else
    echo "⚠️  .env.local ya existe"
    echo "¿Sobrescribir con .env.production? (s/N)"
    read -r overwrite_env

    if [ "$overwrite_env" = "s" ] || [ "$overwrite_env" = "S" ]; then
        cp .env.production .env.local
        echo "✅ .env.local actualizado"
    fi
fi

echo ""
echo "📄 Contenido de .env.local:"
cat .env.local
echo ""

# ================================================================
# PARTE 3: INSTALAR DEPENDENCIAS Y BUILD
# ================================================================
echo ""
echo "PASO 3: Instalar dependencias y compilar"
echo ""

echo "📦 Instalando dependencias..."
npm install --production
echo "✅ Dependencias instaladas"
echo ""

echo "🔨 Compilando proyecto..."
npm run build

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Build completado exitosamente"
else
    echo ""
    echo "❌ Error en el build"
    echo "Revisa los errores arriba y corrige antes de continuar"
    exit 1
fi

# ================================================================
# PARTE 4: PM2 - GESTIÓN DE PROCESO
# ================================================================
echo ""
echo "PASO 4: Configurar PM2"
echo ""

# Verificar si PM2 está instalado
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 no está instalado"
    echo "¿Instalar PM2 globalmente? (s/N)"
    read -r install_pm2

    if [ "$install_pm2" = "s" ] || [ "$install_pm2" = "S" ]; then
        echo "📦 Instalando PM2..."
        sudo npm install -g pm2
        echo "✅ PM2 instalado"
    else
        echo "❌ PM2 es necesario para continuar"
        exit 1
    fi
fi

# Verificar si la app ya está corriendo
pm2_status=$(pm2 list | grep guidoblanco || echo "")

if [ -n "$pm2_status" ]; then
    echo "⚠️  La aplicación 'guidoblanco' ya está corriendo en PM2"
    echo "¿Qué deseas hacer?"
    echo "1) Reiniciar (restart)"
    echo "2) Recargar (reload - cero downtime)"
    echo "3) Detener y eliminar (delete)"
    echo "4) Saltar este paso"
    read -r pm2_action

    case $pm2_action in
        1)
            echo "🔄 Reiniciando aplicación..."
            pm2 restart guidoblanco
            ;;
        2)
            echo "🔄 Recargando aplicación..."
            pm2 reload guidoblanco
            ;;
        3)
            echo "🛑 Deteniendo y eliminando..."
            pm2 delete guidoblanco
            echo "▶️  Iniciando aplicación..."
            pm2 start npm --name "guidoblanco" -- start
            ;;
        4)
            echo "⏭️  Saltando configuración de PM2"
            ;;
        *)
            echo "Opción inválida, saltando..."
            ;;
    esac
else
    echo "▶️  Iniciando aplicación con PM2..."
    pm2 start npm --name "guidoblanco" -- start
    echo "✅ Aplicación iniciada"
fi

echo ""
echo "💾 Guardando configuración de PM2..."
pm2 save

echo ""
echo "🔧 Configurar auto-inicio con el sistema? (s/N)"
read -r setup_startup

if [ "$setup_startup" = "s" ] || [ "$setup_startup" = "S" ]; then
    echo "⚙️  Configurando startup..."
    pm2 startup
    echo ""
    echo "⚠️  Ejecuta el comando mostrado arriba si es necesario"
fi

# ================================================================
# PARTE 5: VERIFICACIÓN
# ================================================================
echo ""
echo "======================================"
echo "VERIFICACIÓN FINAL"
echo "======================================"
echo ""

echo "📊 Estado de PM2:"
pm2 status

echo ""
echo "📝 Últimos logs:"
pm2 logs guidoblanco --lines 20 --nostream

echo ""
echo "🔍 Verificando conexión a base de datos..."
node test-connection.js

echo ""
echo "======================================"
echo "✅ DEPLOYMENT COMPLETADO"
echo "======================================"
echo ""
echo "🌐 Tu aplicación debería estar corriendo en:"
echo "   http://162.240.174.46:3000"
echo ""
echo "🔑 Credenciales de admin:"
echo "   Email: admin@guidoblanco.com"
echo "   Password: admin123"
echo ""
echo "📊 Comandos útiles:"
echo "   pm2 status             - Ver estado"
echo "   pm2 logs guidoblanco   - Ver logs en tiempo real"
echo "   pm2 restart guidoblanco - Reiniciar app"
echo "   pm2 monit              - Monitor en tiempo real"
echo ""
echo "📚 Documentación:"
echo "   RESUMEN_REFACTORIZACION.md - Resumen completo"
echo "   INSTRUCCIONES_DATABASE.md  - Instrucciones de BD"
echo "   CAMBIOS_REALIZADOS.md      - Cambios detallados"
echo ""
echo "======================================"
