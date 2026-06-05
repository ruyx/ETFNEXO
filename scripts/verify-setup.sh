#!/bin/bash

# ETF Nexo - Setup Verification Script
# Verifies all components are properly configured

echo "🔍 ETF Nexo - Setup Verification"
echo "================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check Node.js
echo "📦 Checking Dependencies..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    check_pass "Node.js $NODE_VERSION"
else
    check_fail "Node.js not found"
fi

# Check pnpm
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm --version)
    check_pass "pnpm $PNPM_VERSION"
else
    check_fail "pnpm not found"
fi

# Check node_modules
if [ -d "node_modules" ]; then
    PKG_COUNT=$(ls node_modules | wc -l)
    check_pass "node_modules ($PKG_COUNT packages)"
else
    check_fail "node_modules not found - run 'pnpm install'"
fi

echo ""
echo "📁 Checking Project Structure..."

# Check critical files
FILES=(
    "package.json"
    "next.config.mjs"
    "tailwind.config.ts"
    "tsconfig.json"
    ".env.local"
    "app/page.tsx"
    "app/layout.tsx"
    "app/globals.css"
    "lib/supabase/client.ts"
    "lib/supabase/server.ts"
    "types/database.types.ts"
    "supabase/config.toml"
    "supabase/migrations/20260603000001_create_initial_schema.sql"
    "design-system/MASTER.md"
    "README.md"
    "SETUP.md"
)

for FILE in "${FILES[@]}"; do
    if [ -f "$FILE" ]; then
        check_pass "$FILE"
    else
        check_fail "$FILE not found"
    fi
done

echo ""
echo "🔑 Checking Environment Variables..."

if [ -f ".env.local" ]; then
    if grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        check_pass "NEXT_PUBLIC_SUPABASE_URL"
    else
        check_fail "NEXT_PUBLIC_SUPABASE_URL not found"
    fi
    
    if grep -q "NEXT_PUBLIC_SUPABASE_ANON_KEY" .env.local; then
        check_pass "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    else
        check_fail "NEXT_PUBLIC_SUPABASE_ANON_KEY not found"
    fi
    
    if grep -q "SUPABASE_SERVICE_ROLE_KEY" .env.local; then
        check_pass "SUPABASE_SERVICE_ROLE_KEY"
    else
        check_fail "SUPABASE_SERVICE_ROLE_KEY not found"
    fi
    
    if grep -q "DATABASE_PASSWORD" .env.local; then
        check_pass "DATABASE_PASSWORD"
    else
        check_fail "DATABASE_PASSWORD not found"
    fi
else
    check_fail ".env.local not found"
fi

echo ""
echo "🎨 Checking Design System..."

if [ -f "design-system/MASTER.md" ]; then
    if grep -q "#235D87" design-system/MASTER.md; then
        check_pass "Primary Blue (#235D87)"
    fi
    if grep -q "#5DABB8" design-system/MASTER.md; then
        check_pass "Primary Teal (#5DABB8)"
    fi
    if grep -q "#F95602" design-system/MASTER.md; then
        check_pass "Primary Orange (#F95602)"
    fi
    if grep -q "Archivo" design-system/MASTER.md; then
        check_pass "Archivo font"
    fi
fi

echo ""
echo "🗄️  Checking Database Migration..."

if [ -f "supabase/migrations/20260603000001_create_initial_schema.sql" ]; then
    TABLES=("fund_managers" "etfs" "etf_price_history" "weekly_rankings" "newsletter_subscribers" "affiliate_clicks")
    for TABLE in "${TABLES[@]}"; do
        if grep -q "CREATE TABLE.*$TABLE" supabase/migrations/20260603000001_create_initial_schema.sql; then
            check_pass "$TABLE table"
        else
            check_fail "$TABLE table not found in migration"
        fi
    done
fi

echo ""
echo "🛠️  Advanced Tools..."
check_warn "Claude-Mem: Manual start required (npx claude-mem start)"
check_warn "Database migration: Network required (./scripts/setup-database.sh)"

echo ""
echo "================================="
echo "✅ Setup verification complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Start dev server: pnpm dev"
echo "   2. Apply database migration: ./scripts/setup-database.sh"
echo "   3. Start Claude-Mem: npx claude-mem start"
echo ""
echo "📚 Documentation:"
echo "   - Setup Guide: SETUP.md"
echo "   - Design System: design-system/MASTER.md"
echo "   - README: README.md"
echo ""
