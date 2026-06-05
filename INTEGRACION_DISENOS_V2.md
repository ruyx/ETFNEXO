# 🎨 Integración Diseños V2.0 - ETF Nexo

**Documento**: Análisis de "Secciones Página Web V2.0.pdf"
**Fecha**: Junio 2026
**Objetivo**: Integrar diseños detallados en el plan MVP económico

---

## 📊 Hallazgos Clave del Documento

### 1. **Nueva Fuente de Ingresos Descubierta: Brókers** 💰

El diseño revela el módulo **"Dónde comprar"** en la ficha individual del ETF:

```
┌─────────────────────────────────┐
│     Dónde comprar  [Patrocinado]│
├─────────────────────────────────┤
│  DEGIRO           [Abrir cuenta]│
│  Desde €1/operación             │
├─────────────────────────────────┤
│  XTB              [Abrir cuenta]│
│  Sin comisión hasta €100K/mes   │
├─────────────────────────────────┤
│  Interactive      [Abrir cuenta]│
│  Brokers                        │
│  Desde €125/operación           │
└─────────────────────────────────┘
"Enlace de afiliado - ETFNexo puede
recibir comisión"
```

**Implicaciones**:
- ✅ **Nueva línea de ingresos**: Afiliación con brókers
- ✅ **Máxima intención de compra**: Usuario viendo ETF específico
- ✅ **Win-Win**: Bróker + ETF Nexo + Usuario

**Modelo de Afiliación Brókers**:
| Bróker | Comisión por Cuenta Abierta | Comisión por Trade |
|--------|------------------------------|---------------------|
| DEGIRO | €0-50 (varía) | No |
| XTB | €50-100 | No |
| Interactive Brokers | €100-200 | Posible |
| Trade Republic | €30-50 | No |
| MyInvestor | €30-50 | No |

**Proyección conservadora**:
- 5,000 usuarios/mes viendo fichas ETF
- CTR 2% a "Abrir cuenta" = 100 clicks/mes
- Conversión 10% = 10 cuentas abiertas/mes
- Comisión promedio €50/cuenta
- **Ingresos adicionales: €500/mes** (desde mes 6)

---

### 2. **Diseño de Ficha Individual ETF** (Páginas 1-2)

#### Estructura Completa

**Header Navy** (Consistente con home):
```
┌─────────────────────────────────────────────────────────┐
│ ETFNexo > Explorador > Renta variable global > IWDA    │
│                                                          │
│ [Logo] IWDA                          €88.14             │
│ ish    iShares Core MSCI World...    NAV cierre 30 may  │
│        ⭐ Destacado sem. 23           ↗ +1.54 (+4.18%)  │
│        Acumulación  Réplica física   MSCI World         │
│                                                          │
│ [1S] 1M  6M  YTD  1A  3A  5A                            │
└─────────────────────────────────────────────────────────┘
```

**Columna Izquierda** (Jerarquía de lectura):
1. **Gráfico evolución del precio** → "¿Cómo ha ido?"
2. **Rendimiento histórico** → 5 cifras de un vistazo
3. **Composición** → Holdings + Geografía (tabs)
4. **Opiniones comunidad** → Rating + Foros

**Columna Derecha** (Datos de apoyo):
1. **ETFNexo Score** → Anillo visual 87/100
2. **Datos técnicos** → ISIN, TER, AUM, etc.
3. **Nivel de riesgo** → Escala KID 1-7
4. **Dónde comprar** → ¡CLAVE MONETIZACIÓN!

---

### 3. **Comparador de ETFs** (Páginas 3-4)

#### Features Clave

**Pills seleccionables**:
```
[● IWDA ×] [● VWRL ×] [● CSPX ×] [+ Añadir ETF]
```

**Tabla comparativa**:
- Rendimiento semana actual destacado (verde = mejor)
- Precio NAV, TER, AUM, Nº posiciones
- Dividendo, Réplica, Domicilio
- ETFNexo Score comparado

**Visualizaciones**:
- Gráfico multi-línea de rendimiento
- Solapamiento de posiciones Top 10
- Score desglosado por dimensión (4 barras)

**Veredicto de la comunidad**:
```
┌──────────────────────────────────┐
│ IWDA                             │
│ [El clásico europeo]             │
│                                  │
│ La opción más seguida por        │
│ inversores europeos. Equilibrio  │
│ ideal entre diversificación...   │
└──────────────────────────────────┘
```

---

## 🎯 Repriorización MVP vs Fase 2

