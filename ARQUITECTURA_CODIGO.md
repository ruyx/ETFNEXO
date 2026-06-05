# 🏗️ ETF Nexo - Arquitectura de Código MVP

## 📁 Estructura de Proyecto

```
etfnexo/
├── frontend/                    # Next.js App (deploy en Vercel)
│   ├── app/
│   │   ├── layout.tsx          # Layout principal + metadata SEO
│   │   ├── page.tsx            # Home (/)
│   │   ├── ranking/
│   │   │   └── page.tsx        # Ranking completo
│   │   ├── etf/
│   │   │   └── [isin]/
│   │   │       └── page.tsx    # Ficha individual ETF
│   │   ├── gestoras/
│   │   │   └── page.tsx        # Directorio gestoras
│   │   ├── academia/
│   │   │   ├── page.tsx        # Index academia
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # Artículo individual
│   │   ├── newsletter/
│   │   │   └── page.tsx        # Landing suscripción
│   │   └── api/
│   │       ├── ranking/
│   │       │   └── route.ts    # API ranking
│   │       └── newsletter/
│   │           └── subscribe/
│   │               └── route.ts # API suscripción
│   ├── components/
│   │   ├── ui/                 # Componentes base (Shadcn/ui)
│   │   ├── ETFCard.tsx
│   │   ├── ScoreBadge.tsx
│   │   ├── RankingTable.tsx
│   │   ├── NewsletterCTA.tsx
│   │   └── GestoraLogo.tsx
│   ├── lib/
│   │   ├── supabase.ts         # Cliente Supabase
│   │   ├── types.ts            # TypeScript interfaces
│   │   └── utils.ts            # Utilidades
│   ├── styles/
│   │   └── globals.css         # Tailwind + custom CSS
│   ├── public/
│   │   ├── images/
│   │   └── logos/              # Logos gestoras
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json
│
├── scrapers/                    # Python scrapers (VPS Hostinger)
│   ├── config/
│   │   ├── settings.py         # Config general
│   │   └── fund_managers.yaml  # URLs y selectores por gestora
│   ├── ishares/
│   │   ├── scraper.py
│   │   └── parser.py
│   ├── vanguard/
│   │   ├── scraper.py
│   │   └── parser.py
│   ├── amundi/
│   │   ├── scraper.py
│   │   └── parser.py
│   ├── common/
│   │   ├── base_scraper.py     # Clase base
│   │   ├── db.py               # Conexión Supabase
│   │   └── utils.py
│   ├── yahoo/
│   │   └── nav_prices.py       # Yahoo Finance API
│   ├── ranking/
│   │   └── calculate.py        # Cálculo ranking semanal
│   ├── run_all.py              # Ejecutar todos los scrapers
│   ├── requirements.txt
│   └── Dockerfile              # Opcional: contenedor
│
├── database/
│   ├── schema.sql              # Schema PostgreSQL completo
│   ├── migrations/
│   │   └── 001_initial.sql
│   └── seed/
│       ├── fund_managers.sql   # Seed gestoras iniciales
│       └── etfs_sample.sql     # ETFs ejemplo testing
│
├── scripts/
│   ├── deploy.sh               # Deploy frontend a Vercel
│   ├── setup_vps.sh            # Setup VPS Hostinger
│   └── backup_db.sh            # Backup Supabase
│
└── docs/
    ├── PLAN_MVP_ECONOMICO.md   # Este documento
    ├── ARQUITECTURA_CODIGO.md  # Arquitectura técnica
    └── API.md                  # Documentación API
```

---

## 🔧 Configuración Inicial

### 1. Setup Supabase

```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar proyecto
supabase init

# Crear proyecto en Supabase Dashboard
# Copiar PROJECT_URL y ANON_KEY
```

**Archivo `.env.local`** (frontend):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... # Solo backend
```

**Ejecutar schema**:
```bash
psql -h db.xxxxx.supabase.co \
     -U postgres \
     -d postgres \
     -f database/schema.sql
```

### 2. Setup Next.js Frontend

```bash
cd frontend

