#!/bin/bash

# ================================================================
# Script de Verificación Rápida - VPS
# ================================================================
# Ejecuta este script en el VPS para verificar que todo está OK
# Uso: bash check-vps.sh
# ================================================================

echo "======================================"
echo "🔍 VERIFICACIÓN DEL ENTORNO VPS"
echo "======================================"
echo ""

# ================================================================
# 1. Verificar Node.js
# ================================================================
echo "1️⃣ Verificando Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    echo "   ✅ Node.js instalado: $NODE_VERSION"

    if [[ "$NODE_VERSION" < "v18" ]]; then
        echo "   ⚠️  Versión antigua. Se recomienda Node.js 18+"
    fi
else
    echo "   ❌ Node.js NO instalado"
fi
echo ""

# ================================================================
# 2. Verificar npm
# ================================================================
echo "2️⃣ Verificando npm..."
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    echo "   ✅ npm instalado: $NPM_VERSION"
else
    echo "   ❌ npm NO instalado"
fi
echo ""

# ================================================================
# 3. Verificar PM2
# ================================================================
echo "3️⃣ Verificando PM2..."
if command -v pm2 &> /dev/null; then
    PM2_VERSION=$(pm2 -v)
    echo "   ✅ PM2 instalado: $PM2_VERSION"
else
    echo "   ❌ PM2 NO instalado"
    echo "   💡 Instalar con: sudo npm install -g pm2"
fi
echo ""

# ================================================================
# 4. Verificar PostgreSQL
# ================================================================
echo "4️⃣ Verificando PostgreSQL..."
if command -v psql &> /dev/null; then
    PSQL_VERSION=$(psql --version)
    echo "   ✅ PostgreSQL instalado: $PSQL_VERSION"

    # Verificar si está corriendo
    if systemctl is-active --quiet postgresql; then
        echo "   ✅ PostgreSQL está corriendo"
    else
        echo "   ⚠️  PostgreSQL NO está corriendo"
        echo "   💡 Iniciar con: sudo systemctl start postgresql"
    fi
else
    echo "   ❌ PostgreSQL NO instalado"
fi
echo ""

# ================================================================
# 5. Verificar archivos del proyecto
# ================================================================
echo "5️⃣ Verificando archivos del proyecto..."

if [ ! -f "package.json" ]; then
    echo "   ❌ package.json NO encontrado"
    echo "   💡 Asegúrate de estar en la carpeta del proyecto"
    exit 1
else
    echo "   ✅ package.json encontrado"
fi

if [ ! -f ".env.local" ] && [ ! -f ".env.production" ]; then
    echo "   ⚠️  Archivo .env no encontrado"
    echo "   💡 Crear .env.local copiando .env.production"
else
    echo "   ✅ Archivo de configuración encontrado"
fi

if [ ! -d "database/migrations" ]; then
    echo "   ⚠️  Carpeta database/migrations no encontrada"
else
    echo "   ✅ Migraciones encontradas"
fi

if [ ! -f "ecosystem.config.js" ]; then
    echo "   ⚠️  ecosystem.config.js no encontrado"
    echo "   💡 Crear este archivo para PM2"
else
    echo "   ✅ ecosystem.config.js encontrado"
fi
echo ""

# ================================================================
# 6. Verificar node_modules
# ================================================================
echo "6️⃣ Verificando dependencias..."
if [ ! -d "node_modules" ]; then
    echo "   ⚠️  node_modules NO existe"
    echo "   💡 Ejecutar: npm install"
else
    echo "   ✅ node_modules existe"
fi
echo ""

# ================================================================
# 7. Verificar build
# ================================================================
echo "7️⃣ Verificando build..."
if [ ! -d ".next" ]; then
    echo "   ⚠️  .next NO existe (proyecto no compilado)"
    echo "   💡 Ejecutar: npm run build"
else
    echo "   ✅ Build existe (.next)"
fi
echo ""

# ================================================================
# 8. Verificar conexión a base de datos
# ================================================================
echo "8️⃣ Verificando conexión a base de datos..."

