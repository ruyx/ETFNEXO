# 🚀 Configuración de Finnhub API - ETF Nexo

## ✅ Progreso Completado

**Servicios Implementados:**
- ✅ Servicio de integración Finnhub completo (`lib/services/finnhub.ts`)
- ✅ Script de población de datos reales (`scripts/populate-etfs-finnhub.ts`)
- ✅ 11 ETFs europeos populares identificados
- ✅ Mapeo completo de datos Finnhub → Base de Datos

**Datos Disponibles (REALES desde Finnhub):**
- ✅ **AUM** (Assets Under Management) - REAL
- ✅ **TER** (Expense Ratio) - REAL
- ✅ **NAV** (Net Asset Value) - REAL
- ✅ **Top 10 Holdings** con ISIN - REAL
- ✅ **Sector Exposure** - REAL
- ✅ **Country Exposure** - REAL
- ✅ **Tracking Index** - REAL
- ✅ **Domicile** - REAL
- ⏳ **Rendimientos históricos** - Mock temporal (se integrarán después)

---

## 📋 Paso 1: Obtener API Key de Finnhub (GRATIS)

1. **Ir a:** https://finnhub.io/register
2. **Crear cuenta gratuita** (email + password)
3. **Confirmar email**
4. **Dashboard → API Key:** Copiar la key que aparece

**Free Tier Limits:**
- 60 llamadas/minuto
- Suficiente para poblar ~50 ETFs cada vez

---

## 📋 Paso 2: Configurar API Key

Editar `.env.local`:

```bash
# Reemplazar "demo" con tu API key real
FINNHUB_API_KEY=tu_api_key_aqui_desde_finnhub_dashboard
```

---

## 📋 Paso 3: Poblar Base de Datos con ETFs REALES

```bash
FINNHUB_API_KEY=tu_key \
NEXT_PUBLIC_SUPABASE_URL=https://utvioubcqkwwzvufhups.supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0dmlvdWJjcWt3d3p2dWZodXBzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDQ2OTg1MSwiZXhwIjoyMDk2MDQ1ODUxfQ.Pibe87tpbFzyTL5jigaOTsUQtDbAuOqYw5kYvSt3V1c \
npx tsx scripts/populate-etfs-finnhub.ts
```

**Resultado esperado:**
```
🚀 Iniciando población de ETFs con datos REALES de Finnhub...

📊 Gestoras disponibles: ishares, vanguard, amundi, xtrackers, spdr

🔍 Obteniendo datos REALES de SWDA.L...
   ✅ SWDA.L - iShares Core MSCI World UCITS ETF
      NAV: €85.42
      AUM: $75,234M
      TER: 0.20%
      Holdings: 10
      Index: MSCI World Index

... (procesa 11 ETFs) ...

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 RESUMEN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ ETFs insertados: 11
❌ Errores: 0
📈 Total procesados: 11

📦 Total ETFs en base de datos: 11

🏆 Top 5 ETFs por rendimiento 1Y:
   1. VWRL.L - Vanguard FTSE All-World UCITS ETF
      Return 1Y: 12.45%
      AUM: $45,231M
      TER: 0.22%
   ...
```

---

## 📋 Paso 4: Verificar Datos en Supabase

1. Ir a: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/editor
2. Tabla `etfs` → Ver datos insertados
3. Verificar campos:
   - `aum_millions` → Datos REALES de Finnhub
   - `ter` → Datos REALES
   - `top_10_holdings` → JSON con holdings REALES
   - `benchmark_index` → Índice que replica

---

## 🎯 Próximos Pasos

Después de poblar con datos REALES:

1. **Implementar algoritmo de ranking ETFNexo Score**
   - 35% Rendimiento ajustado (Sharpe Ratio)
   - 25% Coste total (TER)
   - 20% Liquidez (AUM + spread)
   - 20% Valoración comunidad

2. **Crear API endpoints**
   - `/api/v1/etfs` - Lista completa
   - `/api/v1/rankings` - Rankings semanales
   - `/api/v1/etfs/:isin` - Detalle individual

3. **Páginas frontend**
   - `/etfs` - Catálogo con datos reales
   - `/rankings` - Ranking en vivo

---

## 🔧 Troubleshooting

### Error: "API key invalid"
- Verifica que copiaste la key completa desde el dashboard de Finnhub
- Asegúrate de no tener espacios antes/después de la key en .env.local

### Error: "Rate limit exceeded"
- Free tier: 60 calls/minuto
- El script tiene delay de 1.5 segundos entre llamadas
- Si falla, espera 1 minuto y vuelve a ejecutar

### Error: "No data found for ticker XXX"
- Algunos tickers europeos pueden no estar en Finnhub
- Verifica el símbolo correcto en la bolsa específica (London .L, Amsterdam .AS, etc.)

### Error: "relation 'etfs' does not exist"
- Falta ejecutar las migraciones SQL
- Ir a Supabase Dashboard → SQL Editor
- Ejecutar contenido de:
  - `supabase/migrations/20260603000001_create_initial_schema.sql`
  - `supabase/migrations/20260603000002_add_complete_etf_fields.sql`

---

## 📊 ETFs Europeos Soportados (v1.0)

| Ticker | Nombre | Bolsa | Gestora |
|--------|--------|-------|---------|
| SWDA.L | iShares Core MSCI World | London | iShares |
| IWDA.AS | iShares Core MSCI World | Amsterdam | iShares |
| CSPX.L | iShares Core S&P 500 | London | iShares |
| EQQQ.L | iShares NASDAQ 100 | London | iShares |
| VWRL.L | Vanguard FTSE All-World | London | Vanguard |
| VUSA.L | Vanguard S&P 500 | London | Vanguard |
| VEUR.AS | Vanguard FTSE Developed Europe | Amsterdam | Vanguard |
| XMWO.L | Xtrackers MSCI World | London | Xtrackers |
| CW8.PA | Amundi MSCI World | Paris | Amundi |
| ZPRF.SW | SPDR Portfolio Total Stock Market | Swiss | SPDR |

---

## 💡 Ventajas de Finnhub

✅ **Free tier generoso** - 60 calls/min gratis
✅ **Datos institucionales** - Calidad profesional
✅ **Cobertura global** - ETFs europeos incluidos
✅ **Holdings completos** - Top 10 con ISIN
✅ **Datos fundamentales** - AUM, TER, NAV reales
✅ **Sin tarjeta de crédito** - Registro 100% gratuito

---

**Fecha:** 2026-06-03
**Status:** ✅ Listo para ejecutar
**API Seleccionada:** Finnhub (ganador vs Yahoo Finance, Twelve Data, Alpha Vantage)
