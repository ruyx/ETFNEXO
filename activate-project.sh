#!/bin/bash
# ============================================
# ETF Nexo - Project Context Activation Script
# ============================================
# Este script activa el contexto de este proyecto
# aislándolo de otros proyectos en desarrollo

echo "🚀 Activando contexto ETF Nexo..."

# 1. Configurar variables de entorno del proyecto
export PROJECT_NAME="etfnexo"
export PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export SUPABASE_PROJECT_ID="utvioubcqkwwzvufhups"

# 2. Cargar variables de entorno del proyecto
if [ -f "$PROJECT_ROOT/.env.local" ]; then
    set -a
    source "$PROJECT_ROOT/.env.local"
    set +a
    echo "✓ Variables de entorno cargadas desde .env.local"
else
    echo "⚠️  .env.local no encontrado"
fi

# 3. Configurar Git local (override de configuración global)
cd "$PROJECT_ROOT"
git config user.name "ETF Nexo"
git config user.email "dev@etfnexo.com"
git config core.sshCommand "ssh -i ~/.ssh/id_ed25519_github"
echo "✓ Git configurado para ETF Nexo"

# 4. Aliases específicos del proyecto
alias supabase-etf='cd "$PROJECT_ROOT" && supabase --workdir "$PROJECT_ROOT"'
alias vercel-etf='cd "$PROJECT_ROOT" && vercel'
alias dev-etf='cd "$PROJECT_ROOT" && pnpm dev'
alias build-etf='cd "$PROJECT_ROOT" && pnpm build'
alias deploy-etf='cd "$PROJECT_ROOT" && vercel --prod'

echo "✓ Aliases creados: supabase-etf, vercel-etf, dev-etf, build-etf, deploy-etf"

# 5. Mostrar información del proyecto
echo ""
echo "📊 Proyecto ETF Nexo activado"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Directorio:  $PROJECT_ROOT"
echo "  Supabase ID: $SUPABASE_PROJECT_ID"
echo "  GitHub:      https://github.com/ruyx/ETFNEXO"
echo "  Producción:  https://etfnexo.vercel.app"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Comandos disponibles:"
echo "   dev-etf      → Iniciar servidor de desarrollo"
echo "   build-etf    → Build de producción"
echo "   deploy-etf   → Deploy a producción"
echo "   supabase-etf → Comandos Supabase"
echo "   vercel-etf   → Comandos Vercel"
echo ""
echo "Para desactivar: cd a otro directorio o ejecuta 'deactivate-etf'"

# 6. Función de desactivación
deactivate-etf() {
    unset PROJECT_NAME
    unset PROJECT_ROOT
    unset SUPABASE_PROJECT_ID
    unalias supabase-etf 2>/dev/null
    unalias vercel-etf 2>/dev/null
    unalias dev-etf 2>/dev/null
    unalias build-etf 2>/dev/null
    unalias deploy-etf 2>/dev/null
    echo "✓ Contexto ETF Nexo desactivado"
}

# Cambiar al directorio del proyecto
cd "$PROJECT_ROOT"