### ✅ **MVP (Semanas 1-12)** - INCLUIR

#### Ficha Individual ETF - Versión Simplificada

**SÍ incluir en MVP**:
- ✅ Header navy con breadcrumb
- ✅ Logo gestora + nombre ETF + badges básicos
- ✅ NAV price + variación semanal
- ✅ Tabs de periodo (1S, 1M, YTD, 1A) → 4 periodos solo
- ✅ Gráfico básico (Recharts line chart)
- ✅ Rendimiento histórico (4 cifras en fila)
- ✅ Datos técnicos completos (columna derecha)
- ✅ ETFNexo Score con anillo visual
- ✅ **Dónde comprar** (3 brókers iniciales)

**NO incluir en MVP** (mover a Fase 2):
- ❌ Tabs 3A, 5A (solo 1S, 1M, YTD, 1A)
- ❌ Composición Top 10 holdings (solo mencionar en texto)
- ❌ Diversificación geográfica (solo mencionar en texto)
- ❌ Opiniones de la comunidad (usar Discord temporalmente)
- ❌ Hilos del foro embebidos
- ❌ Nivel de riesgo KID (opcional Fase 2)

**Justificación**:
- Gráfico + Score + Dónde comprar = 80% del valor
- Holdings y geografía requieren scraping adicional complejo
- Foros embebidos = desarrollo custom pesado

---

#### Comparador - MOVER COMPLETO A FASE 2

**Decisión**: NO incluir comparador en MVP

**Razones**:
1. **Complejidad técnica alta**:
   - State management de 4 ETFs simultáneos
   - Gráficos multi-línea sincronizados
   - Lógica de solapamiento de holdings
   - Score desglosado requiere cálculos adicionales

2. **Prioridad baja para validación**:
   - MVP se valida con ranking + ficha individual
   - Comparador es "nice to have", no "must have"

3. **Coste de desarrollo**:
   - Estimado: 2-3 semanas adicionales
   - Vs. 1 semana ficha individual básica

**Alternativa MVP**:
- Link en ficha individual: "Comparar con ETFs similares (próximamente)"
- Tabla estática de 3 ETFs similares sin interactividad
- Mensajes en Discord para comparaciones

**Roadmap**:
```
MVP (Sem 1-12): Ficha individual básica
Fase 2 (Sem 13-20): Comparador completo
Fase 3 (Sem 21+): Foros integrados + holdings detallados
```

---

## 💰 Modelo de Ingresos Actualizado

### Fuentes de Ingresos (Post-Integración Diseños)

| Fuente | % Revenue | Descripción Actualizada |
|--------|-----------|-------------------------|
| **Patrocinios Gestoras** | 50% | Perfiles premium, newsletter, webinars |
| **Afiliación Brókers** | 25% | Módulo "Dónde comprar" en fichas ETF |
| **Membresías Premium** | 15% | Herramientas avanzadas, exportación |
| **ETF Summit** | 5% | Evento anual presencial/híbrido |
| **Branded Content** | 5% | Informes co-branded con gestoras |

**Cambio clave**: Afiliación brókers sube de 0% → 25%

---

### Proyección Ingresos Mes 6 (Actualizada)

**Patrocinios Gestoras**:
- 1 Gold (€2,000/mes) + 2 Silver (€1,000/mes) = €4,000/mes

**Afiliación Brókers**:
- 10 cuentas/mes × €50 promedio = €500/mes

**Membresías Premium**:
- 50 usuarios × €9.99/mes = €500/mes

**Total mes 6**: **€5,000/mes** (vs €1,500 proyección anterior)

**Con costes €14/mes** → **Margen: 99.7%**

---

## 🏗️ Arquitectura de Componentes Actualizada

### Nuevos Componentes UI (Ficha Individual)

