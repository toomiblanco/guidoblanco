#!/bin/bash
echo "Arreglando login..."
echo ""
echo "1. Verificando PostgreSQL..."
sudo systemctl start postgresql
sleep 2
echo "OK"
echo ""
echo "2. Recreando base de datos..."
sudo -u postgres psql -f database/setup-database-completo.sql
echo ""
echo "3. Configurando variables..."
cp .env.production .env.local
echo "OK"
echo ""
echo "4. Verificando usuario admin..."
psql -h localhost -U guidoblanco_user -d guidoblanco_db -c "SELECT email, is_admin FROM users WHERE is_admin = true;"
echo ""
echo "5. Reiniciando aplicacion..."
pm2 restart guidoblanco
echo ""
echo "Listo! Prueba login ahora:"
echo "http://162.240.174.46:3002/auth/login"
echo "Email: admin@guidoblanco.com"
echo "Password: admin123"
