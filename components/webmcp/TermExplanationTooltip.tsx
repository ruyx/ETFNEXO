/**
 * Term Explanation Tooltip - WebMCP
 *
 * Muestra explicaciones de términos financieros cuando AI agent invoca explain-etf-term
 */

'use client';

import { useWebMCP } from '@/lib/webmcp/hooks/useWebMCP';
import Link from 'next/link';

export function TermExplanationTooltip() {
  const { explainedTerm, clearExplainedTerm } = useWebMCP();

  if (!explainedTerm) return null;

  const { term, definition, example, relatedArticles, importance } = explainedTerm;

  const importanceConfig = {
    high: { color: 'border-red-500', badge: 'bg-red-100 text-red-700', icon: '🔴' },
    medium: { color: 'border-yellow-500', badge: 'bg-yellow-100 text-yellow-700', icon: '🟡' },
    low: { color: 'border-blue-500', badge: 'bg-blue-100 text-blue-700', icon: '🔵' },
  };

  const config = importanceConfig[importance];

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 w-full max-w-md rounded-lg border-2 ${config.color} bg-white shadow-2xl dark:bg-gray-900`}
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
        <div className="flex items-start gap-2">
          <span className="text-xl">{config.icon}</span>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-gray-100">{term}</h3>
            <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${config.badge}`}>
              {importance === 'high' && 'Concepto clave'}
              {importance === 'medium' && 'Importante'}
              {importance === 'low' && 'Básico'}
            </span>
          </div>
        </div>
        <button
          onClick={clearExplainedTerm}
          className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          aria-label="Cerrar"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="px-4 py-3">
        {/* Definition */}
        <div className="mb-3">
          <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{definition}</p>
        </div>

        {/* Example */}
        {example && (
          <div className="mb-3 rounded-lg bg-orange-50 p-3 dark:bg-orange-900/10">
            <p className="mb-1 text-xs font-semibold text-orange-700 dark:text-orange-400">📊 Ejemplo:</p>
            <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">{example}</p>
          </div>
        )}

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="border-t border-gray-200 pt-3 dark:border-gray-700">
            <p className="mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400">💡 Lee más:</p>
            <div className="space-y-2">
              {relatedArticles.slice(0, 2).map((article) => (
                <Link
                  key={article.slug}
                  href={`/academia/${article.slug}`}
                  className="block rounded-lg border border-gray-200 p-2 transition-colors hover:border-orange-300 hover:bg-orange-50 dark:border-gray-700 dark:hover:border-orange-700 dark:hover:bg-orange-900/10"
                >
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {article.title}
                  </p>
                  {article.excerpt && (
                    <p className="mt-1 line-clamp-2 text-xs text-gray-600 dark:text-gray-400">
                      {article.excerpt}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          🤖 Explicación generada por AI agent
        </p>
      </div>
    </div>
  );
}
