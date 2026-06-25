#!/bin/bash
# ============================================
# Script para Reactivar Fetch-News Cron via psql
# ============================================

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔧 Reactivando sistema automático de noticias...${NC}\n"

# Verificar que psql esté instalado
if ! command -v psql &> /dev/null; then
    echo -e "${RED}❌ psql no está instalado${NC}"
    echo "Instala PostgreSQL client:"
    echo "  sudo apt-get update"
    echo "  sudo apt-get install postgresql-client"
    exit 1
fi

# Cargar variables de entorno
if [ -f .env.local ]; then
    set -a
    source .env.local
    set +a
else
    echo -e "${RED}❌ No se encontró .env.local${NC}"
    exit 1
fi

# Configuración de conexión
DB_HOST="db.utvioubcqkwwzvufhups.supabase.co"
DB_PORT="5432"
DB_NAME="postgres"
DB_USER="postgres"

# Verificar que tengamos el password
if [ -z "$SUPABASE_DB_PASSWORD" ]; then
    echo -e "${RED}❌ SUPABASE_DB_PASSWORD no está configurado en .env.local${NC}"
    echo "Obtén el password de: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/settings/database"
    exit 1
fi

export PGPASSWORD="$SUPABASE_DB_PASSWORD"

echo -e "${GREEN}✅ Conectando a Supabase...${NC}"
echo "   Host: $DB_HOST"
echo "   Database: $DB_NAME"
echo ""

# Ejecutar SQL para reactivar cron
psql \
  -h "$DB_HOST" \
  -p "$DB_PORT" \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  -f scripts/reactivate-fetch-news-cron.sql

echo ""
echo -e "${GREEN}✅ Script ejecutado exitosamente${NC}"
echo ""
echo "📋 Próximos pasos:"
echo "   1. Verificar cron jobs: npx tsx scripts/check-cron-status.ts"
echo "   2. Esperar 6 horas para primera ejecución (00:00, 06:00, 12:00, 18:00 UTC)"
echo "   3. Verificar noticias: npx tsx scripts/check-news.ts"