```typescript
// 1. Header ETF (Navy background)
<ETFHeader
  isin="IE00B4L5Y983"
  name="iShares Core MSCI World UCITS ETF USD (Acc)"
  ticker="IWDA"
  fundManager="iShares"
  navPrice={88.14}
  navDate="2026-05-30"
  changeWeek={1.54}
  changeWeekPercent={4.18}
  badges={['Destacado sem. 23', 'Acumulación', 'Réplica física']}
  indexName="MSCI World"
/>

// 2. Period Tabs (Interactive)
<PeriodTabs
  periods={['1S', '1M', 'YTD', '1A']}
  selectedPeriod="1S"
  onPeriodChange={(period) => updateChart(period)}
/>

// 3. Price Chart (Recharts)
<PriceChart
  data={priceHistory}
  period="1S"
  height={300}
/>

// 4. Performance Grid (5 números)
<PerformanceGrid
  returns={{
    '1_week': 4.2,
    '1_month': 6.1,
    'ytd': 9.4,
    '1_year': 18.2,
    '3_year': 48.6
  }}
/>

// 5. ETF Score Ring (Circular progress)
<ScoreRing
  score={87}
  size="large"
  showBreakdown={true}
  breakdown={{
    performance: 92,
    cost: 88,
    liquidity: 95,
    community: 76
  }}
/>

// 6. Technical Data Table
<TechnicalDataTable
  data={{
    isin: 'IE00B4L5Y983',
    fundManager: 'iShares',
    ter: 0.20,
    aum: 62.4,
    indexName: 'MSCI World',
    replication: 'Física optimizada',
    distribution: 'Acumulación',
    domicile: 'Irlanda',
    currency: 'USD',
    trackingError: 0.03,
    volatility: 12.4,
    sharpeRatio: 1.47
  }}
/>

// 7. ¡NUEVO! Where to Buy (Affiliate Module)
<WhereToBuy
  brokers={[
    {
      name: 'DEGIRO',
      commissionText: 'Desde €1/operación',
      affiliateUrl: 'https://degiro.com?ref=etfnexo',
      logo: '/logos/degiro.svg'
    },
    {
      name: 'XTB',
      commissionText: 'Sin comisión hasta €100K/mes',
      affiliateUrl: 'https://xtb.com?ref=etfnexo',
      logo: '/logos/xtb.svg'
    },
    {
      name: 'Interactive Brokers',
      commissionText: 'Desde €125/operación',
      affiliateUrl: 'https://ibkr.com?ref=etfnexo',
      logo: '/logos/ibkr.svg'
    }
  ]}
/>
```

---

### Estructura de Carpetas Actualizada

```
frontend/
├── app/
│   ├── etf/
│   │   └── [isin]/
│   │       └── page.tsx          # ← Ficha individual ETF
│   └── comparador/                # ← FASE 2 (no MVP)
│       └── page.tsx
│
├── components/
│   ├── etf/                       # ← NUEVO
│   │   ├── ETFHeader.tsx
│   │   ├── PeriodTabs.tsx
│   │   ├── PriceChart.tsx
│   │   ├── PerformanceGrid.tsx
│   │   ├── ScoreRing.tsx
│   │   ├── TechnicalDataTable.tsx
│   │   └── WhereToBuy.tsx         # ← CLAVE MONETIZACIÓN
│   │
│   ├── ui/
│   └── ...
│
└── lib/
    ├── charts.ts                  # Helpers Recharts
    └── affiliates.ts              # Tracking afiliados
```

---

## 🎨 Implementación Componente "Dónde Comprar"

### Código React Component

**`components/etf/WhereToBuy.tsx`**:

```typescript
'use client'

import { useState } from 'react'
import Image from 'next/image'

interface Broker {
  name: string
  commissionText: string
  affiliateUrl: string
  logo: string
  featured?: boolean
}

interface WhereToBuyProps {
  brokers: Broker[]
}

export function WhereToBuy({ brokers }: WhereToBuyProps) {
  const [clickedBroker, setClickedBroker] = useState<string | null>(null)

  const handleClick = (broker: Broker) => {
    // Track affiliate click
    trackAffiliateClick(broker.name)
    setClickedBroker(broker.name)

    // Open in new tab
    window.open(broker.affiliateUrl, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Dónde comprar</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          Patrocinado
        </span>
      </div>

      <div className="space-y-3">
        {brokers.map((broker) => (
          <div
            key={broker.name}
            className={`
              border rounded-lg p-3 transition-all cursor-pointer
              hover:border-blue-500 hover:shadow-sm
              ${broker.featured ? 'border-blue-200 bg-blue-50' : ''}
            `}
            onClick={() => handleClick(broker)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <Image
                  src={broker.logo}
                  alt={broker.name}
                  width={40}
                  height={40}
                  className="rounded"
                />
                <div>
                  <p className="font-semibold text-sm">{broker.name}</p>
                  <p className="text-xs text-gray-600">
                    {broker.commissionText}
                  </p>
                </div>
              </div>

              <button
                className="
                  px-4 py-2 bg-white border border-gray-300
                  rounded-md text-sm font-medium
                  hover:bg-gray-50 transition-colors
                "
              >
                Abrir cuenta
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        Enlace de afiliado · ETFNexo puede recibir comisión
      </p>
    </div>
  )
}

// Track affiliate clicks (analytics)
function trackAffiliateClick(brokerName: string) {
  // Enviar a Supabase o analytics
  fetch('/api/affiliates/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      broker: brokerName,
      timestamp: new Date().toISOString(),
      referrer: window.location.href
    })
  })

  // Google Analytics
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'affiliate_click', {
      broker_name: brokerName
    })
  }
}
```