# Crear proyecto Next.js
npx create-next-app@latest . --typescript --tailwind --app

# Instalar dependencias
npm install @supabase/supabase-js
npm install @radix-ui/react-icons
npm install recharts
npm install clsx tailwind-merge
npm install date-fns
```

**`frontend/tsconfig.json`**:
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### 3. Setup Python Scrapers (VPS)

```bash
# En VPS Hostinger
ssh root@tu-vps-ip

# Instalar Python 3.11
apt update
apt install python3.11 python3.11-venv python3-pip

# Crear virtualenv
cd /opt
mkdir etfnexo
cd etfnexo
python3.11 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install playwright beautifulsoup4 yfinance supabase pydantic python-dotenv

# Setup Playwright
playwright install chromium
playwright install-deps
```

**`scrapers/requirements.txt`**:
```txt
playwright==1.40.0
beautifulsoup4==4.12.2
yfinance==0.2.32
supabase==2.3.0
pydantic==2.5.0
python-dotenv==1.0.0
requests==2.31.0
lxml==4.9.3
```

**`scrapers/.env`**:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGc...
LOG_LEVEL=INFO
```

---

## 💾 Modelos de Datos (TypeScript)

**`frontend/lib/types.ts`**:
```typescript
export interface FundManager {
  id: string
  name: string
  slug: string
  website: string
  logo_url: string
  verified: boolean
  created_at: string
}

export interface ETF {
  id: string
  isin: string
  name: string
  ticker: string | null
  fund_manager_id: string
  fund_manager?: FundManager // Join

  // Financiero
  nav_price: number | null
  nav_date: string | null
  ter: number
  aum_millions: number | null

  // Rendimientos (%)
  return_1w: number | null
  return_1m: number | null
  return_ytd: number | null
  return_1y: number | null
  return_3y: number | null

  // Características
  index_name: string | null
  replication_method: 'Physical' | 'Synthetic' | 'Sampling' | null
  distribution_policy: 'Accumulating' | 'Distributing' | null
  domicile: string | null
  currency: string

  // Metadata
  kid_url: string | null
  data_updated_at: string | null
  created_at: string
}

export interface WeeklyRanking {
  id: string
  week_number: number
  year: number
  etf_id: string
  etf?: ETF // Join
  rank: number
  score: number

  // Componentes score
  score_performance: number
  score_cost: number
  score_liquidity: number

  created_at: string
}

export interface FeaturedETF {
  id: string
  week_number: number
  year: number
  etf_id: string
  etf?: ETF // Join
  editorial_summary: string
  why_featured: string
  published_at: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  subscribed_at: string
  source: 'home' | 'academia' | 'ranking' | 'gestoras'
  active: boolean
}
```

---

## 🎨 Componentes UI Clave

### 1. ETFCard Component

**`frontend/components/ETFCard.tsx`**:
```typescript
import { ETF } from '@/lib/types'
import { ScoreBadge } from './ScoreBadge'
import { GestoraLogo } from './GestoraLogo'
import Link from 'next/link'

interface ETFCardProps {
  etf: ETF & { rank?: number; score?: number }
  showRank?: boolean
}

export function ETFCard({ etf, showRank = false }: ETFCardProps) {
  const return1YColor = (etf.return_1y ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'

  return (
    <Link href={`/etf/${etf.isin}`}>
      <div className="border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {showRank && etf.rank && (
              <span className="text-sm font-bold text-gray-500">#{etf.rank}</span>
            )}
            <h3 className="font-semibold text-lg text-gray-900 mt-1">
              {etf.name}
            </h3>
            <p className="text-sm text-gray-600">
              {etf.ticker} · {etf.fund_manager?.name}
            </p>

            <div className="mt-3 grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-500">TER</p>
                <p className="font-semibold">{etf.ter.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Rent. 1A</p>
                <p className={`font-semibold ${return1YColor}`}>
                  {etf.return_1y ? `${etf.return_1y.toFixed(2)}%` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">AUM</p>
                <p className="font-semibold">
                  €{((etf.aum_millions ?? 0) / 1000).toFixed(1)}B
                </p>
              </div>
            </div>
          </div>

          {etf.score !== undefined && (
            <ScoreBadge score={etf.score} />
          )}
        </div>
      </div>
    </Link>
  )
}
```

