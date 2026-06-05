import ScoreRing from '@/components/ScoreRing'
import CategoryBadge from '@/components/CategoryBadge'
import ETFCard, { ETFCardData } from '@/components/ETFCard'

// Sample ETF data
const sampleETFs: ETFCardData[] = [
  {
    id: '1',
    ticker: 'SPY',
    nombre: 'SPDR S&P 500 ETF Trust',
    categoria: 'Large Cap',
    score: 92,
    precio_actual: 456.78,
    rendimiento_1y: 24.5,
    expense_ratio: 0.09,
    aum: 450000,
  },
  {
    id: '2',
    ticker: 'QQQ',
    nombre: 'Invesco QQQ Trust',
    categoria: 'Technology',
    score: 88,
    precio_actual: 389.12,
    rendimiento_1y: 32.8,
    expense_ratio: 0.20,
    aum: 220000,
  },
  {
    id: '3',
    ticker: 'VTI',
    nombre: 'Vanguard Total Stock Market ETF',
    categoria: 'Total Market',
    score: 95,
    precio_actual: 245.67,
    rendimiento_1y: 22.3,
    expense_ratio: 0.03,
    aum: 380000,
  },
  {
    id: '4',
    ticker: 'AGG',
    nombre: 'iShares Core U.S. Aggregate Bond ETF',
    categoria: 'Bonds',
    score: 76,
    precio_actual: 98.45,
    rendimiento_1y: -2.1,
    expense_ratio: 0.04,
    aum: 95000,
  },
]

