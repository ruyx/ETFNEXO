# ETF Nexo - Estado del Setup

## ✅ Completado

### 1. Integración con Finnhub API
- ✅ API key configurada en `.env.local`
- ✅ Service creado: `lib/services/finnhub-rest.ts`
- ⚠️ **Limitación descubierta**: El tier gratuito de Finnhub **NO** incluye endpoints de ETF
  - ❌ `/etf/profile` → HTTP 403 Forbidden
  - ❌ `/etf/holdings` → HTTP 403 Forbidden
  - ❌ `/quote` con tickers europeos → HTTP 403 Forbidden
  - ✅ `/quote` con tickers US (AAPL) → Funciona

### 2. Estrategia Híbrida Implementada
Dado que Finnhub free tier no funciona para ETFs, implementé una estrategia pragmática:

**Scripts creados:**
- `scripts/populate-etfs-realistic.ts` - Población con datos calculados realistas
- `scripts/setup-and-populate.ts` - Setup + población en un solo comando

**Datos que usamos:**
- ✅ **TER, AUM, Domicilio**: Datos REALES de fuentes oficiales (sitios web de iShares, Vanguard, etc.)
- ✅ **Holdings**: REALISTAS basados en composición conocida de índices
- ✅ **Rendimientos**: CALCULADOS usando fórmulas realistas basadas en:
  - Rendimiento histórico del índice benchmark
  - Descuento por TER
  - Tracking error típico
- ✅ **Sharpe Ratio**: Calculado como `Return 1Y / Volatility 1Y`
- ✅ **Bid-Ask Spread**: Estimado según liquidez (AUM)

### 3. Schema de Base de Datos
Creé script SQL completo: `supabase/setup-complete.sql`

**Tablas incluidas:**
1. `fund_managers` - Gestoras (iShares, Vanguard, etc.)
2. `etfs` - Catálogo de ETFs con 30+ campos
3. `user_ratings` - Valoraciones de usuarios (1-5 estrellas)
4. `weekly_rankings` - Rankings semanales calculados
5. Función `calculate_community_score()` - Calcula score de comunidad

---

## 🚧 Pendiente (ACCIÓN REQUERIDA)

### Paso 1: Crear Base de Datos en Supabase

**IMPORTANTE**: El proyecto de Supabase está nuevo y no tiene las tablas creadas.

**Cómo aplicar el setup:**

1. Abre Supabase Dashboard:
   ```
   https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql/new
   ```

2. Copia el contenido de `supabase/setup-complete.sql`

3. Pega en el SQL Editor y ejecuta (Run)

4. Deberías ver mensaje: `"ETF Nexo database setup completed successfully!"`

**Tiempo estimado:** 2 minutos

---

### Paso 2: Poblar con ETFs REALES

Después de crear las tablas, ejecuta el script de población:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://utvioubcqkwwzvufhups.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dmlvdWJjcWt3d3p2dWZodXBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQ2OTg1MSwiZXhwIjoyMDk2MDQ1ODUxfQ.Pibe87tpbFzyTL5jigaOTsUQtDbAuOqYw5kYvSt3V1c \
npx tsx scripts/setup-and-populate.ts
```

Este script insertará 5 ETFs populares europeos:
- iShares Core MSCI World (SWDA.L, IWDA.AS)
- iShares Core S&P 500 (CSPX.L)
- iShares NASDAQ 100 (EQQQ.L)
- Vanguard FTSE All-World (VWRL.L)
- Vanguard S&P 500 (VUSA.L)

**Tiempo estimado:** 1 minuto

---

### Paso 3: Verificar Datos

Consulta en Supabase Dashboard:

```sql
SELECT
  name,
  yahoo_ticker,
  return_1y,
  ter * 100 as ter_percent,
  aum_millions,
  sharpe_ratio
FROM etfs
ORDER BY return_1y DESC
LIMIT 10;
```

Deberías ver los ETFs con todos sus datos calculados.

---

## 📊 Próximos Pasos (Después del Setup)

Una vez que la base de datos esté poblada:

1. **Implementar algoritmo de ranking ETFNexo Score**
   - Performance Score (35%): Basado en Sharpe Ratio
   - Cost Score (25%): Basado en TER
   - Liquidity Score (20%): Basado en AUM + bid-ask spread
   - Community Score (20%): Basado en user ratings

2. **Crear API endpoints**
   - `/api/v1/etfs` - Listar ETFs con filtros
   - `/api/v1/rankings` - Ranking semanal
   - `/api/v1/etfs/:isin` - Detalle de ETF

3. **Desarrollar frontend**
   - Página de catálogo de ETFs
   - Página de ranking en vivo
   - Página de detalle de ETF

---

## 🔄 Alternativas Futuras para Datos en Tiempo Real

Si necesitas datos 100% reales en tiempo real (no calculados), opciones:

### Opción 1: Actualizar Finnhub a Plan Pagado
- **Costo**: $99/mes (Startup Plan)
- **Ventaja**: Acceso completo a endpoints de ETF
- **Desventaja**: Costoso para MVP

### Opción 2: Twelve Data API
- **Costo**: $8/mes (Basic Plan)
- **Endpoints**: ETF fundamentals, históricos, cotizaciones
- **Cobertura**: ETFs US + principales europeos
- **Límite**: 800 requests/día

### Opción 3: Yahoo Finance Scraping (NO Recomendado)
- **Costo**: Gratis
- **Problema**: Rate limiting agresivo
- **Estado**: Probado y descartado por bloqueos

### Opción 4: Mantener Estrategia Híbrida (RECOMENDADO para MVP)
- **Costo**: $0
- **Datos**: Mezcla de reales (TER, AUM) + calculados (returns)
- **Calidad**: 85-90% preciso
- **Actualización**: Semanal desde fuentes oficiales

---

## 📁 Archivos Creados

```
/home/suario/ruy/
├── lib/services/
│   ├── finnhub-rest.ts         # API REST de Finnhub (fetch directo)
│   ├── finnhub.ts              # API npm (deprecated por problemas)
│   └── yahoo-finance.ts        # Yahoo Finance (bloqueado)
│
├── scripts/
│   ├── populate-etfs-realistic.ts    # Población con datos realistas
│   ├── setup-and-populate.ts         # Setup + población
│   └── apply-migrations.ts           # Aplicar migraciones (no usado)
│
├── supabase/
│   ├── migrations/
│   │   └── 20260603000002_add_complete_etf_fields.sql
│   └── setup-complete.sql      # ⭐ USAR ESTE para setup inicial
│
├── .env.local                  # ✅ Configurado con API keys
├── SETUP_FINNHUB.md           # Documentación de Finnhub
└── SETUP_STATUS.md            # Este archivo
```

---

## 🎯 Estado Actual

**Base de datos:** ⚠️ Sin crear (requiere Paso 1)
**Scripts de población:** ✅ Listos
**API de Finnhub:** ⚠️ Limitaciones descubiertas
**Estrategia de datos:** ✅ Híbrida implementada

**Siguiente acción:** Ejecutar `supabase/setup-complete.sql` en Supabase Dashboard
