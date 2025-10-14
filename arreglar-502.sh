#!/bin/bash
echo "Diagnosticando error 502..."
echo ""
echo "1. Estado de PM2:"
pm2 status | grep guidoblanco || echo "   App NO encontrada en PM2"
echo ""
echo "2. Puerto 3002:"
sudo netstat -tlnp | grep 3002 || echo "   NADA escuchando en puerto 3002"
echo ""
echo "3. Estado de Nginx:"
sudo systemctl status nginx --no-pager | grep Active
echo ""
echo "4. Configuracion de Nginx:"
if [ -f "/etc/nginx/sites-available/guidoblanco" ]; then
    echo "   Archivo existe"
    grep "proxy_pass" /etc/nginx/sites-available/guidoblanco
else
    echo "   Archivo NO existe"
fi
echo ""
echo "5. Sitios habilitados en Nginx:"
ls -la /etc/nginx/sites-enabled/ 2>/dev/null | grep -v "^d" | grep -v "^total"
echo ""
echo "6. Ultimos errores de Nginx:"
sudo tail -10 /var/log/nginx/error.log 2>/dev/null || echo "   No hay log de errores"
echo ""
echo "7. Logs de la aplicacion:"
pm2 logs guidoblanco --lines 10 --nostream 2>/dev/null || echo "   No hay logs"
echo ""
echo "================================="
echo "POSIBLES SOLUCIONES:"
echo "================================="
echo ""
if ! pm2 status | grep -q guidoblanco; then
    echo "La app NO esta corriendo en PM2"
    echo "Solucion: cd /var/www/guidoblanco && pm2 start ecosystem.config.js"
fi
echo ""
if ! sudo netstat -tlnp | grep -q 3002; then
    echo "NADA escuchando en puerto 3002"
    echo "Solucion: pm2 restart guidoblanco"
fi
echo ""
if [ ! -f "/etc/nginx/sites-enabled/guidoblanco" ]; then
    echo "Nginx NO tiene configuracion para guidoblanco"
    echo "Solucion: Crear configuracion de Nginx"
fi
