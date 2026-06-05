'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ProgressBar from './ProgressBar';

interface ETFRanking {
  id: string;
  isin: string;
  name: string;
  yahoo_ticker: string;
  return_1y: number | null;
  sharpe_ratio: number | null;
  ter: number | null;
  aum_millions: number | null;
  etfnexo_score: number;
  rank: number;
  performance_score: number;
  cost_score: number;
  liquidity_score: number;
}

export default function RankingSlider() {
  const [rankings, setRankings] = useState<ETFRanking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/rankings')
      .then(res => res.json())
      .then(data => {
        setRankings(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching rankings:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="w-full overflow-hidden py-8 bg-slate-50">
        <div className="flex gap-6 px-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-none w-[420px] bg-white border border-slate-200 rounded-lg p-6 animate-pulse">
              <div className="h-64 bg-slate-100 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Duplicate rankings for infinite loop effect
  const duplicatedRankings = [...rankings, ...rankings, ...rankings];

  return (
    <div className="w-full overflow-hidden relative py-8 bg-slate-50">
      <div className="overflow-hidden">
        <div className="flex gap-6 px-4 animate-scroll hover:pause">
          {duplicatedRankings.map((etf, index) => (
            <Link
              key={`${etf.id}-${index}`}
              href={`/etfs/${etf.isin}`}
              className="flex-none w-[420px] bg-white border border-slate-200 rounded-lg p-6 hover:border-blue-400 hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
            >
              {/* Header with Rank and Score */}
              <div className="flex items-start justify-between pb-4 mb-4 border-b border-slate-200">
                <div className="flex items-center justify-center min-w-[48px] h-12 bg-slate-900 text-white text-xl font-bold rounded-lg">
                  #{etf.rank}
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-3xl font-bold text-blue-600 leading-none">{etf.etfnexo_score.toFixed(1)}</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wide mt-1">ETFNexo Score</span>
                </div>
              </div>

              {/* ETF Info */}
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{etf.name}</h3>
                <p className="text-sm text-slate-600 font-medium">{etf.yahoo_ticker}</p>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-slate-50 rounded-lg">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 font-medium">Rentabilidad 1Y</span>
                  <span className={`text-lg font-bold ${etf.return_1y && etf.return_1y > 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {etf.return_1y ? `${etf.return_1y.toFixed(2)}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 font-medium">Sharpe Ratio</span>
                  <span className="text-lg font-bold text-slate-900">
                    {etf.sharpe_ratio ? etf.sharpe_ratio.toFixed(2) : 'N/A'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 font-medium">TER</span>
                  <span className="text-lg font-bold text-slate-900">
                    {etf.ter ? `${(etf.ter * 100).toFixed(2)}%` : 'N/A'}
                  </span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-500 font-medium">AUM</span>
                  <span className="text-lg font-bold text-slate-900">
                    {etf.aum_millions ? `€${etf.aum_millions.toLocaleString()}M` : 'N/A'}
                  </span>
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="space-y-3">
                <ProgressBar
                  label="Performance"
                  value={etf.performance_score}
                  variant="performance"
                />
                <ProgressBar
                  label="Costes"
                  value={etf.cost_score}
                  variant="cost"
                />
                <ProgressBar
                  label="Liquidez"
                  value={etf.liquidity_score}
                  variant="liquidity"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
