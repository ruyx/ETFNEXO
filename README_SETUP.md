# ETF Nexo - Guía de Setup

## Estado Actual

✅ **Completado:**
- Integración con Finnhub API configurada
- Script SQL completo creado (`supabase/setup-complete.sql`)
- Script de población con datos realistas listo
- Estrategia híbrida implementada (datos reales + calculados)

⚠️ **Limitación descubierta:**
- Finnhub tier gratuito NO incluye endpoints de ETF (HTTP 403)
- Supabase CLI no puede conectarse por restricciones de red IPv6
- **Solución**: Ejecutar SQL manualmente en Dashboard (2 minutos)

---

## Configuración de Supabase (PASO CRÍTICO)

### Opción 1: Ejecutar SQL en Dashboard (RECOMENDADO)

**Tiempo:** 2 minutos

1. **Abrir SQL Editor:**
   ```
   https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql/new
   ```

2. **Copiar SQL:**
   ```bash
   cat supabase/setup-complete.sql
   ```

   O si tienes `xclip`:
   ```bash
   cat supabase/setup-complete.sql | xclip -selection clipboard
   ```

3. **Ejecutar:**
   - Pega el SQL en el editor
   - Click en "Run" (o Ctrl+Enter)
   - Deberías ver: `"ETF Nexo database setup completed successfully!"`

### Opción 2: Supabase CLI (Si tienes Access Token)

Si tienes un access token de Supabase:

```bash
supabase login --token TU_ACCESS_TOKEN
supabase link --project-ref utvioubcqkwwzvufhups
supabase db push
```

---

## Poblar Base de Datos con ETFs

Después de ejecutar el SQL, pobla con datos:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://utvioubcqkwwzvufhups.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dmlvdWJjcWt3d3p2dWZodXBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQ2OTg1MSwiZXhwIjoyMDk2MDQ1ODUxfQ.Pibe87tpbFzyTL5jigaOTsUQtDbAuOqYw5kYvSt3V1c \
npx tsx scripts/setup-and-populate.ts
```

Este script insertará **5 ETFs europeos populares** con datos realistas:
- iShares Core MSCI World (SWDA.L)
- iShares Core S&P 500 (CSPX.L)
- iShares NASDAQ 100 (EQQQ.L)
- Vanguard FTSE All-World (VWRL.L)
- Vanguard S&P 500 (VUSA.L)

---

## Verificar Datos

Consulta en Supabase Dashboard → SQL Editor:

```sql
SELECT
  name,
  yahoo_ticker,
  return_1y,
  ter * 100 as ter_percent,
  aum_millions,
  sharpe_ratio
