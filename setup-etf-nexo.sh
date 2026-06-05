#!/bin/bash

# ETF Nexo - Script de Setup Automatizado
# Configura Supabase CLI y prepara la base de datos

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}         ETF Nexo - Setup Automatizado${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

# 1. Verificar Supabase CLI
echo -e "${YELLOW}1. Verificando Supabase CLI...${NC}"
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}   ❌ Supabase CLI no está instalado${NC}"
    echo -e "${YELLOW}   Instalando...${NC}"
    curl -fsSL https://supabase.com/install.sh | sh
fi

SUPABASE_VERSION=$(supabase --version | head -1)
echo -e "${GREEN}   ✅ $SUPABASE_VERSION${NC}"
echo ""

# 2. Configurar archivo project-ref
echo -e "${YELLOW}2. Configurando referencia del proyecto...${NC}"
mkdir -p supabase/.temp
echo "utvioubcqkwwzvufhups" > supabase/.temp/project-ref
echo -e "${GREEN}   ✅ Project ref configurado${NC}"
echo ""

# 3. Verificar conectividad
echo -e "${YELLOW}3. Verificando conectividad con Supabase...${NC}"
if curl -s --max-time 5 https://utvioubcqkwwzvufhups.supabase.co/rest/v1/ > /dev/null; then
    echo -e "${GREEN}   ✅ API REST accesible${NC}"
else
    echo -e "${RED}   ❌ No se puede conectar a la API${NC}"
    exit 1
fi
echo ""

# 4. Intentar conexión a PostgreSQL
echo -e "${YELLOW}4. Verificando conexión directa a PostgreSQL...${NC}"
export PGPASSWORD="GX7fzQvZSMszrjpk"
if timeout 3 psql -h db.utvioubcqkwwzvufhups.supabase.co -U postgres -d postgres -c "SELECT 1" &> /dev/null; then
    echo -e "${GREEN}   ✅ PostgreSQL accesible directamente${NC}"
    POSTGRES_DIRECT=true
else
    echo -e "${YELLOW}   ⚠️  PostgreSQL no accesible directamente (IPv6 bloqueado)${NC}"
    echo -e "${YELLOW}   Usaremos Dashboard para ejecutar SQL${NC}"
    POSTGRES_DIRECT=false
fi
echo ""

# 5. Verificar tablas existentes
echo -e "${YELLOW}5. Verificando estado de la base de datos...${NC}"
export NEXT_PUBLIC_SUPABASE_URL=https://utvioubcqkwwzvufhups.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dmlvdWJjcWt3d3p2dWZodXBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQ2OTg1MSwiZXhwIjoyMDk2MDQ1ODUxfQ.Pibe87tpbFzyTL5jigaOTsUQtDbAuOqYw5kYvSt3V1c

npx tsx scripts/create-tables-programmatically.ts &> /tmp/check-tables.log
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Tablas ya existen en Supabase${NC}"
    TABLES_EXIST=true
else
    echo -e "${YELLOW}   ⚠️  Tablas no existen${NC}"
    TABLES_EXIST=false
fi
echo ""

# 6. Instrucciones según estado
if [ "$TABLES_EXIST" = false ]; then
    echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}   ACCIÓN MANUAL REQUERIDA${NC}"
    echo -e "${RED}═══════════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${YELLOW}Las tablas no existen. Necesitas ejecutar SQL en Dashboard:${NC}"
    echo ""
    echo "PASO 1: Copiar SQL"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    if command -v xclip &> /dev/null; then
        cat supabase/setup-complete.sql | xclip -selection clipboard
        echo -e "${GREEN}   ✅ SQL copiado al portapapeles automáticamente${NC}"
    else
        echo -e "${YELLOW}   Ejecuta: cat supabase/setup-complete.sql | xclip -selection clipboard${NC}"
        echo -e "${YELLOW}   O copia manualmente desde: supabase/setup-complete.sql${NC}"
    fi

    echo ""
    echo "PASO 2: Abrir Dashboard y ejecutar"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo -e "${BLUE}https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql/new${NC}"
    echo ""
    echo "   1. Pega el SQL"
    echo "   2. Click 'Run' (Ctrl+Enter)"
    echo "   3. Verifica mensaje: 'ETF Nexo database setup completed successfully!'"
    echo ""
    echo "PASO 3: Poblar datos"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "   Después ejecuta:"
    echo ""
    echo -e "${GREEN}   ./populate-etfs.sh${NC}"
    echo ""
else
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}   Base de datos lista - Poblando con ETFs${NC}"
    echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
    echo ""

    npx tsx scripts/setup-and-populate.ts

    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ Setup completado exitosamente${NC}"
        echo ""
        echo "📊 Próximos pasos:"
        echo "   1. Verificar datos en Dashboard"
        echo "   2. Desarrollar algoritmo de ETFNexo Score"
        echo "   3. Implementar API endpoints"
        echo ""
    fi
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
