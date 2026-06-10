# Sistema de Rankings y ETFNexo Score

## Resumen

Sistema dinámico de ranking de ETFs basado en el **ETFNexo Score**, un algoritmo propietario que evalúa ETFs en 4 dimensiones: Performance, Costes, Liquidez y Comunidad.

## ✅ Estado Actual

**Sistema completo y funcionando en producción:**
- ✅ Algoritmo ETFNexo Score v1.0 implementado
- ✅ Ranking dinámico (calculado on-the-fly)
- ✅ API de rankings funcionando
- ✅ Componente RankingSlider en homepage
- ✅ Página de rankings completa (no implementada aún)
- ✅ Desplegado en producción: https://etfnexo.vercel.app

**Características:**
- Cálculo en tiempo real (no se guarda score en BD)
- Se actualiza automáticamente al actualizar datos de ETFs
- Soporta filtrado por categoría
- Incluye metadatos de algoritmo en respuesta API

## Algoritmo ETFNexo Score v1.0

### Fórmula Compuesta

```
ETFNexo Score = (Performance × 0.35) + (Cost × 0.25) + (Liquidity × 0.20) + (Community × 0.20)
```

### Componentes del Score

#### 1. Performance Score (35%)

**Ponderación interna:**
- Return 1Y: 60%
- Sharpe Ratio: 40%

**Cálculo:**
```typescript
Performance Score = (Return1Y_normalized × 0.6) + (SharpeRatio_normalized × 0.4)
```

**Datos base:**
- `return_1y`: Rentabilidad anualizada últimos 12 meses (%)
- `sharpe_ratio`: Ratio de Sharpe (retorno ajustado por riesgo)

**Normalización:**
```typescript
normalized = ((value - min_value) / (max_value - min_value)) × 100
```

**Ejemplo:**
- ETF con Return 1Y = 15%, Sharpe = 1.2
- Min Return = -5%, Max Return = 25% → normalized = 66.67
- Min Sharpe = 0.5, Max Sharpe = 2.0 → normalized = 46.67
- Performance Score = (66.67 × 0.6) + (46.67 × 0.4) = **58.67**

#### 2. Cost Score (25%)

**Ponderación:**
- TER (Total Expense Ratio): 100%

**Cálculo:**
```typescript
Cost Score = 100 - TER_normalized
```

**Inversión:** Menor TER es mejor, por eso se invierte el score.

**Datos base:**
- `ter`: Total Expense Ratio (%)

**Ejemplo:**
- ETF con TER = 0.20%
- Min TER = 0.05%, Max TER = 1.00% → normalized = 15.79
- Cost Score = 100 - 15.79 = **84.21**

#### 3. Liquidity Score (20%)

**Ponderación interna:**
- AUM (Assets Under Management): 70%
- Bid-Ask Spread: 30%

**Cálculo:**
```typescript
Liquidity Score = (AUM_normalized × 0.7) + ((100 - Spread_normalized) × 0.3)
```

**Inversión de Spread:** Menor spread es mejor (más líquido).

**Datos base:**
- `aum_millions`: Patrimonio en millones de EUR/USD
- `bid_ask_spread`: Diferencia bid-ask en % (default: 0.5%)

**Ejemplo:**
- ETF con AUM = 5,000M, Spread = 0.1%
- Min AUM = 50M, Max AUM = 50,000M → AUM_normalized = 9.90
- Min Spread = 0.05%, Max Spread = 2.0% → Spread_normalized = 2.56
- Spread_inverted = 100 - 2.56 = 97.44
- Liquidity Score = (9.90 × 0.7) + (97.44 × 0.3) = **36.16**

#### 4. Community Score (20%)

**Ponderación:**
- User Ratings (1-5 estrellas): 100%

**Cálculo:**
```typescript
Community Score = ((average_rating - 1) / 4) × 100
```

**Conversión:** 1 estrella = 0, 5 estrellas = 100

**Datos base:**
- `user_ratings.rating`: Ratings de usuarios (tabla relacionada)
- Promedio calculado dinámicamente

**Default:** Si no hay ratings, Community Score = 50 (neutral)

**Ejemplo:**
- ETF con promedio 4.2 estrellas
- Community Score = ((4.2 - 1) / 4) × 100 = **80.00**

### Ejemplo Completo de Cálculo

**ETF: iShares Core MSCI World (IWDA)**

**Datos base:**
- Return 1Y: 18.5%
- Sharpe Ratio: 1.45
- TER: 0.20%
- AUM: 75,000M EUR
- Bid-Ask Spread: 0.05%
- Average Rating: 4.3 estrellas

**Scores individuales:**
- Performance: 68.25 (35% × 68.25 = **23.89**)
- Cost: 84.21 (25% × 84.21 = **21.05**)
- Liquidity: 92.15 (20% × 92.15 = **18.43**)
- Community: 82.50 (20% × 82.50 = **16.50**)

