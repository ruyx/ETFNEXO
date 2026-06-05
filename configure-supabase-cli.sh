#!/bin/bash

# Script automatizado para configurar Supabase CLI
# Requisito: SUPABASE_ACCESS_TOKEN debe estar en .env.local

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   Configuración Automática de Supabase CLI${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Cargar variables de .env.local
if [ -f .env.local ]; then
    export $(grep -v '^#' .env.local | grep -v '^$' | sed 's/\r$//' | xargs)
else
    echo -e "${RED}❌ No se encontró .env.local${NC}"
    exit 1
fi

# Verificar que el token esté configurado
if [ -z "$SUPABASE_ACCESS_TOKEN" ] || [ "$SUPABASE_ACCESS_TOKEN" == "sbp_GENERA_TOKEN_AQUI" ]; then
    echo -e "${RED}❌ ERROR: SUPABASE_ACCESS_TOKEN no configurado en .env.local${NC}"
    echo ""
    echo -e "${YELLOW}📝 ACCIÓN REQUERIDA:${NC}"
    echo ""
    echo "1. Genera un Personal Access Token:"
    echo -e "${BLUE}   https://supabase.com/dashboard/account/tokens${NC}"
    echo ""
    echo "2. Edita .env.local y reemplaza:"
    echo "   #SUPABASE_ACCESS_TOKEN=sbp_GENERA_TOKEN_AQUI"
    echo "   por:"
    echo "   SUPABASE_ACCESS_TOKEN=tu_token_real"
    echo ""
    echo "3. Vuelve a ejecutar este script"
    exit 1
fi

echo -e "${GREEN}✅ Token encontrado en .env.local${NC}"
echo ""

# Guardar token en ~/.supabase/access-token
echo "$SUPABASE_ACCESS_TOKEN" > ~/.supabase/access-token
chmod 600 ~/.supabase/access-token
echo -e "${GREEN}✅ Token guardado en ~/.supabase/access-token${NC}"
echo ""

# Verificar acceso al proyecto
echo -e "${YELLOW}🔍 Verificando acceso al proyecto utvioubcqkwwzvufhups...${NC}"
PROJECTS=$(curl -s -H "Authorization: Bearer $SUPABASE_ACCESS_TOKEN" https://api.supabase.com/v1/projects)

if echo "$PROJECTS" | grep -q "utvioubcqkwwzvufhups"; then
    echo -e "${GREEN}✅ Token tiene acceso al proyecto${NC}"
    echo ""
else
    echo -e "${RED}❌ El token NO tiene acceso al proyecto utvioubcqkwwzvufhups${NC}"
    echo ""
    echo -e "${YELLOW}Proyectos con acceso:${NC}"
    echo "$PROJECTS" | jq -r '.[] | "  • \(.ref) (\(.name))"' 2>/dev/null || echo "$PROJECTS"
    echo ""
    echo "Verifica que el token sea de la cuenta correcta"
    exit 1
fi

# Vincular proyecto
echo -e "${YELLOW}🔗 Vinculando proyecto...${NC}"
supabase link --project-ref utvioubcqkwwzvufhups

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error vinculando proyecto${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Proyecto vinculado${NC}"
echo ""

# Aplicar migraciones
echo -e "${YELLOW}📝 Aplicando migraciones...${NC}"
supabase db push

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error aplicando migraciones${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Migraciones aplicadas${NC}"
echo ""

# Poblar base de datos
echo -e "${YELLOW}📊 Poblando base de datos con ETFs...${NC}"
npx tsx scripts/setup-and-populate.ts

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}   ✅ SETUP COMPLETO - SUPABASE CLI FUNCIONANDO${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}Comandos de Supabase CLI disponibles:${NC}"
    echo ""
    echo "  supabase db push           - Aplicar migraciones"
    echo "  supabase db pull           - Obtener schema remoto"
    echo "  supabase db diff           - Ver diferencias"
    echo "  supabase db reset          - Resetear base de datos local"
    echo "  supabase functions deploy  - Desplegar edge functions"
    echo "  supabase gen types         - Generar tipos TypeScript"
    echo ""
else
    echo -e "${YELLOW}⚠️  Hubo problemas poblando la base de datos${NC}"
    echo "Pero Supabase CLI está configurado correctamente"
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
