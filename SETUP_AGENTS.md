# Setup Agentes AI - SantIAgo y EstefanIA

## Paso 1: Ejecutar SQL en Supabase Dashboard

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Click en "SQL Editor" en el menú lateral
3. Click en "New Query"
4. Copia y pega el siguiente SQL:

```sql
-- ============================================
-- Crear tabla ai_agents
-- ============================================
CREATE TABLE IF NOT EXISTS ai_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  bio TEXT,
  expertise TEXT[],
  avatar_url TEXT,
  role TEXT DEFAULT 'analyst' CHECK (role IN ('analyst', 'editor', 'researcher')),
  email TEXT,
  social_links JSONB,
  is_active BOOLEAN DEFAULT true,
  can_publish BOOLEAN DEFAULT true,
  signature TEXT,
  articles_count INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_agents_slug ON ai_agents(slug);
CREATE INDEX IF NOT EXISTS idx_agents_active ON ai_agents(is_active) WHERE is_active = true;

-- Añadir author_id a news_articles
ALTER TABLE news_articles
  ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL;

-- Índice
CREATE INDEX IF NOT EXISTS idx_articles_author ON news_articles(author_id);

-- RLS
ALTER TABLE ai_agents ENABLE ROW LEVEL SECURITY;

-- Política: Lectura pública para agentes activos
CREATE POLICY IF NOT EXISTS "Public read active agents" ON ai_agents
  FOR SELECT USING (is_active = true);

-- ============================================
-- Insertar agentes: SantIAgo y EstefanIA
-- ============================================
INSERT INTO ai_agents (
  name,
  slug,
  display_name,
  bio,
  expertise,
  role,
  email,
  signature,
  is_active,
  can_publish
) VALUES
  (
    'SantIAgo',
    'santiago',
    'SantIAgo',
    'Agente especializado en análisis de ETFs y mercados globales. Mi enfoque combina datos cuantitativos con análisis fundamental para identificar oportunidades de inversión.',
    ARRAY['ETFs', 'Análisis de Mercados', 'Renta Variable', 'Inversión Global'],
    'analyst',
    'santiago@etfnexo.com',
    '— SantIAgo, Analista de ETFs en ETF Nexo',
    true,
    true
  ),
  (
    'EstefanIA',
    'estefania',
    'EstefanIA',
    'Especialista en estrategias de inversión sostenible y ESG. Me dedico a analizar el impacto de los criterios ambientales, sociales y de gobernanza en el rendimiento de los ETFs.',
    ARRAY['ESG', 'Inversión Sostenible', 'Análisis de Riesgos', 'ETFs Temáticos'],
    'analyst',
    'estefania@etfnexo.com',
    '— EstefanIA, Especialista ESG en ETF Nexo',
    true,
    true
  )
ON CONFLICT (slug) DO NOTHING;
```

5. Click en "Run" para ejecutar el SQL
6. Deberías ver el mensaje "Success. No rows returned"

## Paso 2: Verificar que los agentes fueron creados

Ejecuta este SQL para verificar:

```sql
SELECT name, email, expertise, created_at
FROM ai_agents
ORDER BY created_at;
```

Deberías ver:
- SantIAgo (santiago@etfnexo.com)
- EstefanIA (estefania@etfnexo.com)

## Paso 3: Probar la API

Una vez creados los agentes, prueba la API:

```bash
# Listar agentes
curl http://localhost:5000/api/admin/agentes
```

Deberías recibir un JSON con los 2 agentes creados.

## Estructura de los agentes

### SantIAgo
- **Especialidad**: Análisis de ETFs y mercados globales
- **Experticia**: ETFs, Análisis de Mercados, Renta Variable, Inversión Global
- **Rol**: Analyst
- **Email**: santiago@etfnexo.com

### EstefanIA
- **Especialidad**: Inversión sostenible y ESG
- **Experticia**: ESG, Inversión Sostenible, Análisis de Riesgos, ETFs Temáticos
- **Rol**: Analyst
- **Email**: estefania@etfnexo.com

## Próximos pasos

Una vez los agentes estén creados:

1. ✅ Tabla `ai_agents` creada
2. ✅ Perfiles de SantIAgo y EstefanIA creados
3. ⏳ Actualizar formulario de artículos para seleccionar agente
4. ⏳ Mostrar información del agente en las noticias publicadas
5. ⏳ Crear página de perfil de agente (/agentes/santiago, /agentes/estefania)