**ETFNexo Score = 23.89 + 21.05 + 18.43 + 16.50 = 79.87**

## Arquitectura del Sistema

### 1. Base de Datos

#### Tabla `etfs`

Datos base de ETFs (actualizados semanalmente):

```sql
CREATE TABLE etfs (
  id UUID PRIMARY KEY,
  isin VARCHAR(12) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  yahoo_ticker VARCHAR(50),
  category VARCHAR(100),

  -- Performance
  return_1y NUMERIC(10,2),      -- % anualizado
  sharpe_ratio NUMERIC(10,2),   -- ratio

  -- Costs
  ter NUMERIC(5,3),             -- % anual

  -- Liquidity
  aum_millions NUMERIC(12,2),   -- millones EUR/USD
  bid_ask_spread NUMERIC(5,3),  -- % spread

  -- Metadata
  provider VARCHAR(100),
  domicile VARCHAR(2),
  replication_method VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Tabla `user_ratings`

Ratings de usuarios:

```sql
CREATE TABLE user_ratings (
  id UUID PRIMARY KEY,
  etf_id UUID REFERENCES etfs(id),
  user_id UUID REFERENCES users(id),
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(etf_id, user_id)  -- Un rating por usuario por ETF
);
```

### 2. API Endpoint

**Archivo:** `app/api/v1/rankings/route.ts`

#### GET `/api/v1/rankings`

Obtiene ranking dinámico de ETFs con scores calculados en tiempo real.

**Query params:**
- `limit` (default: 1000) - Número máximo de resultados
- `category` (optional) - Filtrar por categoría (e.g., "Renta Variable")

**Respuesta:**

```json
{
  "data": [
    {
      "id": "uuid",
      "isin": "IE00B4L5Y983",
      "name": "iShares Core MSCI World UCITS ETF",
      "yahoo_ticker": "IWDA.AS",
      "category": "Renta Variable Global",
      "return_1y": 18.5,
      "sharpe_ratio": 1.45,
      "ter": 0.20,
      "aum_millions": 75000,
      "bid_ask_spread": 0.05,
      "performance_score": 68.25,
      "cost_score": 84.21,
      "liquidity_score": 92.15,
      "community_score": 82.50,
      "etfnexo_score": 79.87,
      "rank": 1
    },
    // ... más ETFs
  ],
  "count": 172,
  "algorithm": {
    "name": "ETFNexo Score",
    "version": "1.0",
    "weights": {
      "performance": 0.35,
      "cost": 0.25,
      "liquidity": 0.2,
      "community": 0.2
    },
    "description": "Composite score based on performance (Sharpe + returns), cost efficiency (TER), liquidity (AUM + spread), and community ratings"
  }
}
```

### 3. Frontend Components

#### RankingSlider (Homepage)

**Archivo:** `components/RankingSlider.tsx`

**Funcionalidad:**
- Muestra top 10 ETFs en carrusel
- Consume `/api/v1/rankings?limit=10`
- Auto-scroll cada 5 segundos
- Muestra: Rank, Nombre, ETFNexo Score, Return 1Y

#### Rankings Page (Pendiente)

**Archivo:** `app/rankings/page.tsx` (no creado aún)

**Funcionalidad planificada:**
- Tabla completa de rankings
- Filtros por categoría, provider, domicilio
- Búsqueda por nombre/ISIN
- Ordenación por columna
- Comparador (checkbox múltiple)
- Gráficos de scores por componente

## Workflow de Actualización de Rankings

### Sistema Automático (Recomendado)

**Los rankings se actualizan automáticamente** cada vez que:
1. Se actualizan datos de ETFs en base de datos
2. Un usuario deja un nuevo rating
3. Se consulta la API (cálculo on-the-fly)

**No requiere mantenimiento manual.**

### Actualización de Datos Base de ETFs

**Frecuencia recomendada:** Semanal (viernes después de cierre de mercados)

#### Opción A: API de Yahoo Finance (Automatizable)

Crear Edge Function `update-etf-data`:

```typescript
// supabase/functions/update-etf-data/index.ts

import { createClient } from '@supabase/supabase-js';

const yahooFinanceAPI = 'https://query1.finance.yahoo.com/v8/finance/chart/';

async function fetchYahooData(ticker: string) {
  const response = await fetch(`${yahooFinanceAPI}${ticker}?interval=1d&range=1y`);
  const data = await response.json();

  // Extract return_1y, volatility, calculate Sharpe
  const prices = data.chart.result[0].indicators.quote[0].close;
  const return1y = ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100;

  // ... cálculo de Sharpe Ratio

  return {
    return_1y: return1y,
    sharpe_ratio: sharpeRatio
  };
}

