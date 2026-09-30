/**
 * ETF Comparison Panel - WebMCP
 *
 * Muestra comparación lado a lado de ETFs
 * Se actualiza cuando AI agent invoca compare-etfs tool
 */

'use client';

import { useState, useEffect } from 'react';
import type { ETFComparison, ComparisonWinners } from '@/lib/webmcp/types';
import Link from 'next/link';

interface ComparisonData {
  etfs: ETFComparison[];
  winners: ComparisonWinners;
  summary: string;
}

export function ETFComparisonPanel() {
  const [comparison, setComparison] = useState<ComparisonData | null>(null);

  useEffect(() => {
    const handleETFsCompared = (e: CustomEvent) => {
      setComparison({
        etfs: e.detail.etfs,
        winners: e.detail.winners,
        summary: e.detail.summary,
      });
    };

    window.addEventListener('webmcp:etfs-compared', handleETFsCompared as EventListener);

    return () => {
      window.removeEventListener('webmcp:etfs-compared', handleETFsCompared as EventListener);
    };
  }, []);

  if (!comparison) return null;

  const { etfs, winners, summary } = comparison;

  return (
    <div className="fixed left-1/2 top-20 z-50 max-h-[85vh] w-full max-w-4xl -translate-x-1/2 overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <span className="text-lg">⚖️</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Comparación de ETFs</h3>
              <p className="text-xs text-white/80">{etfs.length} ETFs comparados</p>
            </div>
          </div>
          <button
            onClick={() => setComparison(null)}
            className="rounded-full p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Cerrar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[75vh] overflow-y-auto">
        {/* Summary */}
        <div className="border-b border-gray-200 bg-blue-50 px-4 py-3 dark:border-gray-700 dark:bg-blue-900/10">
          <pre className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">{summary}</pre>
        </div>

        {/* Comparison Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  Métrica
                </th>
                {etfs.map((etf) => (
                  <th
                    key={etf.ticker}
                    className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400"
                  >
                    <Link
                      href={`/rankings?ticker=${etf.ticker}`}
                      className="block hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <div className="font-bold">{etf.ticker}</div>
                      <div className="mt-1 text-xs font-normal normal-case text-gray-500 dark:text-gray-400">
                        {etf.name.length > 30 ? `${etf.name.substring(0, 30)}...` : etf.name}
                      </div>
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {/* ETFNexo Score */}
              <ComparisonRow
                label="ETFNexo Score"
                values={etfs.map((etf) => ({
                  value: `${etf.score.toFixed(1)}/10`,
                  isWinner: etf.ticker === winners.highestScore,
                  ticker: etf.ticker,
                }))}
              />

              {/* TER */}
              <ComparisonRow
                label="TER"
                values={etfs.map((etf) => ({
                  value: `${(etf.ter * 100).toFixed(2)}%`,
                  isWinner: etf.ticker === winners.lowestTER,
                  ticker: etf.ticker,
                }))}
              />

              {/* AUM */}
              <ComparisonRow
                label="AUM"
                values={etfs.map((etf) => ({
                  value: `€${(etf.aum / 1_000_000_000).toFixed(1)}B`,
                  isWinner: etf.ticker === winners.largestAUM,
                  ticker: etf.ticker,
                }))}
              />

              {/* Región */}
              {etfs.some((etf) => etf.region) && (
                <ComparisonRow
                  label="Región"
                  values={etfs.map((etf) => ({
                    value: etf.region || '-',
                    isWinner: false,
                    ticker: etf.ticker,
                  }))}
                />
              )}

              {/* Sector */}
              {etfs.some((etf) => etf.sector) && (
                <ComparisonRow
                  label="Sector"
                  values={etfs.map((etf) => ({
                    value: etf.sector || '-',
                    isWinner: false,
                    ticker: etf.ticker,
                  }))}
                />
              )}

              {/* Replicación */}
              {etfs.some((etf) => etf.replicationMethod) && (
                <ComparisonRow
                  label="Réplica"
                  values={etfs.map((etf) => ({
                    value: etf.replicationMethod || '-',
                    isWinner: etf.ticker === winners.bestReplication,
                    ticker: etf.ticker,
                  }))}
                />
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          🤖 Comparación generada por AI agent usando WebMCP
        </p>
      </div>
    </div>
  );
}

function ComparisonRow({
  label,
  values,
}: {
  label: string;
  values: Array<{
    value: string;
    isWinner: boolean;
    ticker: string;
  }>;
}) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <td className="sticky left-0 z-10 bg-white px-4 py-3 text-sm font-medium text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        {label}
      </td>
      {values.map(({ value, isWinner, ticker }) => (
        <td
          key={ticker}
          className={`px-4 py-3 text-center text-sm ${
            isWinner
              ? 'bg-green-50 font-bold text-green-700 dark:bg-green-900/20 dark:text-green-400'
              : 'text-gray-700 dark:text-gray-300'
          }`}
        >
          {isWinner ? (
            <div className="flex items-center justify-center gap-1">
              <span>🏆</span>
              <span>{value}</span>
            </div>
          ) : (
            value
          )}
        </td>
      ))}
    </tr>
  );
}
