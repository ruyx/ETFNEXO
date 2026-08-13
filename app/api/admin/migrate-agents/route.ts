/**
 * API Route para ejecutar migración de agentes AI
 * Solo para desarrollo - ejecuta la migración de la tabla ai_agents
 */

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Cliente con privilegios de service_role
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Ejecutar migración - Crear tabla ai_agents
    const { error: createTableError } = await supabase.rpc('exec_sql', {
      sql: `
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
      `
    });

    if (createTableError) {
      console.error('Error creating table:', createTableError);
    }

    // Añadir author_id a news_articles
    const { error: alterTableError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE news_articles
          ADD COLUMN IF NOT EXISTS author_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL;
      `
    });

    if (alterTableError) {
      console.error('Error altering table:', alterTableError);
    }

    // Insertar agentes
    const { data: agents, error: insertError } = await supabase
      .from('ai_agents')
      .upsert([
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
      ], { onConflict: 'slug' })
      .select();

    if (insertError) {
      throw insertError;
    }

    return NextResponse.json({
      success: true,
      message: 'Migración ejecutada exitosamente',
      agents: agents
    });

  } catch (error: any) {
    console.error('Error en migración:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message
      },
      { status: 500 }
    );
  }
}