if [ -f ".env.local" ]; then
    source .env.local

    DB_EXISTS=$(psql -h ${DB_HOST:-localhost} -U ${DB_USER} -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" 2>/dev/null)

    if [ "$DB_EXISTS" = "1" ]; then
        echo "   ✅ Base de datos '$DB_NAME' existe"

        # Verificar tablas
        TABLE_COUNT=$(psql -h ${DB_HOST:-localhost} -U ${DB_USER} -d ${DB_NAME} -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'" 2>/dev/null)

        if [ "$TABLE_COUNT" -ge 5 ]; then
            echo "   ✅ Tablas creadas ($TABLE_COUNT tablas)"
        else
            echo "   ⚠️  Pocas tablas encontradas ($TABLE_COUNT)"
            echo "   💡 Ejecutar migraciones si es necesario"
        fi
    else
        echo "   ❌ Base de datos '$DB_NAME' NO existe"
        echo "   💡 Crear con: sudo -u postgres psql"
    fi
else
    echo "   ⚠️  No se puede verificar (falta .env.local)"
fi
echo ""

# ================================================================
# 9. Verificar puerto 3002
# ================================================================
echo "9️⃣ Verificando puerto 3002..."

PORT_IN_USE=$(netstat -tlnp 2>/dev/null | grep :3002 || echo "")

if [ -n "$PORT_IN_USE" ]; then
    echo "   ✅ Puerto 3002 en uso (algo está corriendo)"
    echo "   $PORT_IN_USE"
else
    echo "   ⚠️  Puerto 3002 libre (nada corriendo en este puerto)"
fi
echo ""

# ================================================================
# 10. Verificar PM2 apps
# ================================================================
echo "🔟 Verificando apps en PM2..."

if command -v pm2 &> /dev/null; then
    PM2_LIST=$(pm2 list | grep guidoblanco || echo "")

    if [ -n "$PM2_LIST" ]; then
        echo "   ✅ App 'guidoblanco' encontrada en PM2"
        echo ""
        pm2 status guidoblanco
    else
        echo "   ⚠️  App 'guidoblanco' NO encontrada en PM2"
        echo "   💡 Iniciar con: pm2 start ecosystem.config.js"
    fi
else
    echo "   ⚠️  PM2 no disponible"
fi
echo ""

# ================================================================
# RESUMEN
# ================================================================
echo "======================================"
echo "📊 RESUMEN DE VERIFICACIÓN"
echo "======================================"
echo ""

ISSUES=0

# Checklist
echo "Checklist:"
command -v node &> /dev/null && echo "✅ Node.js" || { echo "❌ Node.js"; ((ISSUES++)); }
command -v npm &> /dev/null && echo "✅ npm" || { echo "❌ npm"; ((ISSUES++)); }
command -v pm2 &> /dev/null && echo "✅ PM2" || { echo "⚠️  PM2"; ((ISSUES++)); }
command -v psql &> /dev/null && echo "✅ PostgreSQL" || { echo "❌ PostgreSQL"; ((ISSUES++)); }
[ -f "package.json" ] && echo "✅ Proyecto encontrado" || { echo "❌ Proyecto"; ((ISSUES++)); }
[ -f ".env.local" ] && echo "✅ .env.local" || { echo "⚠️  .env.local"; }
[ -d "node_modules" ] && echo "✅ node_modules" || { echo "⚠️  node_modules"; }
[ -d ".next" ] && echo "✅ Build compilado" || { echo "⚠️  Sin build"; }

echo ""

if [ $ISSUES -eq 0 ]; then
    echo "✅ Todo parece estar en orden!"
    echo ""
    echo "📝 Próximos pasos sugeridos:"
    echo "   1. Ejecutar migraciones (si no se hizo)"
    echo "   2. npm install (si no hay node_modules)"
    echo "   3. npm run build (si no hay .next)"
    echo "   4. pm2 start ecosystem.config.js"
else
    echo "⚠️  Se encontraron $ISSUES problemas críticos"
    echo ""
    echo "Por favor revisa los errores arriba"
fi

echo ""
echo "======================================"