export default function ComponentsDemo() {
  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container py-12">
        {/* Header */}
        <div className="mb-12 pb-6 border-b border-slate-200">
          <h1 className="heading-1 text-slate-900 mb-2">
            ETF Nexo Components
          </h1>
          <p className="body-large text-slate-600">
            Corporate design system showcase
          </p>
        </div>

        {/* ScoreRing Section */}
        <section className="mb-12">
          <h2 className="heading-2 mb-6 text-slate-900">ScoreRing Component</h2>
          <div className="card bg-white">
            <h3 className="heading-4 mb-6 text-slate-700">Score variations</h3>
            <div className="flex flex-wrap items-center gap-12">
              <div className="text-center">
                <ScoreRing score={95} size="xs" />
                <p className="text-xs text-slate-500 mt-2">XS - 95</p>
              </div>
              <div className="text-center">
                <ScoreRing score={78} size="sm" />
                <p className="text-xs text-slate-500 mt-2">SM - 78</p>
              </div>
              <div className="text-center">
                <ScoreRing score={45} size="md" />
                <p className="text-xs text-slate-500 mt-2">MD - 45</p>
              </div>
              <div className="text-center">
                <ScoreRing score={22} size="sm" showLabel={true} />
                <p className="text-xs text-slate-500 mt-2">With Label</p>
              </div>
            </div>
          </div>
        </section>

        {/* CategoryBadge Section */}
        <section className="mb-12">
          <h2 className="heading-2 mb-6 text-slate-900">CategoryBadge Component</h2>
          <div className="card bg-white">
            <h3 className="heading-4 mb-6 text-slate-700">Badge variants</h3>
            <div className="flex flex-wrap gap-3">
              <CategoryBadge category="Large Cap" variant="default" />
              <CategoryBadge category="Technology" variant="primary" />
              <CategoryBadge category="Bonds" variant="default" />
              <CategoryBadge category="International" variant="primary" />
              <CategoryBadge category="Dividend" variant="default" />
              <CategoryBadge category="Total Market" variant="primary" />
            </div>
          </div>
        </section>

        {/* ETFCard Section */}
        <section className="mb-12">
          <h2 className="heading-2 mb-6 text-slate-900">ETFCard Component</h2>

          <div className="mb-8">
            <h3 className="heading-3 mb-4 text-slate-700">With ranking</h3>
            <div className="space-y-3">
              {sampleETFs.slice(0, 3).map((etf, index) => (
                <ETFCard key={etf.id} etf={etf} rank={index + 1} />
              ))}
            </div>
          </div>

          <div className="mb-8">
            <h3 className="heading-3 mb-4 text-slate-700">Without ranking</h3>
            <div className="space-y-3">
              <ETFCard etf={sampleETFs[3]} />
            </div>
          </div>

          <div>
            <h3 className="heading-3 mb-4 text-slate-700">Without score</h3>
            <div className="space-y-3">
              <ETFCard etf={sampleETFs[0]} showScore={false} />
            </div>
          </div>
        </section>

        {/* Typography Section */}
        <section className="mb-12">
          <h2 className="heading-2 mb-6 text-slate-900">Typography</h2>
          <div className="card bg-white space-y-6">
            <div className="pb-4 border-b border-slate-200">
              <h1 className="heading-1 text-slate-900">Heading 1 - ETF Analytics Platform</h1>
            </div>
            <div className="pb-4 border-b border-slate-200">
              <h2 className="heading-2 text-slate-900">Heading 2 - Weekly Rankings</h2>
            </div>
            <div className="pb-4 border-b border-slate-200">
              <h3 className="heading-3 text-slate-900">Heading 3 - Top Performers</h3>
            </div>
            <div className="pb-4 border-b border-slate-200">
              <h4 className="heading-4 text-slate-900">Heading 4 - ETF Details</h4>
            </div>
            <div className="pb-4 border-b border-slate-200">
              <p className="body-large text-slate-600">
                Body Large - Professional ETF analytics and rankings platform for informed investment decisions
              </p>
            </div>
            <div className="pb-4 border-b border-slate-200">
              <p className="body-base text-slate-600">
                Body Base - Comprehensive data from multiple financial sources
              </p>
            </div>
            <div className="pb-4 border-b border-slate-200">
              <p className="body-small text-slate-500">
                Body Small - Updated weekly with latest market data
              </p>
            </div>
            <div>
              <p className="financial-number text-xl text-emerald-600">
                +24.50% Annual Return
              </p>
            </div>
          </div>
        </section>

        {/* Buttons Section */}
        <section className="mb-12">
          <h2 className="heading-2 mb-6 text-slate-900">Buttons</h2>
          <div className="card bg-white">
            <div className="flex flex-wrap gap-4">
              <button className="btn-primary">Primary Button</button>
              <button className="btn-secondary">Secondary Button</button>
              <button className="btn-ghost">Ghost Button</button>
            </div>
          </div>
        </section>

        {/* Colors Section */}
        <section className="mb-12">
          <h2 className="heading-2 mb-6 text-slate-900">Color Palette</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Neutral Colors */}
            <div className="card bg-white">
              <h3 className="heading-4 mb-4 text-slate-700">Neutrals</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-slate-900 border border-slate-200"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Slate 900</p>
                    <p className="text-xs text-slate-500">#0F172A</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-slate-600 border border-slate-200"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Slate 600</p>
                    <p className="text-xs text-slate-500">#475569</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-slate-200 border border-slate-300"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Slate 200</p>
                    <p className="text-xs text-slate-500">#E2E8F0</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-slate-50 border border-slate-200"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Slate 50</p>
                    <p className="text-xs text-slate-500">#F8FAFC</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Semantic Colors */}
            <div className="card bg-white">
              <h3 className="heading-4 mb-4 text-slate-700">Semantic</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-blue-600 border border-slate-200"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Primary</p>
                    <p className="text-xs text-slate-500">#2563EB</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-emerald-600 border border-slate-200"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Success</p>
                    <p className="text-xs text-slate-500">#059669</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-amber-600 border border-slate-200"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Warning</p>
                    <p className="text-xs text-slate-500">#D97706</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded bg-red-600 border border-slate-200"></div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Error</p>
                    <p className="text-xs text-slate-500">#DC2626</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
