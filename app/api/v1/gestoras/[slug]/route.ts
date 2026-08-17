import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Fetch fund manager by slug
    const { data: manager, error: managerError } = await supabase
      .from('fund_managers')
      .select('*')
      .eq('slug' as any, slug as any)
      .single();

    if (managerError) {
      if (managerError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Gestora no encontrada' },
          { status: 404 }
        );
      }

      console.error('Error fetching fund manager:', managerError);
      return NextResponse.json(
        { error: 'Error al cargar gestora' },
        { status: 500 }
      );
    }

    if (!manager) {
      return NextResponse.json(
        { error: 'Gestora no encontrada' },
        { status: 404 }
      );
    }

    // Fetch all ETFs managed by this fund manager
    const { data: etfs, error: etfsError } = await supabase
      .from('etfs')
      .select('*')
      .eq('manager_id' as any, manager.id as any)
      .eq('is_active' as any, true as any)
      .order('aum_millions', { ascending: false });

    if (etfsError) {
      console.error('Error fetching ETFs:', etfsError);
      return NextResponse.json(
        { error: 'Error al cargar ETFs' },
        { status: 500 }
      );
    }

    // Calculate stats
    const etfCount = etfs?.length || 0;
    const totalAum = etfs?.reduce((sum, etf) => sum + (etf.aum_millions || 0), 0) || 0;
    const avgTer = etfs && etfs.length > 0
      ? etfs.reduce((sum, etf) => sum + (etf.ter || 0), 0) / etfs.filter(e => e.ter !== null).length
      : null;
    const avgReturn1y = etfs && etfs.length > 0
      ? etfs.reduce((sum, etf) => sum + (etf.return_1y || 0), 0) / etfs.filter(e => e.return_1y !== null).length
      : null;

    return NextResponse.json({
      manager,
      etfs: etfs || [],
      stats: {
        etf_count: etfCount,
        total_aum_millions: totalAum,
        avg_ter: avgTer,
        avg_return_1y: avgReturn1y,
      }
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor', details: error.message },
      { status: 500 }
    );
  }
}
