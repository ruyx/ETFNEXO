#!/bin/bash

# Script para configurar Supabase CLI con el token correcto

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   Configuración de Supabase CLI - Generación de Token${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}📋 SITUACIÓN ACTUAL:${NC}"
echo ""
echo "El token existente NO tiene acceso al proyecto: utvioubcqkwwzvufhups"
echo "Proyectos con acceso actual:"
echo "  • ejgtclbejfcfqaopcjzy (xprinta-web-dev)"
echo "  • pgkmepwodeeqfqhwyhlo (xprinta-montadores)"
echo ""
echo -e "${YELLOW}Necesitas generar un token para la cuenta con acceso a 'utvioubcqkwwzvufhups'${NC}"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📝 PASO 1: Generar Personal Access Token${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo "1. Abre en tu navegador:"
echo ""
echo -e "${GREEN}   https://supabase.com/dashboard/account/tokens${NC}"
echo ""
echo "2. Asegúrate de estar logueado con la cuenta que tiene acceso a:"
echo -e "${GREEN}   Project: utvioubcqkwwzvufhups${NC}"
echo ""
echo "3. Click en 'Generate New Token'"
echo "4. Dale un nombre (ej: 'ETF Nexo CLI')"
echo "5. Copia el token generado (formato: sbp_...)"
echo ""
read -p "Presiona ENTER cuando hayas generado el token..."

echo ""
echo -e "${YELLOW}📝 PASO 2: Ingresar Token${NC}"
echo ""
echo "Pega el token aquí (formato: sbp_...):"
read -s SUPABASE_TOKEN
echo ""

if [[ ! $SUPABASE_TOKEN =~ ^sbp_ ]]; then
    echo -e "${RED}❌ Error: El token debe comenzar con 'sbp_'${NC}"
    exit 1
fi

# Guardar token
echo "$SUPABASE_TOKEN" > ~/.supabase/access-token
chmod 600 ~/.supabase/access-token

echo -e "${GREEN}✅ Token guardado en ~/.supabase/access-token${NC}"
echo ""

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}📝 PASO 3: Verificar Acceso${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# Verificar acceso
echo "Verificando proyectos con acceso..."
export SUPABASE_ACCESS_TOKEN="$SUPABASE_TOKEN"
PROJECTS=$(curl -s -H "Authorization: Bearer $SUPABASE_TOKEN" https://api.supabase.com/v1/projects)

if echo "$PROJECTS" | grep -q "utvioubcqkwwzvufhups"; then
    echo -e "${GREEN}✅ Token tiene acceso al proyecto utvioubcqkwwzvufhups${NC}"

    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}📝 PASO 4: Vincular Proyecto${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""

    export SUPABASE_DB_PASSWORD="GX7fzQvZSMszrjpk"
    supabase link --project-ref utvioubcqkwwzvufhups

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Proyecto vinculado exitosamente${NC}"

        echo ""
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
        echo -e "${YELLOW}📝 PASO 5: Aplicar Migraciones${NC}"
        echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
        echo ""

        supabase db push

        if [ $? -eq 0 ]; then
            echo ""
            echo -e "${GREEN}✅ Migraciones aplicadas exitosamente${NC}"

            echo ""
            echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
            echo -e "${YELLOW}📝 PASO 6: Poblar Base de Datos${NC}"
            echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
            echo ""

            export NEXT_PUBLIC_SUPABASE_URL=https://utvioubcqkwwzvufhups.supabase.co
            export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dmlvdWJjcWt3d3p2dWZodXBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQ2OTg1MSwiZXhwIjoyMDk2MDQ1ODUxfQ.Pibe87tpbFzyTL5jigaOTsUQtDbAuOqYw5kYvSt3V1c

            npx tsx scripts/setup-and-populate.ts

            echo ""
            echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
            echo -e "${GREEN}   ✅ SETUP COMPLETO - SUPABASE CLI FUNCIONANDO${NC}"
            echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
            echo ""
            echo "Comandos disponibles:"
            echo "  • supabase db push          - Aplicar migraciones"
            echo "  • supabase db pull          - Obtener schema remoto"
            echo "  • supabase db diff          - Ver diferencias"
            echo "  • supabase functions deploy - Desplegar edge functions"
            echo ""
        fi
    fi
else
    echo -e "${RED}❌ El token NO tiene acceso al proyecto utvioubcqkwwzvufhups${NC}"
    echo ""
    echo "Proyectos con acceso:"
    echo "$PROJECTS" | jq -r '.[] | "  • \(.ref) (\(.name))"'
    echo ""
    echo "Verifica que estés logueado con la cuenta correcta en Supabase Dashboard"
    exit 1
fi

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