### 2. ScoreBadge Component

**`frontend/components/ScoreBadge.tsx`**:
```typescript
interface ScoreBadgeProps {
  score: number // 0-100
  size?: 'sm' | 'md' | 'lg'
}

export function ScoreBadge({ score, size = 'md' }: ScoreBadgeProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-base',
    lg: 'w-20 h-20 text-lg'
  }

  const colorClass = score >= 80
    ? 'bg-green-100 text-green-700 border-green-300'
    : score >= 60
    ? 'bg-yellow-100 text-yellow-700 border-yellow-300'
    : 'bg-gray-100 text-gray-700 border-gray-300'

  return (
    <div className={`
      ${sizeClasses[size]}
      ${colorClass}
      rounded-full border-2 flex items-center justify-center font-bold
    `}>
      {score}
    </div>
  )
}
```

### 3. RankingTable Component

**`frontend/components/RankingTable.tsx`**:
```typescript
import { WeeklyRanking } from '@/lib/types'
import { ETFCard } from './ETFCard'

interface RankingTableProps {
  rankings: (WeeklyRanking & { etf: ETF })[]
  limit?: number
}

export function RankingTable({ rankings, limit }: RankingTableProps) {
  const displayRankings = limit ? rankings.slice(0, limit) : rankings

  return (
    <div className="space-y-3">
      {displayRankings.map((ranking) => (
        <ETFCard
          key={ranking.id}
          etf={{ ...ranking.etf, rank: ranking.rank, score: ranking.score }}
          showRank={true}
        />
      ))}
    </div>
  )
}
```

---

## 🔌 API Routes (Next.js)

### 1. Ranking API

**`frontend/app/api/ranking/route.ts`**:
```typescript
import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const limit = parseInt(searchParams.get('limit') ?? '50')
  const category = searchParams.get('category') // 'equity', 'bond', etc.

  const supabase = createClient()

  // Obtener semana actual
  const now = new Date()
  const weekNumber = getWeekNumber(now)
  const year = now.getFullYear()

  let query = supabase
    .from('weekly_rankings')
    .select(`
      *,
      etf:etfs(
        *,
        fund_manager:fund_managers(*)
      )
    `)
    .eq('week_number', weekNumber)
    .eq('year', year)
    .order('rank', { ascending: true })
    .limit(limit)

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data, week: weekNumber, year })
}

function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}
```

### 2. Newsletter Subscribe API

**`frontend/app/api/newsletter/subscribe/route.ts`**:
```typescript
import { createClient } from '@/lib/supabase'
import { NextResponse } from 'next/server'
import { z } from 'zod'

const subscribeSchema = z.object({
  email: z.string().email(),
  source: z.enum(['home', 'academia', 'ranking', 'gestoras']).default('home')
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, source } = subscribeSchema.parse(body)

    const supabase = createClient()

    // Insertar subscriber (upsert para evitar duplicados)
    const { data, error } = await supabase
      .from('newsletter_subscribers')
      .upsert(
        { email, source, active: true },
        { onConflict: 'email' }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // TODO: Enviar email de confirmación (Resend API)

    return NextResponse.json({
      success: true,
      message: 'Suscripción exitosa'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
```

---

## 🐍 Python Scrapers

### 1. Base Scraper Class

