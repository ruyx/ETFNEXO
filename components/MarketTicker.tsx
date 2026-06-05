'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ETFTickerItem {
  rank: number;
  isin: string;
  name: string;
  etfnexo_score: number;
  return_1y: number;
  ter: number;
}

export default function MarketTicker() {
  const [etfs, setEtfs] = useState<ETFTickerItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/v1/rankings?limit=10')
      .then(res => res.json())
      .then(data => {
        setEtfs(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading ticker:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-slate-800 border-b border-slate-700 py-2 overflow-hidden">
        <div className="flex items-center gap-8 px-4 animate-pulse">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="flex items-center gap-2">
              <div className="h-4 w-20 bg-slate-700 rounded"></div>
              <div className="h-4 w-12 bg-slate-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (etfs.length === 0) {
    return null;
  }

  // Duplicar items para crear efecto infinito
  const tickerItems = [...etfs, ...etfs, ...etfs];

  return (
    <div className="bg-slate-800 border-b border-slate-700 py-2 overflow-hidden relative sticky top-[73px] z-40">
      {/* Gradientes de fade en los bordes */}
      <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-800 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-800 to-transparent z-10 pointer-events-none"></div>

      {/* Ticker scroll */}
      <div className="ticker-scroll flex items-center gap-8">
        {tickerItems.map((etf, index) => (
          <Link
            key={`${etf.isin}-${index}`}
            href={`/etfs/${etf.isin}`}
            className="flex items-center gap-3 px-4 hover:bg-slate-700/50 rounded transition-colors flex-shrink-0 group"
          >
            {/* Rank Badge */}
            <div className={`flex items-center justify-center w-7 h-7 rounded text-xs font-bold ${
              etf.rank === 1 ? 'bg-yellow-500 text-slate-900' :
              etf.rank === 2 ? 'bg-slate-400 text-slate-900' :
              etf.rank === 3 ? 'bg-orange-600 text-white' :
              'bg-slate-600 text-slate-300'
            }`}>
              #{etf.rank}
            </div>

            {/* ETF Info */}
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold text-sm whitespace-nowrap group-hover:text-blue-400 transition-colors">
                {etf.name.length > 40 ? etf.name.substring(0, 40) + '...' : etf.name}
              </span>
              <span className="text-slate-400 text-xs">•</span>
              <span className="text-blue-400 font-mono text-sm font-bold">
                {etf.etfnexo_score.toFixed(1)}
              </span>
            </div>

            {/* Performance */}
            {etf.return_1y !== null && (
              <div className={`text-xs font-mono font-semibold ${
                etf.return_1y >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {etf.return_1y >= 0 ? '+' : ''}{etf.return_1y.toFixed(2)}%
              </div>
            )}

            {/* TER */}
            <div className="text-xs text-slate-400 font-mono">
              TER {etf.ter ? (etf.ter * 100).toFixed(2) : 'N/A'}%
            </div>
          </Link>
        ))}
      </div>

      <style jsx>{`
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-33.333%);
          }
        }

        .ticker-scroll {
          animation: ticker-scroll 60s linear infinite;
        }

        .ticker-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
