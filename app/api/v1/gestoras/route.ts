import { NextResponse } from 'next/server';
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

export async function GET() {
  try {

    // Fetch all fund managers with ETF count
    const { data: fundManagers, error: managersError } = await supabase
      .from('fund_managers')
      .select(`
        id,
        name,
        slug,
        description,
        logo_url,
        website_url,
        created_at
      `)
      .order('name', { ascending: true });

    if (managersError) {
      console.error('Error fetching fund managers:', managersError);
      return NextResponse.json(
        { error: 'Error al cargar gestoras' },
        { status: 500 }
      );
    }

    // For each fund manager, count ETFs and get total AUM
    const managersWithStats = await Promise.all(
      (fundManagers || []).map(async (manager) => {
        const { data: etfs, error: etfsError } = await supabase
          .from('etfs')
          .select('aum_millions')
          .eq('manager_id' as any, manager.id as any)
          .eq('is_active' as any, true as any);

        if (etfsError) {
          console.error(`Error fetching ETFs for manager ${manager.id}:`, etfsError);
          return {
            ...manager,
            etf_count: 0,
            total_aum_millions: null,
          };
        }

        const etfCount = etfs?.length || 0;
        const totalAum = etfs?.reduce((sum, etf) => {
          return sum + (etf.aum_millions || 0);
        }, 0) || null;

        return {
          ...manager,
          etf_count: etfCount,
          total_aum_millions: totalAum,
        };
      })
    );

    return NextResponse.json({
      data: managersWithStats,
      count: managersWithStats.length,
    });
  } catch (error) {
    console.error('Unexpected error in /api/v1/gestoras:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
