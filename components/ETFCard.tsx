import Link from 'next/link'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import ScoreRing from './ScoreRing'
import CategoryBadge from './CategoryBadge'

export interface ETFCardData {
  id: string
  ticker: string
  nombre: string
  categoria: string
  score: number
  precio_actual: number
  rendimiento_1y: number
  expense_ratio: number
  aum: number // Assets Under Management in millions
}

interface ETFCardProps {
  etf: ETFCardData
  rank?: number
  showScore?: boolean
}

export default function ETFCard({
  etf,
  rank,
  showScore = true
}: ETFCardProps) {
  const isPositiveReturn = etf.rendimiento_1y >= 0

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatPercent = (value: number): string => {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      signDisplay: 'always',
    }).format(value / 100)
    return formatted
  }

  const formatAUM = (value: number): string => {
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(1)}B`
    }
    return `$${value.toFixed(0)}M`
  }

  return (
    <Link href={`/etfs/${etf.ticker}`} className="block">
      <div className="card hover-lift group cursor-pointer bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300">
        <div className="flex items-center gap-4">
          {/* Rank Badge (compact) */}
          {rank && (
            <div className="flex-shrink-0 w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
              <span className="text-slate-600 font-semibold text-xs tabular-nums">#{rank}</span>
            </div>
          )}

          {/* Score Ring (compact) */}
          {showScore && (
            <div className="flex-shrink-0">
              <ScoreRing score={etf.score} size="xs" showLabel={false} />
            </div>
          )}

          {/* Main Info - Compact Grid */}
          <div className="flex-1 min-w-0 grid grid-cols-[minmax(200px,1fr)_100px_90px_80px_90px] gap-4 items-center">
            {/* Ticker & Name */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <h3 className="text-sm font-semibold text-slate-900 tracking-tight">{etf.ticker}</h3>
                <CategoryBadge category={etf.categoria} variant="default" />
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">
                {etf.nombre}
              </p>
            </div>

            {/* Price */}
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5 font-medium">Price</p>
              <p className="financial-number text-sm text-slate-900 font-medium">
                {formatCurrency(etf.precio_actual)}
              </p>
            </div>

            {/* 1Y Return */}
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5 font-medium">1Y Ret</p>
              <div className="flex items-center justify-end gap-1">
                {isPositiveReturn ? (
                  <ArrowUpRight className="w-3 h-3 text-emerald-600" strokeWidth={2.5} />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-red-600" strokeWidth={2.5} />
                )}
                <p className={`financial-number text-sm font-medium ${
                  isPositiveReturn ? 'text-emerald-600' : 'text-red-600'
                }`}>
                  {formatPercent(etf.rendimiento_1y)}
                </p>
              </div>
            </div>

            {/* Expense Ratio */}
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5 font-medium">Exp</p>
              <p className="financial-number text-sm text-slate-900 font-medium">
                {formatPercent(etf.expense_ratio)}
              </p>
            </div>

            {/* AUM */}
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5 font-medium">AUM</p>
              <p className="financial-number text-sm text-slate-900 font-medium">
                {formatAUM(etf.aum)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
