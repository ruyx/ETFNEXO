import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { Database } from '@/types/database.types';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient<Database>(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Score calculation functions (same as rankings endpoint)
function normalizeScore(value: number, min: number, max: number): number {
  if (max === min) return 50;
  return ((value - min) / (max - min)) * 100;
}

function calculatePerformanceScore(
  etf: any,
  minReturn: number,
  maxReturn: number,
  minSharpe: number,
  maxSharpe: number
): number {
  const return1y = etf.return_1y || 0;
  const sharpeRatio = etf.sharpe_ratio || 0;

  const returnScore = normalizeScore(return1y, minReturn, maxReturn);
  const sharpeScore = normalizeScore(sharpeRatio, minSharpe, maxSharpe);

  return returnScore * 0.6 + sharpeScore * 0.4;
}

function calculateCostScore(etf: any, minTer: number, maxTer: number): number {
  const ter = etf.ter || 0;
  const terScore = normalizeScore(ter, minTer, maxTer);
  return 100 - terScore;
}

function calculateLiquidityScore(
  etf: any,
  minAum: number,
  maxAum: number,
  minSpread: number,
  maxSpread: number
): number {
  const aum = etf.aum_millions || 0;
  const spread = etf.bid_ask_spread || 0.5;

  const aumScore = normalizeScore(aum, minAum, maxAum);
  const spreadScore = normalizeScore(spread, minSpread, maxSpread);
  const invertedSpreadScore = 100 - spreadScore;

  return aumScore * 0.7 + invertedSpreadScore * 0.3;
}

function calculateCommunityScore(averageRating: number | null): number {
  if (!averageRating) return 50;
  return ((averageRating - 1) / 4) * 100;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { isin: string } }
) {
  try {
    const { isin } = params;

    // Fetch ETF details
    const { data: etf, error: etfError } = await supabase
      .from('etfs')
      .select('*')
      .eq('isin' as any, isin as any)
      .single();

    if (etfError) {
      if (etfError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'ETF not found' },
          { status: 404 }
        );
      }

      console.error('Error fetching ETF:', etfError);
      return NextResponse.json(
        { error: 'Failed to fetch ETF', details: etfError.message },
        { status: 500 }
      );
    }

    // Fetch fund manager details
    let fundManager = null;
    if (etf.manager_id) {
      const { data: manager, error: managerError } = await supabase
        .from('fund_managers')
        .select('*')
        .eq('id' as any, etf.manager_id as any)
        .single();

      if (!managerError) {
        fundManager = manager;
      }
    }

    // Fetch user ratings
    const { data: ratings, error: ratingsError } = await supabase
      .from('user_ratings')
      .select('rating')
      .eq('etf_id' as any, etf.id as any);

    let averageRating = null;
    let ratingCount = 0;

    if (!ratingsError && ratings && ratings.length > 0) {
      const sum = ratings.reduce((acc, r) => acc + (r.rating || 0), 0);
      averageRating = sum / ratings.length;
      ratingCount = ratings.length;
    }

    // Fetch price history (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: priceHistory, error: priceError } = await supabase
      .from('etf_price_history')
      .select('date, nav_price')
      .eq('etf_id' as any, etf.id as any)
      .gte('date', thirtyDaysAgo.toISOString())
      .order('date', { ascending: true });

    // Calculate ETFNexo Score
    // We need all ETFs for normalization
    const { data: allEtfs, error: allEtfsError } = await supabase
      .from('etfs')
      .select('return_1y, sharpe_ratio, ter, aum_millions, bid_ask_spread');

    let performance_score = 50;
    let cost_score = 50;
    let liquidity_score = 50;
    let community_score = 50;
    let etfnexo_score = 50;

    if (!allEtfsError && allEtfs && allEtfs.length > 0) {
      // Calculate min/max for normalization
      const returns = allEtfs.map(e => e.return_1y || 0);
      const sharpes = allEtfs.map(e => e.sharpe_ratio || 0);
      const ters = allEtfs.map(e => e.ter || 0);
      const aums = allEtfs.map(e => e.aum_millions || 0);
      const spreads = allEtfs.map(e => e.bid_ask_spread || 0.5);

      const minReturn = Math.min(...returns);
      const maxReturn = Math.max(...returns);
      const minSharpe = Math.min(...sharpes);
      const maxSharpe = Math.max(...sharpes);
      const minTer = Math.min(...ters);
      const maxTer = Math.max(...ters);
      const minAum = Math.min(...aums);
      const maxAum = Math.max(...aums);
      const minSpread = Math.min(...spreads);
      const maxSpread = Math.max(...spreads);

      // Calculate scores
      performance_score = calculatePerformanceScore(
        etf,
        minReturn,
        maxReturn,
        minSharpe,
        maxSharpe
      );
      cost_score = calculateCostScore(etf, minTer, maxTer);
      liquidity_score = calculateLiquidityScore(
        etf,
        minAum,
        maxAum,
        minSpread,
        maxSpread
      );
      community_score = calculateCommunityScore(averageRating);

      // ETFNexo Score weighted formula
      etfnexo_score =
        performance_score * 0.35 +
        cost_score * 0.25 +
        liquidity_score * 0.2 +
        community_score * 0.2;
    }

    return NextResponse.json({
      etf: {
        ...etf,
        etfnexo_score: Math.round(etfnexo_score * 100) / 100,
        performance_score: Math.round(performance_score * 100) / 100,
        cost_score: Math.round(cost_score * 100) / 100,
        liquidity_score: Math.round(liquidity_score * 100) / 100,
        community_score: Math.round(community_score * 100) / 100,
      },
      fundManager,
      ratings: {
        average: averageRating,
        count: ratingCount
      },
      priceHistory: priceHistory || []
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
