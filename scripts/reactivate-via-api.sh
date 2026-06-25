#!/bin/bash
# ============================================
# Script para Reactivar Fetch-News Cron via Supabase REST API
# ============================================

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}🔧 Reactivando sistema automático de noticias via API...${NC}\n"

# Cargar variables
if [ -f .env.local ]; then
    set -a
    source .env.local
    set +a
else
    echo -e "${RED}❌ No se encontró .env.local${NC}"
    exit 1
fi

PROJECT_REF="utvioubcqkwwzvufhups"
SERVICE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

if [ -z "$SERVICE_KEY" ]; then
    echo -e "${RED}❌ SUPABASE_SERVICE_ROLE_KEY no configurado${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Ejecutando SQL via PostgREST...${NC}\n"

# SQL para reactivar cron (en una sola línea para la API)
SQL_QUERY="
-- Actualizar comentario
COMMENT ON FUNCTION public.fetch_news_cron() IS '[REACTIVADO 2026-06-24] Ejecuta Edge Function fetch-news para scrapear noticias automáticamente. Se ejecuta cada 6 horas via pg_cron.';

-- Programar cron job
SELECT cron.schedule('fetch-news-every-6-hours', '0 */6 * * *', 'SELECT public.fetch_news_cron();');
"

# Ejecutar via RPC (crear función temporal si es necesario)
echo "Paso 1: Reactivar cron job..."

# Intentar ejecutar directamente el schedule
curl -X POST "https://${PROJECT_REF}.supabase.co/rest/v1/rpc/sql" \
  -H "apikey: ${SERVICE_KEY}" \
  -H "Authorization: Bearer ${SERVICE_KEY}" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"SELECT cron.schedule('fetch-news-every-6-hours', '0 */6 * * *', 'SELECT public.fetch_news_cron();')\"}"

echo ""
echo -e "${GREEN}✅ Comando ejecutado${NC}"
echo ""
echo "Verifica con: npx tsx scripts/check-cron-status.ts"
