#!/bin/bash

# Script para debugging en VPS
OUTPUT_FILE="debug-output.txt"

{
echo "==================================="
echo "DEBUGGING BLOG GUIDO BLANCO"
echo "Fecha: $(date)"
echo "==================================="

echo "1. Verificando estado de la aplicación..."
pm2 status

echo -e "\n2. Verificando logs recientes..."
pm2 logs guidoblanco --lines 20

echo -e "\n3. Verificando conexión a base de datos..."
psql -h localhost -U guidoblanco_user -d guidoblanco_db -c "SELECT COUNT(*) as total_articles FROM articles;"

echo -e "\n4. Verificando permisos en directorio de uploads..."
ls -la /var/www/guidoblanco/public/uploads/ 2>/dev/null || echo "Directorio uploads no existe"

echo -e "\n5. Verificando variables de entorno..."
cd /var/www/guidoblanco
grep -E "DB_|NEXTAUTH_" .env.local

echo -e "\n6. Probando API de salud..."
curl -s http://localhost:3002/api/health 2>/dev/null || echo "API no responde"

echo -e "\n7. Verificando puerto 3002..."
netstat -tlnp | grep 3002

echo -e "\n8. Verificando estructura de tabla articles..."
psql -h localhost -U guidoblanco_user -d guidoblanco_db -c "\d articles"

echo -e "\n9. Verificando usuario admin..."
psql -h localhost -U guidoblanco_user -d guidoblanco_db -c "SELECT id, email, is_admin FROM users WHERE is_admin = true;"

echo -e "\n==================================="
echo "DEBUGGING COMPLETADO"
echo "Archivo guardado en: $OUTPUT_FILE"
echo "==================================="

} | tee "$OUTPUT_FILE"

echo "Para descargar este archivo a tu máquina local, usa:"
echo "scp usuario@162.240.174.46:/var/www/guidoblanco/$OUTPUT_FILE ./"