**`scrapers/common/base_scraper.py`**:
```python
from abc import ABC, abstractmethod
from playwright.sync_api import sync_playwright, Page
import logging
from typing import List, Dict
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class BaseScraper(ABC):
    def __init__(self, fund_manager_name: str):
        self.fund_manager_name = fund_manager_name
        self.playwright = None
        self.browser = None
        self.page: Page | None = None

    def __enter__(self):
        self.playwright = sync_playwright().start()
        self.browser = self.playwright.chromium.launch(
            headless=True,
            args=['--disable-dev-shm-usage']  # Para VPS con poca RAM
        )
        self.page = self.browser.new_page()
        self.page.set_default_timeout(30000)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.browser:
            self.browser.close()
        if self.playwright:
            self.playwright.stop()

    @abstractmethod
    def get_etf_list_url(self) -> str:
        """URL de la lista de ETFs de la gestora"""
        pass

    @abstractmethod
    def scrape_etf_data(self, isin: str) -> Dict:
        """Scrape datos de un ETF específico"""
        pass

    def run(self, isin_list: List[str]) -> List[Dict]:
        """
        Ejecuta el scraper para una lista de ISINs
        Retorna lista de datos de ETFs
        """
        results = []

        logger.info(f"Iniciando scraping de {len(isin_list)} ETFs de {self.fund_manager_name}")

        for i, isin in enumerate(isin_list, 1):
            try:
                logger.info(f"[{i}/{len(isin_list)}] Scrapeando {isin}...")
                data = self.scrape_etf_data(isin)
                data['isin'] = isin
                data['scraped_at'] = datetime.utcnow().isoformat()
                results.append(data)

                # Rate limiting: esperar 3-5 segundos entre requests
                import random, time
                time.sleep(random.uniform(3, 5))

            except Exception as e:
                logger.error(f"Error scraping {isin}: {e}")
                continue

        logger.info(f"Scraping completado. {len(results)} ETFs procesados exitosamente")
        return results
```

### 2. iShares Scraper Example

**`scrapers/ishares/scraper.py`**:
```python
from common.base_scraper import BaseScraper
from typing import Dict
import re

class ISharesScraper(BaseScraper):
    BASE_URL = "https://www.ishares.com/es"

    def __init__(self):
        super().__init__("iShares")

    def get_etf_list_url(self) -> str:
        return f"{self.BASE_URL}/productos/etf-investments"

    def scrape_etf_data(self, isin: str) -> Dict:
        """
        Scrape datos de un ETF de iShares
        """
        # Construir URL del ETF
        url = f"{self.BASE_URL}/es/productos/{isin}"

        self.page.goto(url)
        self.page.wait_for_load_state('networkidle')

        data = {
            'name': self._get_name(),
            'ter': self._get_ter(),
            'aum_millions': self._get_aum(),
            'return_ytd': self._get_return('ytd'),
            'return_1y': self._get_return('1y'),
            'index_name': self._get_index_name(),
            'replication_method': self._get_replication_method(),
            'distribution_policy': self._get_distribution_policy(),
            'kid_url': self._get_kid_url()
        }

        return data

    def _get_name(self) -> str:
        selector = 'h1.product-name'
        element = self.page.query_selector(selector)
        return element.inner_text().strip() if element else None

    def _get_ter(self) -> float:
        # Ejemplo: buscar "TER: 0.20%"
        text = self.page.inner_text('body')
        match = re.search(r'TER[:\s]+([\d.]+)%', text, re.IGNORECASE)
        return float(match.group(1)) if match else None

    def _get_aum(self) -> float:
        # Implementación específica para iShares
        # ...
        pass

    def _get_return(self, period: str) -> float:
        # Implementación específica para iShares
        # period: 'ytd', '1y', '3y'
        # ...
        pass

    # ... otros métodos _get_*
```

### 3. Ranking Calculator