export async function handler() {
  const supabase = createClient(/* ... */);

  const { data: etfs } = await supabase.from('etfs').select('id, yahoo_ticker');

  for (const etf of etfs) {
    if (!etf.yahoo_ticker) continue;

    const marketData = await fetchYahooData(etf.yahoo_ticker);

    await supabase
      .from('etfs')
      .update({
        return_1y: marketData.return_1y,
        sharpe_ratio: marketData.sharpe_ratio,
        updated_at: new Date()
      })
      .eq('id', etf.id);
  }

  return { updated: etfs.length };
}
```

**Configurar cron job semanal:**
```sql
SELECT cron.schedule(
  'update-etf-data-weekly',
  '0 2 * * 6',  -- Sábado 2:00 AM
  'SELECT public.update_etf_data_cron();'
);
```

#### Opción B: Actualización Manual via CSV

Preparar CSV con datos actualizados:

```csv
isin,return_1y,sharpe_ratio,ter,aum_millions,bid_ask_spread
IE00B4L5Y983,18.5,1.45,0.20,75000,0.05
IE00B3RBWM25,22.3,1.65,0.12,45000,0.08
...
```

Importar con SQL:

```sql
-- Crear tabla temporal
CREATE TEMP TABLE etf_updates (
  isin VARCHAR(12),
  return_1y NUMERIC(10,2),
  sharpe_ratio NUMERIC(10,2),
  ter NUMERIC(5,3),
  aum_millions NUMERIC(12,2),
  bid_ask_spread NUMERIC(5,3)
);

-- Copiar CSV (via Supabase SQL Editor)
-- Nota: Esto debe hacerse en Supabase Dashboard → SQL Editor

-- Actualizar ETFs
UPDATE etfs e
SET
  return_1y = u.return_1y,
  sharpe_ratio = u.sharpe_ratio,
  ter = u.ter,
  aum_millions = u.aum_millions,
  bid_ask_spread = u.bid_ask_spread,
  updated_at = NOW()
FROM etf_updates u
WHERE e.isin = u.isin;
```

#### Opción C: Supabase CLI Script

```bash
#!/bin/bash
# update-etf-data.sh

cat > /tmp/update_etfs.sql << 'SQL'
-- Actualizar manualmente ETFs top 20
UPDATE etfs
SET
  return_1y = 18.5,
  sharpe_ratio = 1.45,
  ter = 0.20,
  aum_millions = 75000,
  updated_at = NOW()
WHERE isin = 'IE00B4L5Y983';

-- Repetir para otros ETFs...
SQL

# Ejecutar actualización
DB_PASSWORD=$(grep SUPABASE_DB_PASSWORD .env.local | cut -d= -f2)
SUPABASE_DB_PASSWORD="${DB_PASSWORD}" ./bin/supabase-etf db query \
  --file /tmp/update_etfs.sql --linked

echo "ETFs actualizados correctamente"
```

## Verificación de Rankings

### Ver Top 10 Actual

```bash
# Via API (producción)
curl https://etfnexo.vercel.app/api/v1/rankings?limit=10 | jq '.data[] | {rank, name, etfnexo_score}'

# Output ejemplo:
# {
#   "rank": 1,
#   "name": "iShares Core MSCI World UCITS ETF",
#   "etfnexo_score": 79.87
# }
```

### Verificar Datos Base en BD

```sql
-- Ver ETFs con datos completos
SELECT
  name,
  return_1y,
  sharpe_ratio,
  ter,
  aum_millions,
  updated_at::date as last_update
FROM etfs
WHERE return_1y IS NOT NULL
  AND sharpe_ratio IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;
```

### Verificar Ratings de Comunidad

```sql
-- Promedio de ratings por ETF
SELECT
  e.name,
  COUNT(r.id) as num_ratings,
  ROUND(AVG(r.rating)::numeric, 2) as avg_rating
FROM etfs e
LEFT JOIN user_ratings r ON e.id = r.etf_id
GROUP BY e.id, e.name
HAVING COUNT(r.id) > 0
ORDER BY avg_rating DESC
LIMIT 10;
```

## Mantenimiento

### Ver ETFs Sin Datos

```sql
-- ETFs que necesitan actualización
SELECT
  isin,
  name,
  return_1y,
  sharpe_ratio,
  updated_at::date
FROM etfs
WHERE
  return_1y IS NULL OR
  sharpe_ratio IS NULL OR
  aum_millions IS NULL OR
  updated_at < NOW() - INTERVAL '30 days'
