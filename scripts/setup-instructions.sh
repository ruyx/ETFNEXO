#!/bin/bash

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ETF Nexo - Setup de Base de Datos${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
echo ""

echo -e "${YELLOW}📋 PASO 1: Abrir Supabase SQL Editor${NC}"
echo ""
echo "   Abre este URL en tu navegador:"
echo ""
echo -e "${GREEN}   https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql/new${NC}"
echo ""
read -p "   Presiona ENTER cuando hayas abierto el SQL Editor..."

echo ""
echo -e "${YELLOW}📄 PASO 2: Copiar SQL${NC}"
echo ""
echo "   El contenido está en:"
echo ""
echo -e "${GREEN}   supabase/setup-complete.sql${NC}"
echo ""
echo "   Puedes copiar el archivo con:"
echo ""
echo -e "${BLUE}   cat supabase/setup-complete.sql | xclip -selection clipboard${NC}"
echo "   (o simplemente abrirlo y copiar manualmente)"
echo ""
read -p "   Presiona ENTER cuando hayas copiado el SQL..."

echo ""
echo -e "${YELLOW}✅ PASO 3: Ejecutar en Supabase${NC}"
echo ""
echo "   1. Pega el SQL en el editor"
echo "   2. Haz clic en el botón 'Run' (o Ctrl+Enter)"
echo "   3. Deberías ver: \"ETF Nexo database setup completed successfully!\""
echo ""
read -p "   Presiona ENTER cuando hayas ejecutado el SQL..."

echo ""
echo -e "${GREEN}✅ Setup SQL completado!${NC}"
echo ""
echo -e "${YELLOW}📊 PASO 4: Poblar con ETFs${NC}"
echo ""
echo "   Ahora ejecuta el script de población:"
echo ""
echo -e "${BLUE}   NEXT_PUBLIC_SUPABASE_URL=https://utvioubcqkwwzvufhups.supabase.co \\${NC}"
echo -e "${BLUE}   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dmlvdWJjcWt3d3p2dWZodXBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQ2OTg1MSwiZXhwIjoyMDk2MDQ1ODUxfQ.Pibe87tpbFzyTL5jigaOTsUQtDbAuOqYw5kYvSt3V1c \\${NC}"
echo -e "${BLUE}   npx tsx scripts/setup-and-populate.ts${NC}"
echo ""

echo -e "${GREEN}═══════════════════════════════════════════════════════════${NC}"
echo ""
