/**
 * Portfolio Analysis Panel - WebMCP
 *
 * Muestra análisis completo de cartera de ETFs
 * Se actualiza cuando AI agent invoca analyze-portfolio tool
 */

'use client';

import { useState, useEffect } from 'react';
import type { PortfolioMetrics, PortfolioRecommendation } from '@/lib/webmcp/types';

interface PortfolioAnalysisData {
  metrics: PortfolioMetrics;
  recommendations: PortfolioRecommendation[];
  etfs: Array<{
    ticker: string;
    name: string;
    weight: number;
    ter: number;
    score: number;
    region?: string;
    sector?: string;
  }>;
}

export function PortfolioAnalysisPanel() {
  const [analysis, setAnalysis] = useState<PortfolioAnalysisData | null>(null);

  useEffect(() => {
    const handlePortfolioAnalyzed = (e: CustomEvent) => {
      setAnalysis({
        metrics: e.detail.metrics,
        recommendations: e.detail.recommendations,
        etfs: e.detail.etfs,
      });
    };

    window.addEventListener('webmcp:portfolio-analyzed', handlePortfolioAnalyzed as EventListener);

    return () => {
      window.removeEventListener('webmcp:portfolio-analyzed', handlePortfolioAnalyzed as EventListener);
    };
  }, []);

  if (!analysis) return null;

  const { metrics, recommendations, etfs } = analysis;

  const priorityConfig = {
    high: { color: 'border-red-500', bg: 'bg-red-50', text: 'text-red-700', badge: 'bg-red-100' },
    medium: { color: 'border-yellow-500', bg: 'bg-yellow-50', text: 'text-yellow-700', badge: 'bg-yellow-100' },
    low: { color: 'border-blue-500', bg: 'bg-blue-50', text: 'text-blue-700', badge: 'bg-blue-100' },
  };

  const typeIcons = {
    warning: '⚠️',
    suggestion: '💡',
    optimization: '✨',
  };

  return (
    <div className="fixed right-4 top-20 z-50 max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-lg bg-white shadow-2xl dark:bg-gray-900">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600 px-4 py-3 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
              <span className="text-lg">📊</span>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">Análisis de Cartera</h3>
              <p className="text-xs text-white/80">{metrics.totalETFs} ETFs analizados</p>
            </div>
          </div>
          <button
            onClick={() => setAnalysis(null)}
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
        {/* Métricas Principales */}
        <div className="border-b border-gray-200 bg-gray-50 px-4 py-4 dark:border-gray-700 dark:bg-gray-800">
          <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            Métricas Principales
          </h4>
          <div className="grid grid-cols-2 gap-3">
            <MetricCard
              label="TER Promedio"
              value={`${(metrics.averageTER * 100).toFixed(2)}%`}
              status={metrics.averageTER <= 0.003 ? 'good' : metrics.averageTER <= 0.005 ? 'ok' : 'warning'}
            />
            <MetricCard
              label="Score Promedio"
              value={`${metrics.averageScore.toFixed(1)}/10`}
              status={metrics.averageScore >= 8 ? 'good' : metrics.averageScore >= 6 ? 'ok' : 'warning'}
            />
            <MetricCard
              label="AUM Total"
              value={`€${(metrics.totalAUM / 1_000_000_000).toFixed(1)}B`}
              status="neutral"
            />
            <MetricCard
              label="Regiones"
              value={Object.keys(metrics.regionExposure).length.toString()}
              status={Object.keys(metrics.regionExposure).length >= 3 ? 'good' : 'ok'}
            />
          </div>
        </div>

        {/* Exposición Geográfica */}
        {Object.keys(metrics.regionExposure).length > 0 && (
          <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Exposición Geográfica
            </h4>
            <div className="space-y-2">
              {Object.entries(metrics.regionExposure)
                .sort(([, a], [, b]) => b - a)
                .map(([region, weight]) => (
                  <div key={region} className="flex items-center gap-2">
                    <span className="min-w-[100px] text-sm text-gray-700 dark:text-gray-300">{region}</span>
                    <div className="flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full rounded-full bg-green-500"
                          style={{ width: `${weight * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="min-w-[50px] text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                      {(weight * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Exposición Sectorial */}
        {Object.keys(metrics.sectorExposure).length > 0 && (
          <div className="border-b border-gray-200 px-4 py-4 dark:border-gray-700">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Exposición Sectorial
            </h4>
            <div className="space-y-2">
              {Object.entries(metrics.sectorExposure)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([sector, weight]) => (
                  <div key={sector} className="flex items-center gap-2">
                    <span className="min-w-[120px] truncate text-sm text-gray-700 dark:text-gray-300">{sector}</span>
                    <div className="flex-1">
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${weight * 100}%` }}
                        />
                      </div>
                    </div>
                    <span className="min-w-[50px] text-right text-sm font-medium text-gray-900 dark:text-gray-100">
                      {(weight * 100).toFixed(0)}%
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Recomendaciones */}
        {recommendations.length > 0 && (
          <div className="px-4 py-4">
            <h4 className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Recomendaciones
            </h4>
            <div className="space-y-3">
              {recommendations
                .sort((a, b) => {
                  const priorityOrder = { high: 0, medium: 1, low: 2 };
                  return priorityOrder[a.priority] - priorityOrder[b.priority];
                })
                .map((rec, index) => {
                  const config = priorityConfig[rec.priority];
                  return (
                    <div
                      key={index}
                      className={`rounded-lg border-l-4 ${config.color} ${config.bg} p-3 dark:bg-opacity-10`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{typeIcons[rec.type]}</span>
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <h5 className={`font-semibold ${config.text}`}>{rec.title}</h5>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.badge} ${config.text}`}>
                              {rec.priority === 'high' && 'Alta prioridad'}
                              {rec.priority === 'medium' && 'Media prioridad'}
                              {rec.priority === 'low' && 'Info'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{rec.description}</p>
                          {rec.affectedETFs && rec.affectedETFs.length > 0 && (
                            <div className="mt-2">
                              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                ETFs afectados:
                              </p>
                              <div className="mt-1 flex flex-wrap gap-1">
                                {rec.affectedETFs.map((ticker) => (
                                  <span
                                    key={ticker}
                                    className="rounded bg-gray-200 px-2 py-0.5 text-xs font-mono dark:bg-gray-700"
                                  >
                                    {ticker}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          🤖 Análisis generado por AI agent usando WebMCP
        </p>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: 'good' | 'ok' | 'warning' | 'neutral';
}) {
  const statusConfig = {
    good: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
    ok: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400',
    warning: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
    neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };

  return (
    <div className={`rounded-lg p-3 ${statusConfig[status]}`}>
      <p className="mb-1 text-xs font-medium opacity-80">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
