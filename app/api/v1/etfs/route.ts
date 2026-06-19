import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

function calculateETFScore(etf: any): number | null {
  // Simple scoring algorithm based on available metrics
  if (!etf.return_1y || !etf.ter || !etf.aum_millions) return null;

  // Score components (0-10 each)
  const returnScore = Math.min(10, Math.max(0, etf.return_1y / 5)); // 50% return = 10 points
  const terScore = Math.min(10, Math.max(0, 10 - (etf.ter * 200))); // Lower TER = better
  const aumScore = Math.min(10, Math.log10(etf.aum_millions + 1)); // Log scale for AUM
  const sharpeScore = etf.sharpe_ratio ? Math.min(10, etf.sharpe_ratio * 5) : 5; // Sharpe ratio

  // Weighted average
  const score = (returnScore * 0.35 + terScore * 0.25 + aumScore * 0.2 + sharpeScore * 0.2);
  return Math.min(10, Math.max(0, score));
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Query parameters
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const minReturn = searchParams.get('min_return');
    const maxTer = searchParams.get('max_ter');
    const minAum = searchParams.get('min_aum');
    const sortBy = searchParams.get('sort') || 'return_1y';
    const order = searchParams.get('order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '10000'); // Aumentado para mostrar todos los ETFs
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let query = supabase
      .from('etfs')
      .select('*', { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`name.ilike.%${search}%,isin.ilike.%${search}%,yahoo_ticker.ilike.%${search}%`);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (minReturn) {
      query = query.gte('return_1y', parseFloat(minReturn));
    }

    if (maxTer) {
      query = query.lte('ter', parseFloat(maxTer));
    }

    if (minAum) {
      query = query.gte('aum_millions', parseFloat(minAum));
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: order === 'asc' });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Error fetching ETFs:', error);
      return NextResponse.json(
        { error: 'Failed to fetch ETFs', details: error.message },
        { status: 500 }
      );
    }

    // Transform data to include issuer_name and etfnexo_score
    const transformedData = data?.map((etf: any) => ({
      ...etf,
      issuer_name: null, // TODO: Add JOIN with managers table when relationship is configured
      etfnexo_score: calculateETFScore(etf) // Calculate score
    }));

    return NextResponse.json({
      data: transformedData,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: count ? offset + limit < count : false
      }
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
