#!/bin/bash

# Script para migrar la base de datos PostgreSQL
# Este script debe ejecutarse en tu VPS con PostgreSQL ya instalado

echo "🚀 Iniciando migración de base de datos PostgreSQL..."

# Variables de configuración
DB_NAME="guidoblanco_db"
DB_USER="guidoblanco_user"
DB_PASSWORD="GuidoBlanco2024!"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Directorio del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

log_info "PostgreSQL ya debe estar configurado con base de datos $DB_NAME"

# Ejecutar migraciones en orden
log_info "Ejecutando migraciones..."

# Lista de archivos a ejecutar en orden
migrations=(
    "$SCRIPT_DIR/001_create_tables.sql"
    "$SCRIPT_DIR/008_featured_article_functions.sql"
    "$SCRIPT_DIR/002_seed_data.sql"
)

# Ejecutar cada migración
for migration_file in "${migrations[@]}"; do
    if [ -f "$migration_file" ]; then
        filename=$(basename "$migration_file")
        log_info "Ejecutando migración: $filename"
        
        if PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -f "$migration_file"; then
            log_info "✓ $filename ejecutada correctamente"
        else
            log_error "✗ Error ejecutando $filename"
            exit 1
        fi
    else
        log_warning "Archivo no encontrado: $migration_file"
    fi
done

# Verificar conexión final
log_info "Verificando conexión a la base de datos..."
if PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -c "SELECT COUNT(*) as tables FROM information_schema.tables WHERE table_schema = 'public';" > /dev/null 2>&1; then
    log_info "✓ Conexión exitosa a la base de datos"
    
    # Mostrar resumen de tablas creadas
    echo ""
    log_info "📋 Tablas creadas:"
    PGPASSWORD=$DB_PASSWORD psql -h localhost -U $DB_USER -d $DB_NAME -c "\dt"
    
else
    log_error "✗ No se pudo conectar a la base de datos"
    exit 1
fi

log_info "🎉 Migración completada exitosamente!"
echo ""
echo "Base de datos lista para usar con:"
echo "  DATABASE_URL=\"postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME\""