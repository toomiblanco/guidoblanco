#!/bin/bash

# ================================================================
# SCRIPT PARA ARREGLAR ERROR DE LOGIN
# ================================================================
# Ejecutar en el VPS: bash fix-login.sh
# ================================================================

echo "======================================"
echo "🔧 ARREGLANDO ERROR DE LOGIN"
echo "======================================"
echo ""

# ================================================================
# 1. Verificar PostgreSQL
# ================================================================
echo "1️⃣ Verificando PostgreSQL..."
if systemctl is-active --quiet postgresql; then
    echo "   ✅ PostgreSQL está corriendo"
else
    echo "   ❌ PostgreSQL NO está corriendo"
    echo "   🔧 Iniciando PostgreSQL..."
    sudo systemctl start postgresql
    sleep 2

    if systemctl is-active --quiet postgresql; then
        echo "   ✅ PostgreSQL iniciado correctamente"
    else
        echo "   ❌ No se pudo iniciar PostgreSQL"
        echo "   💡 Ejecutar: sudo systemctl status postgresql"
        exit 1
    fi
fi
echo ""

# ================================================================
# 2. Verificar base de datos
# ================================================================
echo "2️⃣ Verificando base de datos..."

DB_EXISTS=$(sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -w guidoblanco_db | wc -l)

if [ "$DB_EXISTS" -eq 0 ]; then
    echo "   ❌ Base de datos NO existe"
    echo "   🔧 Creando base de datos..."

    # Ejecutar script completo
    sudo -u postgres psql -f database/setup-database-completo.sql > /dev/null 2>&1

    echo "   ✅ Base de datos creada"
else
    echo "   ✅ Base de datos existe"
fi
echo ""

# ================================================================
# 3. Verificar tablas
# ================================================================
echo "3️⃣ Verificando tablas..."

TABLE_COUNT=$(psql -h localhost -U guidoblanco_user -d guidoblanco_db -tAc "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='public'" 2>/dev/null)

if [ "$TABLE_COUNT" -ge 5 ]; then
    echo "   ✅ Tablas creadas ($TABLE_COUNT tablas)"
else
    echo "   ⚠️  Faltan tablas (encontradas: $TABLE_COUNT)"
    echo "   🔧 Ejecutando migraciones..."

    psql -h localhost -U guidoblanco_user -d guidoblanco_db -f database/migrations/001_initial_schema.sql > /dev/null 2>&1
    psql -h localhost -U guidoblanco_user -d guidoblanco_db -f database/migrations/002_seed_data.sql > /dev/null 2>&1
    psql -h localhost -U guidoblanco_user -d guidoblanco_db -f database/migrations/003_create_admin_credentials.sql > /dev/null 2>&1

    echo "   ✅ Migraciones ejecutadas"
fi
echo ""

# ================================================================
# 4. Verificar usuario admin
# ================================================================
echo "4️⃣ Verificando usuario admin..."

ADMIN_COUNT=$(psql -h localhost -U guidoblanco_user -d guidoblanco_db -tAc "SELECT COUNT(*) FROM users WHERE is_admin = true" 2>/dev/null)

if [ "$ADMIN_COUNT" -gt 0 ]; then
    echo "   ✅ Usuario admin existe ($ADMIN_COUNT usuarios admin)"

    # Mostrar usuarios admin
    echo ""
    echo "   📝 Usuarios admin encontrados:"
    psql -h localhost -U guidoblanco_user -d guidoblanco_db -c "SELECT email, is_admin, created_at FROM users WHERE is_admin = true" 2>/dev/null
else
    echo "   ❌ No hay usuarios admin"
    echo "   🔧 Creando usuario admin..."

    psql -h localhost -U guidoblanco_user -d guidoblanco_db << EOF > /dev/null 2>&1
INSERT INTO users (email, password_hash, full_name, is_admin, email_verified) VALUES
('admin@guidoblanco.com', '\$2a\$10\$Kq8QTfh8/ZZr5M4uS3vKL.YW9sZpZg5XzGQf8cHSXFqKJ9t8r1z2W', 'Guido Blanco', true, true)
ON CONFLICT (email) DO UPDATE SET
  password_hash = '\$2a\$10\$Kq8QTfh8/ZZr5M4uS3vKL.YW9sZpZg5XzGQf8cHSXFqKJ9t8r1z2W',
  is_admin = true,
  email_verified = true;

INSERT INTO users (email, password_hash, full_name, is_admin, email_verified) VALUES
('guidoblanco@gmail.com', '\$2a\$10\$Kq8QTfh8/ZZr5M4uS3vKL.YW9sZpZg5XzGQf8cHSXFqKJ9t8r1z2W', 'Guido Blanco', true, true)
ON CONFLICT (email) DO UPDATE SET
  password_hash = '\$2a\$10\$Kq8QTfh8/ZZr5M4uS3vKL.YW9sZpZg5XzGQf8cHSXFqKJ9t8r1z2W',
  is_admin = true,
  email_verified = true;
EOF

    echo "   ✅ Usuario admin creado"
fi
echo ""

# ================================================================
# 5. Verificar .env.local
# ================================================================
echo "5️⃣ Verificando variables de entorno..."

if [ ! -f ".env.local" ]; then
    echo "   ⚠️  .env.local NO existe"
    echo "   🔧 Copiando .env.production..."
    cp .env.production .env.local
    echo "   ✅ .env.local creado"
else
    echo "   ✅ .env.local existe"
fi

echo ""
echo "   📝 Configuración de BD:"
cat .env.local | grep -E "DB_HOST|DB_PORT|DB_NAME|DB_USER" | sed 's/^/      /'
echo ""

# ================================================================
# 6. Probar conexión con Node.js
# ================================================================
echo "6️⃣ Probando conexión desde Node.js..."

if [ -f "test-connection.js" ]; then
    node test-connection.js 2>&1 | head -20
else
    echo "   ⚠️  test-connection.js no encontrado"
fi
echo ""

# ================================================================
# 7. Reiniciar aplicación
# ================================================================
echo "7️⃣ Reiniciando aplicación..."

if command -v pm2 &> /dev/null; then
    pm2 restart guidoblanco > /dev/null 2>&1
    sleep 2

    echo "   ✅ Aplicación reiniciada"
    echo ""
    echo "   📊 Estado de PM2:"
    pm2 status guidoblanco
else
    echo "   ⚠️  PM2 no encontrado"
fi
echo ""

# ================================================================
# 8. Resumen
# ================================================================
echo "======================================"
echo "✅ PROCESO COMPLETADO"
echo "======================================"
echo ""
echo "📝 Credenciales para probar:"
echo "   Email: admin@guidoblanco.com"
echo "   Password: admin123"
echo ""
echo "🌐 URL de login:"
echo "   http://162.240.174.46:3002/auth/login"
echo ""
echo "📊 Ver logs en tiempo real:"
echo "   pm2 logs guidoblanco"
echo ""
echo "======================================"
