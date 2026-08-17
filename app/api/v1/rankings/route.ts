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

// ETFNexo Score Algorithm
// -------------------------
// Performance Score (35%): Sharpe Ratio + Return 1Y
// Cost Score (25%): TER (lower is better)
// Liquidity Score (20%): AUM + Bid-Ask Spread
// Community Score (20%): User Ratings

interface ETFWithScore {
  id: string;
  isin: string;
  name: string;
  yahoo_ticker: string;
  return_1y: number | null;
  sharpe_ratio: number | null;
  ter: number | null;
  aum_millions: number | null;
  bid_ask_spread: number | null;
  performance_score: number;
  cost_score: number;
  liquidity_score: number;
  community_score: number;
  etfnexo_score: number;
  rank: number;
}

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

  // Weighted: 60% Return, 40% Sharpe
  return returnScore * 0.6 + sharpeScore * 0.4;
}

function calculateCostScore(etf: any, minTer: number, maxTer: number): number {
  const ter = etf.ter || 0;

  // Lower TER is better, so invert the score
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
  // Lower spread is better
  const spreadScore = normalizeScore(spread, minSpread, maxSpread);
  const invertedSpreadScore = 100 - spreadScore;

  // Weighted: 70% AUM, 30% Spread
  return aumScore * 0.7 + invertedSpreadScore * 0.3;
}

function calculateCommunityScore(averageRating: number | null): number {
  if (!averageRating) return 50; // Neutral score if no ratings
  // Convert 1-5 stars to 0-100 score
  return ((averageRating - 1) / 4) * 100;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '1000');

    // Fetch all ETFs
    let query = supabase.from('etfs').select('*');

    if (category) {
      query = query.eq('category' as any, category as any);
    }

    const { data: etfs, error: etfsError } = await query;

    if (etfsError) {
      console.error('Error fetching ETFs:', etfsError);
      return NextResponse.json(
        { error: 'Failed to fetch ETFs', details: etfsError.message },
        { status: 500 }
      );
    }

    if (!etfs || etfs.length === 0) {
      return NextResponse.json({ data: [], count: 0 });
    }

    // Fetch all ratings
    const { data: allRatings, error: ratingsError } = await supabase
      .from('user_ratings')
      .select('etf_id, rating');

    // Calculate average rating per ETF
    const ratingsByEtf: Record<string, number> = {};
    if (!ratingsError && allRatings) {
      const grouped = allRatings.reduce((acc, rating) => {
        if (!rating.etf_id) return acc; // Skip if no etf_id
        if (!acc[rating.etf_id]) {
          acc[rating.etf_id] = [];
        }
        acc[rating.etf_id].push(rating.rating || 0);
        return acc;
      }, {} as Record<string, number[]>);

      Object.entries(grouped).forEach(([etfId, ratings]) => {
        const sum = ratings.reduce((a, b) => a + b, 0);
        ratingsByEtf[etfId] = sum / ratings.length;
      });
    }

    // Calculate min/max for normalization
    const returns = etfs.map(e => e.return_1y || 0);
    const sharpes = etfs.map(e => e.sharpe_ratio || 0);
    const ters = etfs.map(e => e.ter || 0);
    const aums = etfs.map(e => e.aum_millions || 0);
    const spreads = etfs.map(e => e.bid_ask_spread || 0.5);

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

    // Calculate scores for each ETF
    const etfsWithScores: ETFWithScore[] = etfs.map((etf) => {
      const performance_score = calculatePerformanceScore(
        etf,
        minReturn,
        maxReturn,
        minSharpe,
        maxSharpe
      );
      const cost_score = calculateCostScore(etf, minTer, maxTer);
      const liquidity_score = calculateLiquidityScore(
        etf,
        minAum,
        maxAum,
        minSpread,
        maxSpread
      );
      const community_score = calculateCommunityScore(ratingsByEtf[etf.id] || null);

      // ETFNexo Score weighted formula
      const etfnexo_score =
        performance_score * 0.35 +
        cost_score * 0.25 +
        liquidity_score * 0.2 +
        community_score * 0.2;

      return {
        id: etf.id,
        isin: etf.isin,
        name: etf.name,
        yahoo_ticker: etf.yahoo_ticker || '',
        category: etf.category,
        return_1y: etf.return_1y,
        sharpe_ratio: etf.sharpe_ratio,
        ter: etf.ter,
        aum_millions: etf.aum_millions,
        bid_ask_spread: etf.bid_ask_spread,
        performance_score: Math.round(performance_score * 100) / 100,
        cost_score: Math.round(cost_score * 100) / 100,
        liquidity_score: Math.round(liquidity_score * 100) / 100,
        community_score: Math.round(community_score * 100) / 100,
        etfnexo_score: Math.round(etfnexo_score * 100) / 100,
        rank: 0 // Will be set after sorting
      };
    });

    // Sort by ETFNexo Score (descending) and assign ranks
    etfsWithScores.sort((a, b) => b.etfnexo_score - a.etfnexo_score);
    etfsWithScores.forEach((etf, index) => {
      etf.rank = index + 1;
    });

    // Apply limit
    const topETFs = etfsWithScores.slice(0, limit);

    return NextResponse.json({
      data: topETFs,
      count: etfs.length,
      algorithm: {
        name: 'ETFNexo Score',
        version: '1.0',
        weights: {
          performance: 0.35,
          cost: 0.25,
          liquidity: 0.2,
          community: 0.2
        },
        description: 'Composite score based on performance (Sharpe + returns), cost efficiency (TER), liquidity (AUM + spread), and community ratings'
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