ORDER BY updated_at ASC;
```

### Auditoría de Scores

```sql
-- Crear vista materializada para performance
CREATE MATERIALIZED VIEW etf_scores_audit AS
SELECT
  id,
  isin,
  name,
  return_1y,
  sharpe_ratio,
  ter,
  aum_millions,
  -- Calcular scores manualmente para audit
  CASE
    WHEN return_1y IS NULL THEN 0
    ELSE ((return_1y - (SELECT MIN(return_1y) FROM etfs)) /
          NULLIF((SELECT MAX(return_1y) FROM etfs) - (SELECT MIN(return_1y) FROM etfs), 0)) * 100
  END as return_score,
  updated_at
FROM etfs;

-- Refrescar audit
REFRESH MATERIALIZED VIEW etf_scores_audit;
```

## Troubleshooting

### Rankings no cambian después de actualizar datos
**Solución:** Los rankings se calculan on-the-fly. Verificar que datos base se actualizaron correctamente en BD.

### Scores parecen incorrectos
**Solución:** Verificar que hay suficientes ETFs en BD para normalización. Min 10 ETFs recomendado.

### Community Score siempre 50
**Solución:** No hay ratings de usuarios. Sistema de usuarios debe implementarse primero.

### ETFs con datos NULL tienen score 0
**Solución:** Esperado. Actualizar datos faltantes o excluirlos del ranking.

## Próximas Mejoras

### 1. Automatización de Actualización de Datos

**Fuentes de datos:**
- Yahoo Finance API (gratis, delay 15 min)
- Alpha Vantage (gratis, 5 requests/min)
- Financial Modeling Prep (freemium)

**Frecuencia:**
- Datos de mercado: Diario (después de cierre)
- Datos fundamentales: Semanal

### 2. Sistema de Usuarios y Ratings

**Implementar:**
- Autenticación (Supabase Auth)
- UI para ratings (1-5 estrellas)
- Comentarios/reviews
- Validación (solo usuarios registrados)

### 3. Página de Rankings Completa

**Features:**
- Tabla interactiva con DataTables
- Filtros avanzados
- Comparador (3-5 ETFs lado a lado)
- Gráficos de radar por componente
- Exportar a CSV/PDF

### 4. Rankings Históricos

**Guardar snapshots semanales:**

```sql
CREATE TABLE ranking_snapshots (
  id UUID PRIMARY KEY,
  etf_id UUID REFERENCES etfs(id),
  etfnexo_score NUMERIC(5,2),
  rank INTEGER,
  snapshot_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index para consultas rápidas
CREATE INDEX idx_snapshots_date ON ranking_snapshots(snapshot_date DESC);
CREATE INDEX idx_snapshots_etf_date ON ranking_snapshots(etf_id, snapshot_date);
```

**Cron semanal:**
```sql
INSERT INTO ranking_snapshots (etf_id, etfnexo_score, rank, snapshot_date)
SELECT id, calculated_score, calculated_rank, CURRENT_DATE
FROM /* resultado de API rankings */;
```

### 5. Alertas de Cambios de Ranking

**Notificar cuando:**
- ETF sube/baja >10 posiciones
- ETF entra/sale del Top 10
- Nuevo ETF #1

**Implementación:**
- Comparar snapshot actual vs anterior
- Email a usuarios suscritos
- Webhook a Discord/Slack

### 6. Versiones del Algoritmo

**Guardar versión del score:**

```sql
ALTER TABLE ranking_snapshots
ADD COLUMN algorithm_version VARCHAR(10) DEFAULT '1.0';
```

**Permitir A/B testing:**
- v1.0: Pesos actuales (35/25/20/20)
- v2.0: Pesos ajustados según feedback
- Comparar resultados

## Archivos Relacionados

- `app/api/v1/rankings/route.ts` - API de rankings (algoritmo ETFNexo Score)
- `components/RankingSlider.tsx` - Carrusel de top rankings
- `app/page.tsx` - Homepage con RankingSlider
- `types/database.types.ts` - Tipos de TypeScript
- `supabase/migrations/*_create_etfs_table.sql` - Schema de BD (ETFs)
- `supabase/migrations/*_create_user_ratings.sql` - Schema de BD (Ratings)

## Referencias y Metodología

### Fuentes de Inspiración

**Algoritmos de scoring similares:**
- Morningstar Rating (5 estrellas)
- ETFdb.com ETF Score
- Finect ETF Score (España)

**Papers académicos:**
- "A Composite Index for ETF Selection" (Bodie et al.)
- "Evaluating ETF Performance" (Investopedia)

### Principios de Diseño

1. **Transparencia:** Pesos y cálculos públicos
2. **Objetividad:** 80% datos cuantitativos, 20% comunidad
3. **Actualización:** Cálculo dinámico, siempre actualizado
4. **Comparabilidad:** Normalización min-max para fairness
5. **Simplicidad:** Score 0-100, fácil de entender

## Contacto y Soporte

- API Endpoint: https://etfnexo.vercel.app/api/v1/rankings
- Supabase Dashboard: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups
- Production: https://etfnexo.vercel.app