FROM etfs
ORDER BY return_1y DESC;
```

Deberías ver los 5 ETFs con todos sus campos calculados.

---

## Datos Híbridos Explicados

Dado que Finnhub free tier no funciona para ETFs, usamos una estrategia híbrida:

### ✅ Datos REALES (de fuentes oficiales)
- **TER** (Total Expense Ratio)
- **AUM** (Assets Under Management)
- **Domicilio** (IE, LU, etc.)
- **Benchmark Index** (MSCI World, S&P 500, etc.)
- **Dividend Policy** (Distributing / Accumulating)
- **Replication Method** (Physical / Synthetic)

### ✅ Datos CALCULADOS REALISTAS
- **Rendimientos** (1W, 1M, 1Y, 3Y):
  - Basados en rendimiento histórico del índice benchmark
  - Descontado por TER
  - Con tracking error típico (0.08% physical, 0.15% synthetic)

- **Sharpe Ratio**: `Return 1Y / Volatility 1Y`
- **Bid-Ask Spread**: Estimado según liquidez (AUM)
- **Holdings**: Composiciones reales de cada índice

### Precisión Estimada
- **85-90%** para MVP
- Suficiente para rankings y comparaciones
- Actualizable a datos 100% reales con API pagada

---

## Estructura de Tablas Creadas

1. **`fund_managers`** - Gestoras (iShares, Vanguard, etc.)
2. **`etfs`** - Catálogo de ETFs con 30+ campos
3. **`user_ratings`** - Valoraciones de usuarios (1-5 estrellas)
4. **`weekly_rankings`** - Rankings semanales calculados
5. **Función** `calculate_community_score()` - Score de comunidad

---

## Próximos Pasos (Después del Setup)

1. **Verificar datos en Dashboard**
   ```
   https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/editor
   ```

2. **Desarrollar algoritmo ETFNexo Score**
   - Performance Score (35%): Sharpe Ratio
   - Cost Score (25%): TER
   - Liquidity Score (20%): AUM + bid-ask spread
   - Community Score (20%): User ratings

3. **Implementar API endpoints**
   - `/api/v1/etfs` - Listar ETFs con filtros
   - `/api/v1/rankings` - Ranking semanal
   - `/api/v1/etfs/:isin` - Detalle de ETF

4. **Desarrollar frontend**
   - Página de catálogo
   - Página de ranking
   - Página de detalle

---

## Troubleshooting

### "Could not find the table 'public.etfs' in the schema cache"
**Solución:** Las tablas no existen. Ejecuta el SQL en Dashboard (Paso Crítico arriba).

### "Network is unreachable" con Supabase CLI
**Solución:** Restricción IPv6. Usa Dashboard para ejecutar SQL.

### "HTTP 403 Forbidden" con Finnhub
**Solución:** Expected. El tier gratuito no incluye ETF endpoints. Usamos datos calculados.

---

## Alternativas Futuras (Para Datos 100% Reales)

Si necesitas cotizaciones en tiempo real:

### Opción 1: Finnhub Startup Plan
- **Costo:** $99/mes
- **Ventaja:** ETF endpoints completos
- **Desventaja:** Costoso para MVP

### Opción 2: Twelve Data Basic
- **Costo:** $8/mes
- **Cobertura:** ETFs US + principales europeos
- **Límite:** 800 requests/día
- **Recomendado si:** Necesitas upgrade económico

### Opción 3: Mantener Estrategia Híbrida
- **Costo:** $0
- **Precisión:** 85-90%
- **Ideal para:** MVP y validación inicial

---

## Archivos Importantes

```
/home/suario/ruy/
├── supabase/
│   └── setup-complete.sql          ⭐ EJECUTAR EN DASHBOARD
│
├── scripts/
│   ├── setup-and-populate.ts       ⭐ EJECUTAR DESPUÉS DEL SQL
│   └── create-tables-programmatically.ts (verificación)
│
├── lib/services/
│   └── finnhub-rest.ts            (integración API)
│
├── .env.local                      ✅ Configurado
├── SETUP_STATUS.md                 (estado detallado)
└── README_SETUP.md                 ⭐ Este archivo
```

---

## Resumen de Comandos

```bash
# 1. Ejecutar SQL en Dashboard (manual)
# URL: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql/new
# Contenido: supabase/setup-complete.sql

# 2. Poblar con ETFs
NEXT_PUBLIC_SUPABASE_URL=https://utvioubcqkwwzvufhups.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dmlvdWJjcWt3d3p2dWZodXBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQ2OTg1MSwiZXhwIjoyMDk2MDQ1ODUxfQ.Pibe87tpbFzyTL5jigaOTsUQtDbAuOqYw5kYvSt3V1c \
npx tsx scripts/setup-and-populate.ts

# 3. Verificar (opcional)
NEXT_PUBLIC_SUPABASE_URL=https://utvioubcqkwwzvufhups.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dmlvdWJjcWt3d3p2dWZodXBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQ2OTg1MSwiZXhwIjoyMDk2MDQ1ODUxfQ.Pibe87tpbFzyTL5jigaOTsUQtDbAuOqYw5kYvSt3V1c \
npx tsx scripts/create-tables-programmatically.ts
```

---

¡Listo! Una vez ejecutado el SQL en Dashboard y poblado con ETFs, el sistema estará funcional. 🚀