**`scrapers/ranking/calculate.py`**:
```python
import os
from datetime import datetime, timedelta
from common.db import get_supabase_client
import logging
import math

logger = logging.getLogger(__name__)

def calculate_weekly_ranking():
    """
    Calcula el ranking semanal de ETFs
    Ejecutar cada lunes a las 6:00 AM
    """
    supabase = get_supabase_client()

    # Obtener semana actual
    now = datetime.utcnow()
    week_number = now.isocalendar()[1]
    year = now.year

    logger.info(f"Calculando ranking para semana {week_number} de {year}")

    # Obtener todos los ETFs con datos completos
    response = supabase.table('etfs').select('*').execute()
    etfs = response.data

    # Filtrar ETFs con datos suficientes
    valid_etfs = [
        etf for etf in etfs
        if etf.get('return_1y') is not None
        and etf.get('ter') is not None
        and etf.get('aum_millions') is not None
    ]

    logger.info(f"ETFs válidos para ranking: {len(valid_etfs)}")

    # Calcular score para cada ETF
    scored_etfs = []
    for etf in valid_etfs:
        score_data = calculate_etf_score(etf)
        scored_etfs.append({
            'etf_id': etf['id'],
            'score': score_data['total'],
            'score_performance': score_data['performance'],
            'score_cost': score_data['cost'],
            'score_liquidity': score_data['liquidity']
        })

    # Ordenar por score descendente
    scored_etfs.sort(key=lambda x: x['score'], reverse=True)

    # Asignar ranks
    for i, etf_score in enumerate(scored_etfs, 1):
        etf_score['rank'] = i
        etf_score['week_number'] = week_number
        etf_score['year'] = year

    # Guardar en weekly_rankings (delete + insert)
    supabase.table('weekly_rankings') \
        .delete() \
        .eq('week_number', week_number) \
        .eq('year', year) \
        .execute()

    supabase.table('weekly_rankings').insert(scored_etfs).execute()

    logger.info(f"Ranking calculado y guardado. Top ETF: {scored_etfs[0]}")

    return scored_etfs

def calculate_etf_score(etf: dict) -> dict:
    """
    Calcula el score 0-100 de un ETF según fórmula ETF Nexo
    """
    # 1. Score Performance (35%) - basado en Sharpe simplificado
    return_1y = etf.get('return_1y', 0) / 100  # Convertir % a decimal
    risk_free_rate = 0.02  # 2% asumido
    volatility = 0.15  # Asumir 15% si no tenemos datos (TODO: calcular real)

    sharpe = (return_1y - risk_free_rate) / volatility if volatility > 0 else 0
    score_performance = normalize(sharpe, min_val=-1, max_val=2) * 35

    # 2. Score Cost (25%) - TER más bajo = mejor
    ter = etf.get('ter', 1.0) / 100  # % a decimal
    score_cost = (1 - min(ter, 0.01) / 0.01) * 25

    # 3. Score Liquidity (20%) - AUM mayor = mejor
    aum = etf.get('aum_millions', 10)
    score_liquidity = normalize(math.log10(max(aum, 1)), min_val=1, max_val=4) * 20

    # 4. Score Quality (20%) - Placeholder (TODO: valoración comunidad)
    score_quality = 15  # Neutral para MVP

    total = round(score_performance + score_cost + score_liquidity + score_quality)

    return {
        'performance': round(score_performance),
        'cost': round(score_cost),
        'liquidity': round(score_liquidity),
        'total': max(0, min(100, total))  # Clamp 0-100
    }

def normalize(value: float, min_val: float, max_val: float) -> float:
    """Normaliza un valor al rango 0-1"""
    if max_val == min_val:
        return 0.5
    return max(0, min(1, (value - min_val) / (max_val - min_val)))

if __name__ == '__main__':
    calculate_weekly_ranking()
```

---

## 🚀 Deployment

### 1. Deploy Frontend (Vercel)

```bash
cd frontend

# Conectar con Vercel
vercel login

# Deploy (primera vez)
vercel

# Deploy producción
vercel --prod
```

**Configurar variables de entorno en Vercel Dashboard**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### 2. Setup Scrapers en VPS