---

### API Route para Tracking

**`app/api/affiliates/track/route.ts`**:

```typescript
import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { broker, timestamp, referrer } = body

    const supabase = createClient()

    // Guardar click en DB
    const { error } = await supabase
      .from('affiliate_clicks')
      .insert({
        broker_name: broker,
        clicked_at: timestamp,
        referrer_url: referrer,
        user_ip: request.headers.get('x-forwarded-for') || 'unknown'
      })

    if (error) throw error

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error tracking affiliate click:', error)
    return NextResponse.json({ error: 'Failed to track' }, { status: 500 })
  }
}
```

---

### Schema DB para Afiliados

```sql
-- Nueva tabla para tracking de afiliados
CREATE TABLE affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_name TEXT NOT NULL,
  clicked_at TIMESTAMPTZ NOT NULL,
  referrer_url TEXT,
  user_ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de conversiones (si bróker proporciona API)
CREATE TABLE affiliate_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  broker_name TEXT NOT NULL,
  conversion_date DATE NOT NULL,
  commission_amount DECIMAL(10,2),
  status TEXT, -- 'pending', 'confirmed', 'paid'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_affiliate_clicks_broker ON affiliate_clicks(broker_name);
CREATE INDEX idx_affiliate_clicks_date ON affiliate_clicks(clicked_at);
```

---

## 📊 Dashboard de Afiliados (Fase 2)

**Métricas clave a trackear**:

```typescript
// app/admin/affiliates/page.tsx
interface AffiliateMetrics {
  broker: string
  clicks: number
  conversions: number
  conversionRate: number
  revenue: number
  ctr: number // Click-through rate desde fichas ETF
}

// Query ejemplo
const metrics = await supabase.rpc('get_affiliate_metrics', {
  date_from: '2026-05-01',
  date_to: '2026-05-31'
})
```

**Dashboard visual**:
- Clicks por bróker (gráfico barras)
- Conversión rate (%)
- Revenue acumulado (€)
- ETFs más clicados (Top 10)

---

## 🎯 Priorización Final MVP

### Alcance MVP Actualizado (12 semanas)

**✅ INCLUIR**:
1. **Ranking Top 50** (ya planeado)
2. **Ficha Individual ETF** (versión simplificada):
   - Header navy completo
   - Gráfico + 4 periodos (1S, 1M, YTD, 1A)
   - Rendimiento histórico (4 cifras)
   - ETFNexo Score con anillo
   - Datos técnicos completos
   - **Dónde comprar** (3 brókers)
3. **Academia** (3 artículos)
4. **Newsletter** signup
5. **Directorio gestoras** (5 iniciales)

**❌ NO INCLUIR** (Mover a Fase 2):
- Comparador de ETFs (completo)
- Top 10 holdings (en ficha individual)
- Diversificación geográfica
- Foros integrados (usar Discord)
- Tabs 3A, 5A (solo 4 periodos)

---

## 💻 Código de Ejemplo - Página Ficha ETF

**`app/etf/[isin]/page.tsx`** (MVP):

