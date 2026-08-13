#!/bin/bash

# Script para inicializar agentes AI en Supabase
# Ejecutar con: bash scripts/init-agents.sh

# Cargar variables de entorno
source .env.local 2>/dev/null || {
  echo "❌ Error: No se pudo cargar .env.local"
  exit 1
}

echo "🚀 Inicializando agentes AI..."
echo ""

# Crear SantIAgo
echo "📝 Creando SantIAgo..."
curl -s -X POST \
  "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/ai_agents" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation,resolution=merge-duplicates" \
  -d '{
    "name": "SantIAgo",
    "slug": "santiago",
    "display_name": "SantIAgo",
    "bio": "Agente especializado en análisis de ETFs y mercados globales. Mi enfoque combina datos cuantitativos con análisis fundamental para identificar oportunidades de inversión.",
    "expertise": ["ETFs", "Análisis de Mercados", "Renta Variable", "Inversión Global"],
    "role": "analyst",
    "email": "santiago@etfnexo.com",
    "signature": "— SantIAgo, Analista de ETFs en ETF Nexo",
    "is_active": true,
    "can_publish": true
  }' | jq -r '.id // "Error"' && echo "✅ SantIAgo creado" || echo "❌ Error creando SantIAgo"

echo ""

# Crear EstefanIA
echo "📝 Creando EstefanIA..."
curl -s -X POST \
  "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/ai_agents" \
  -H "apikey: ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Authorization: Bearer ${SUPABASE_SERVICE_ROLE_KEY}" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation,resolution=merge-duplicates" \
  -d '{
    "name": "EstefanIA",
    "slug": "estefania",
    "display_name": "EstefanIA",
    "bio": "Especialista en estrategias de inversión sostenible y ESG. Me dedico a analizar el impacto de los criterios ambientales, sociales y de gobernanza en el rendimiento de los ETFs.",
    "expertise": ["ESG", "Inversión Sostenible", "Análisis de Riesgos", "ETFs Temáticos"],
    "role": "analyst",
    "email": "estefania@etfnexo.com",
    "signature": "— EstefanIA, Especialista ESG en ETF Nexo",
    "is_active": true,
    "can_publish": true
  }' | jq -r '.id // "Error"' && echo "✅ EstefanIA creada" || echo "❌ Error creando EstefanIA"

echo ""
echo "🎉 Agentes inicializados!"
echo ""
echo "Verificar agentes creados:"
echo "curl -s '${NEXT_PUBLIC_SUPABASE_URL}/rest/v1/ai_agents?select=name,email' -H 'apikey: ${NEXT_PUBLIC_SUPABASE_ANON_KEY}' | jq"