**`scripts/setup_vps.sh`**:
```bash
#!/bin/bash
set -e

echo "🚀 ETF Nexo - Setup VPS Hostinger"

# 1. Actualizar sistema
apt update && apt upgrade -y

# 2. Instalar Python 3.11
apt install -y python3.11 python3.11-venv python3-pip git

# 3. Crear directorio
mkdir -p /opt/etfnexo
cd /opt/etfnexo

# 4. Clonar repo (o subir archivos)
# git clone https://github.com/tu-usuario/etfnexo.git .

# 5. Setup virtualenv
python3.11 -m venv venv
source venv/bin/activate

# 6. Instalar dependencias
pip install -r scrapers/requirements.txt
playwright install chromium
playwright install-deps

# 7. Crear .env
cat > scrapers/.env <<EOF
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=tu_service_key_aqui
LOG_LEVEL=INFO
EOF

# 8. Setup cron jobs
cat > /etc/cron.d/etfnexo <<EOF
# ETF Nexo - Scrapers semanales (viernes 22:00)
0 22 * * 5 /opt/etfnexo/venv/bin/python /opt/etfnexo/scrapers/run_all.py >> /var/log/etfnexo_scrapers.log 2>&1

# ETF Nexo - Cálculo ranking (lunes 6:00)
0 6 * * 1 /opt/etfnexo/venv/bin/python /opt/etfnexo/scrapers/ranking/calculate.py >> /var/log/etfnexo_ranking.log 2>&1
EOF

chmod 644 /etc/cron.d/etfnexo

echo "✅ Setup completado"
echo "📝 No olvides editar scrapers/.env con tus credenciales"
```

### 3. Comandos Útiles

```bash
# Ver logs scrapers
tail -f /var/log/etfnexo_scrapers.log

# Ejecutar scraper manual
cd /opt/etfnexo
source venv/bin/activate
python scrapers/run_all.py

# Calcular ranking manual
python scrapers/ranking/calculate.py

# Ver cron jobs activos
crontab -l

# Reiniciar cron
systemctl restart cron
```

---

## 📊 Monitoreo y Analytics

### 1. Plausible Analytics (Self-Hosted)

```bash
# En VPS (requiere Docker)
docker run -d \
  --name plausible \
  -p 8000:8000 \
  -e SECRET_KEY_BASE=$(openssl rand -base64 64) \
  -e BASE_URL=https://analytics.etfnexo.com \
  plausible/analytics:latest
```

**Alternativa gratuita**: Google Analytics 4 (si no te molestan las cookies)

### 2. Uptime Monitoring

- [UptimeRobot](https://uptimerobot.com) (gratis, 50 monitores)
- [StatusCake](https://www.statuscake.com) (gratis tier)

Configurar:
- `https://etfnexo.com` → HTTP monitor cada 5 min
- `https://etfnexo.com/api/ranking` → API monitor

---

## 🔒 Seguridad

### 1. Rate Limiting API

**`frontend/middleware.ts`**:
```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const rateLimiter = new Map<string, number[]>()

export function middleware(request: NextRequest) {
  // Solo aplicar a API routes
  if (!request.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next()
  }

  const ip = request.ip ?? 'unknown'
  const now = Date.now()
  const limit = 10 // requests
  const window = 60 * 1000 // 1 minuto

  if (!rateLimiter.has(ip)) {
    rateLimiter.set(ip, [])
  }

  const timestamps = rateLimiter.get(ip)!
  const recentRequests = timestamps.filter(t => now - t < window)

  if (recentRequests.length >= limit) {
    return new NextResponse('Too Many Requests', { status: 429 })
  }

  recentRequests.push(now)
  rateLimiter.set(ip, recentRequests)

  return NextResponse.next()
}
```

### 2. Supabase RLS (Row Level Security)

```sql
-- Habilitar RLS en tablas sensibles
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Policy: solo admin puede leer subscribers
CREATE POLICY "Solo admins leen subscribers"
ON newsletter_subscribers
FOR SELECT
USING (auth.role() = 'service_role');

-- Policy: cualquiera puede insertarse (signup)
CREATE POLICY "Signup público"
ON newsletter_subscribers
FOR INSERT
WITH CHECK (true);
```

---

## 📝 Próximos Pasos

1. **Semana 1-2**: Copiar y adaptar este código base
2. **Semana 3-4**: Implementar scrapers específicos de cada gestora
3. **Semana 5-6**: Conectar frontend con Supabase y testear
4. **Semana 7-8**: Contenido Academia + SEO
5. **Semana 9-10**: Beta testing + ajustes
6. **Semana 11-12**: Deploy a producción

---

**¿Necesitas código adicional específico?** Puedo generar:
- Scraper completo para una gestora específica
- Componentes UI faltantes
- Tests E2E con Playwright
- Newsletter templates HTML
- Scripts de migración DB

**Última actualización**: Junio 2026