```typescript
import { ETFHeader } from '@/components/etf/ETFHeader'
import { PeriodTabs } from '@/components/etf/PeriodTabs'
import { PriceChart } from '@/components/etf/PriceChart'
import { PerformanceGrid } from '@/components/etf/PerformanceGrid'
import { ScoreRing } from '@/components/etf/ScoreRing'
import { TechnicalDataTable } from '@/components/etf/TechnicalDataTable'
import { WhereToBuy } from '@/components/etf/WhereToBuy'
import { createClient } from '@/lib/supabase'

export default async function ETFPage({ params }: { params: { isin: string } }) {
  const supabase = createClient()

  // Fetch ETF data
  const { data: etf } = await supabase
    .from('etfs')
    .select(`
      *,
      fund_manager:fund_managers(*),
      weekly_ranking:weekly_rankings(*)
    `)
    .eq('isin', params.isin)
    .single()

  if (!etf) {
    return <div>ETF no encontrado</div>
  }

  // Fetch price history (último mes para gráfico)
  const { data: priceHistory } = await supabase
    .from('etf_price_history')
    .select('date, nav_price')
    .eq('etf_id', etf.id)
    .gte('date', getDateDaysAgo(30))
    .order('date', { ascending: true })

  // Brokers configurados
  const brokers = [
    {
      name: 'DEGIRO',
      commissionText: 'Desde €1/operación',
      affiliateUrl: `https://degiro.com?ref=etfnexo&isin=${params.isin}`,
      logo: '/logos/degiro.svg',
      featured: true
    },
    {
      name: 'XTB',
      commissionText: 'Sin comisión hasta €100K/mes',
      affiliateUrl: `https://xtb.com?ref=etfnexo&isin=${params.isin}`,
      logo: '/logos/xtb.svg'
    },
    {
      name: 'Interactive Brokers',
      commissionText: 'Desde €125/operación',
      affiliateUrl: `https://ibkr.com?ref=etfnexo&isin=${params.isin}`,
      logo: '/logos/ibkr.svg'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navy */}
      <ETFHeader
        isin={etf.isin}
        name={etf.name}
        ticker={etf.ticker}
        fundManager={etf.fund_manager.name}
        fundManagerLogo={etf.fund_manager.logo_url}
        navPrice={etf.nav_price}
        navDate={etf.nav_date}
        changeWeek={calculateWeekChange(etf)}
        changeWeekPercent={etf.return_1w}
        badges={getBadges(etf)}
        indexName={etf.index_name}
      />

      {/* Main Content - 2 Columns */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-6">

            {/* Period Tabs */}
            <PeriodTabs
              periods={['1S', '1M', 'YTD', '1A']}
              defaultPeriod="1S"
            />

            {/* Price Chart */}
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="text-lg font-semibold mb-4">Evolución del precio</h3>
              <PriceChart
                data={priceHistory}
                height={300}
              />
            </div>

            {/* Performance Grid */}
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="text-lg font-semibold mb-4">Rendimiento histórico</h3>
              <PerformanceGrid
                returns={{
                  '1_week': etf.return_1w,
                  '1_month': etf.return_1m,
                  'ytd': etf.return_ytd,
                  '1_year': etf.return_1y
                }}
              />
            </div>

            {/* TODO Fase 2: Top 10 Holdings */}
            {/* TODO Fase 2: Diversificación geográfica */}
            {/* TODO Fase 2: Opiniones comunidad */}

          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-6">

            {/* ETFNexo Score */}
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="text-lg font-semibold mb-4">ETFNexo Score</h3>
              <ScoreRing
                score={etf.weekly_ranking?.score || 0}
                size="large"
                showBreakdown={true}
                breakdown={{
                  performance: etf.weekly_ranking?.score_performance || 0,
                  cost: etf.weekly_ranking?.score_cost || 0,
                  liquidity: etf.weekly_ranking?.score_liquidity || 0,
                  community: 75 // Placeholder
                }}
              />
            </div>

            {/* Technical Data */}
            <div className="bg-white rounded-lg p-6 border">
              <h3 className="text-lg font-semibold mb-4">Datos técnicos</h3>
              <TechnicalDataTable data={etf} />
            </div>

            {/* ¡CLAVE! - Where to Buy */}
            <WhereToBuy brokers={brokers} />

          </div>
        </div>
      </div>
    </div>
  )
}

// Helpers
function getDateDaysAgo(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() - days)
  return date.toISOString().split('T')[0]
}

function calculateWeekChange(etf: any): number {
  return etf.nav_price * (etf.return_1w / 100)
}

