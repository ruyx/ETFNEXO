/**
 * Script para inicializar agentes AI en Supabase
 * Ejecutar con: node scripts/init-agents.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Cargar variables de entorno desde .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env.local');

let supabaseUrl, supabaseServiceKey;

try {
  const envFile = readFileSync(envPath, 'utf-8');
  const envLines = envFile.split('\n');

  for (const line of envLines) {
    if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
      supabaseUrl = line.split('=')[1].trim();
    }
    if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
      supabaseServiceKey = line.split('=')[1].trim();
    }
  }
} catch (error) {
  console.error('❌ Error leyendo .env.local:', error.message);
  process.exit(1);
}

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Error: Faltan variables de entorno SUPABASE');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  global: {
    headers: { 'x-skip-realtime': 'true' }
  },
  realtime: {
    enabled: false
  }
});

async function initAgents() {
  console.log('🚀 Inicializando agentes AI...\n');

  try {
    // Primero verificar si la tabla existe
    const { data: existingAgents, error: checkError } = await supabase
      .from('ai_agents')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === '42P01') {
      console.log('⚠️  La tabla ai_agents no existe.');
      console.log('\n📋 Ejecuta este SQL en el SQL Editor de Supabase Dashboard:\n');
      console.log('------------------------------------------------------------');
      console.log(migrationSQL);
      console.log('------------------------------------------------------------\n');
      console.log('Luego vuelve a ejecutar este script.\n');
      return;
    }

    // Crear o actualizar agentes
    const agents = [
      {
        name: 'SantIAgo',
        slug: 'santiago',
        display_name: 'SantIAgo',
        bio: 'Agente especializado en análisis de ETFs y mercados globales. Mi enfoque combina datos cuantitativos con análisis fundamental para identificar oportunidades de inversión.',
        expertise: ['ETFs', 'Análisis de Mercados', 'Renta Variable', 'Inversión Global'],
        role: 'analyst',
        email: 'santiago@etfnexo.com',
        signature: '— SantIAgo, Analista de ETFs en ETF Nexo',
        is_active: true,
        can_publish: true
      },
      {
        name: 'EstefanIA',
        slug: 'estefania',
        display_name: 'EstefanIA',
        bio: 'Especialista en estrategias de inversión sostenible y ESG. Me dedico a analizar el impacto de los criterios ambientales, sociales y de gobernanza en el rendimiento de los ETFs.',
        expertise: ['ESG', 'Inversión Sostenible', 'Análisis de Riesgos', 'ETFs Temáticos'],
        role: 'analyst',
        email: 'estefania@etfnexo.com',
        signature: '— EstefanIA, Especialista ESG en ETF Nexo',
        is_active: true,
        can_publish: true
      }
    ];

    console.log('📝 Creando agentes...\n');

    for (const agent of agents) {
      const { data, error } = await supabase
        .from('ai_agents')
        .upsert(agent, { onConflict: 'slug' })
        .select()
        .single();

      if (error) {
        console.error(`❌ Error creando ${agent.name}:`, error.message);
      } else {
        console.log(`✅ ${agent.name} creado/actualizado`);
        console.log(`   ID: ${data.id}`);
        console.log(`   Email: ${data.email}`);
        console.log(`   Especialidades: ${data.expertise.join(', ')}\n`);
      }
    }

    console.log('🎉 Agentes inicializados correctamente!\n');

  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

const migrationSQL = `
-- Crear tabla ai_agents
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
CREATE POLICY IF NOT EXISTS "Public read active agents" ON ai_agents
  FOR SELECT USING (is_active = true);
`;

initAgents();
