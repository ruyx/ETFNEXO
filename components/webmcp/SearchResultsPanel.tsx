/**
 * Search Results Panel - WebMCP
 *
 * Muestra los resultados de búsqueda de ETFs vía WebMCP
 * Se actualiza automáticamente cuando AI agent invoca search-etf tool
 */

'use client';

import { useWebMCP } from '@/lib/webmcp/hooks/useWebMCP';
import { describeFilters } from '@/lib/webmcp/utils/nlp-parser';
import Link from 'next/link';

export function SearchResultsPanel() {
  const { searchResults, clearSearchResults } = useWebMCP();

  if (!searchResults) return null;

  const { count, etfs, appliedFilters, query } = searchResults;

  return (
    <div className="fixed bottom-4 left-4 z-50 max-h-[80vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gradient-to-r from-orange-500 to-orange-600 px-4 py-3 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white">Resultados de búsqueda AI</h3>
            <p className="text-xs text-white/80">{count} ETFs encontrados</p>
          </div>
        </div>
        <button
          onClick={clearSearchResults}
          className="rounded-full p-1 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
          aria-label="Cerrar"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Query & Filters */}
      <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800">
        <p className="mb-1 text-xs font-medium text-gray-500 dark:text-gray-400">Query:</p>
        <p className="mb-2 text-sm text-gray-900 dark:text-gray-100">{query}</p>
        <p className="text-xs text-gray-600 dark:text-gray-400">
          <span className="font-medium">Filtros aplicados:</span> {describeFilters(appliedFilters)}
        </p>
      </div>

      {/* Results List */}
      <div className="max-h-[50vh] overflow-y-auto">
        {etfs.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No se encontraron ETFs con estos criterios
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {etfs.map((etf, index) => (
              <div
                key={etf.ticker}
                className="px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                        {index + 1}
                      </span>
                      <Link
                        href={`/rankings?ticker=${etf.ticker}`}
                        className="font-semibold text-gray-900 hover:text-orange-600 dark:text-gray-100 dark:hover:text-orange-400"
                      >
                        {etf.ticker}
                      </Link>
                    </div>
                    <p className="mt-1 truncate text-sm text-gray-600 dark:text-gray-400">
                      {etf.name}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs">
                      {etf.region && (
                        <span className="text-gray-500 dark:text-gray-400">
                          📍 {etf.region}
                        </span>
                      )}
                      {etf.sector && (
                        <span className="text-gray-500 dark:text-gray-400">
                          🏭 {etf.sector}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metrics */}
                  <div className="flex flex-col items-end gap-1 text-right">
                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-bold text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                        {etf.etfnexo_score.toFixed(1)}/10
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      TER {(etf.ter * 100).toFixed(2)}%
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-500">
                      AUM €{(etf.aum / 1_000_000_000).toFixed(1)}B
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          💡 Resultados generados por AI agent usando WebMCP
        </p>
      </div>
    </div>
  );
}