function getBadges(etf: any): string[] {
  const badges = []
  if (etf.weekly_ranking?.rank <= 10) badges.push('Top 10')
  if (etf.distribution_policy === 'Accumulating') badges.push('Acumulación')
  if (etf.replication_method) badges.push(etf.replication_method)
  return badges
}
```

---

## 📅 Timeline Actualizado (12 Semanas MVP)

### Semanas 1-2: Fundación (sin cambios)
- Setup Supabase, Vercel, Dominio
- Schema DB + componentes UI base

### Semanas 3-4: Datos (sin cambios)
- Scrapers (iShares, Vanguard, Amundi)
- 120 ETFs iniciales

### Semanas 5-6: **Ficha Individual ETF** (NUEVO FOCUS)
- [ ] Componentes: ETFHeader, PeriodTabs, PriceChart
- [ ] Componentes: PerformanceGrid, ScoreRing
- [ ] Componente: TechnicalDataTable
- [ ] **Componente: WhereToBuy** (afiliados)
- [ ] API route `/api/affiliates/track`
- [ ] Página `/etf/[isin]` completa
- [ ] Integración con Supabase
- [ ] Test con 10 ETFs reales

### Semanas 7-8: Ranking + Academia (sin cambios)
- Página ranking
- 3 artículos Academia
- Newsletter signup

### Semanas 9-10: Brókers + Legal
- [ ] **Contactar 5 brókers** para afiliación:
  - DEGIRO, XTB, Interactive Brokers, Trade Republic, MyInvestor
- [ ] Configurar links de afiliado
- [ ] Disclaimers legales (afiliación)
- [ ] Testing E2E

### Semanas 11-12: Beta + Lanzamiento
- Beta privada 50 usuarios
- Ajustes UX
- Pitch gestoras + **pitch brókers**
- 🚀 Lanzamiento

---

## 💰 Estrategia de Monetización Brókers

### Outreach a Brókers (Semana 9)

**Email Template**:

```
Asunto: Partnership de afiliación - ETFNexo

Hola [Nombre],

Me llamo [Tu nombre] y estoy lanzando ETFNexo, la primera plataforma
de ranking y comunidad de ETFs en español.

**Nuestra audiencia**:
- Target mes 6: 5,000 usuarios/mes viendo fichas de ETFs individuales
- Perfil: Inversores activos en ETFs, alta intención de compra
- Geografía: España (70%), LATAM (30%)

**Oportunidad para [Bróker]**:
Módulo "Dónde comprar" en cada ficha de ETF (170+ ETFs iniciales):
- Posición destacada con logo y CTA "Abrir cuenta"
- Link de afiliado con tracking transparente
- Disclosure completo para usuarios

**Propuesta**:
¿Tienen programa de afiliados activo? Me gustaría explorar una
partnership donde ambos ganemos.

¿Podríamos agendar una call de 15 min esta semana?

Saludos,
[Tu nombre]
Fundador, ETFNexo
hola@etfnexo.com
```

### Brókers Objetivo (Prioridad)

1. **DEGIRO** (prioridad alta)
   - Programa afiliados establecido
   - Popular en España
   - Comisiones bajas

2. **XTB** (prioridad alta)
   - 0% comisión hasta €100K
   - Marketing activo
   - Programa afiliados activo

3. **Interactive Brokers** (prioridad media)
   - Profesional
   - Comisiones más altas
   - Buen programa afiliados

4. **Trade Republic** (prioridad media)
   - Nuevo en España
   - 0% comisión
   - Programa afiliados en desarrollo

5. **MyInvestor** (prioridad baja)
   - Banco español
   - Menos conocido
   - Posible partnership directo

---

## 🎯 Resumen Ejecutivo

### Cambios Clave Post-Integración Diseños

| Aspecto | Antes | Después |
|---------|-------|---------|
| **Ingresos mes 6** | €1,500 | €5,000 (+233%) |
| **Fuentes ingreso** | 3 (gestoras, membresías, eventos) | 4 (+afiliación brókers) |
| **Comparador** | En MVP | Movido a Fase 2 |
| **Ficha ETF** | Básica | Completa con monetización |
| **Componentes UI** | 6 | 13 (+7 nuevos) |

### Decisiones Estratégicas

1. ✅ **Priorizar ficha individual** sobre comparador
2. ✅ **Agregar afiliación brókers** como fuente clave de ingresos
3. ✅ **Simplificar MVP** moviendo features complejas a Fase 2
4. ✅ **Mantener timeline 12 semanas** con alcance más realista

### Próximos Pasos Inmediatos

**Esta semana**:
1. Crear cuentas Supabase + Vercel (usuario ya haciendo ✅)
2. Revisar este documento de integración
3. Decidir si aprobar cambios al plan MVP

**Semana próxima** (si apruebas cambios):
1. Actualizar `PLAN_MVP_ECONOMICO.md` con nuevas features
2. Crear componentes UI base (ETFHeader, ScoreRing, WhereToBuy)
3. Iniciar outreach gestoras + brókers en paralelo

---

**¿Aprobar cambios?** Confirma y actualizo todos los documentos del plan.

**Última actualización**: Junio 2026
**Versión**: 2.0 (Post-integración diseños)
