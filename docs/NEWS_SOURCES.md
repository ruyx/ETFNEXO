# Fuentes de Noticias ETF Nexo

Documentación completa de fuentes de noticias para el sistema automatizado de ETF Nexo.

## 🎯 Objetivo

Proporcionar noticias de alta calidad sobre **ETFs tradicionales**, excluyendo completamente contenido relacionado con criptomonedas, blockchain y activos digitales.

## 📊 Estado Actual

- **Total de artículos**: 266
- **Publicados**: 16
- **Borradores**: 250
- **Artículos crypto eliminados**: 76
- **Última actualización**: 2026-06-05

## 🔍 Fuentes RSS Activas

### 1. Google News ETF España

**URL**: `https://news.google.com/rss/search?q=ETF+OR+"fondos+cotizados"+-Bitcoin+-crypto+-criptomonedas+-blockchain+-BTC+-ETH+when:7d&hl=es&gl=ES&ceid=ES:es`

- **Categoría**: ETFs
- **Idioma**: Español
- **Frecuencia**: Últimos 7 días
- **Exclusiones**: Bitcoin, crypto, criptomonedas, blockchain, BTC, ETH

**Contenido típico**:
- Noticias generales de ETFs en España
- Lanzamientos de nuevos fondos cotizados
- Análisis de rentabilidad
- Cambios regulatorios

### 2. Google News Gestoras

**URL**: `https://news.google.com/rss/search?q=(BlackRock+OR+Vanguard+OR+iShares+OR+Amundi+OR+Invesco+OR+SPDR)+ETF+-Bitcoin+-crypto+-criptomonedas+when:7d&hl=es&gl=ES&ceid=ES:es`

- **Categoría**: Gestoras
- **Idioma**: Español
- **Frecuencia**: Últimos 7 días
- **Gestoras cubiertas**: BlackRock, Vanguard, iShares, Amundi, Invesco, SPDR

**Contenido típico**:
- Anuncios de gestoras de ETFs
- Nuevos productos y estrategias
- Movimientos corporativos
- Reportes de flujos de capital

### 3. Google News ETF Renta Variable

**URL**: `https://news.google.com/rss/search?q="ETF+renta+variable"+OR+"ETF+acciones"+OR+"ETF+bolsa"+-Bitcoin+-crypto+when:7d&hl=es&gl=ES&ceid=ES:es`

- **Categoría**: ETFs
- **Idioma**: Español
- **Frecuencia**: Últimos 7 días
- **Enfoque**: ETFs de acciones y renta variable

**Contenido típico**:
- Análisis de ETFs de acciones
- Performance de índices bursátiles
- Estrategias de inversión en renta variable
- Sectores y geografías específicas

### 4. Google News ETF Renta Fija

**URL**: `https://news.google.com/rss/search?q="ETF+renta+fija"+OR+"ETF+bonos"+OR+"ETF+deuda"+-Bitcoin+-crypto+when:7d&hl=es&gl=ES&ceid=ES:es`

- **Categoría**: ETFs
- **Idioma**: Español
- **Frecuencia**: Últimos 7 días
- **Enfoque**: ETFs de bonos y renta fija

**Contenido típico**:
- Noticias de ETFs de bonos
- Política monetaria y tipos de interés
- Mercado de deuda soberana y corporativa
- Estrategias de renta fija

### 5. Finect ETFs

**URL**: `https://www.finect.com/rss/etfs`

- **Categoría**: ETFs
- **Idioma**: Español
- **Frecuencia**: Continua
- **Fuente**: Finect (red social financiera española)

**Contenido típico**:
- Análisis de expertos
- Comparativas de ETFs
- Opiniones de inversores
- Guías educativas

## 🚫 Filtros Anti-Crypto

El sistema implementa filtros automáticos para **excluir** cualquier contenido relacionado con:

### Palabras clave excluidas (30+):

- `bitcoin`, `btc`
- `ethereum`, `eth`
- `crypto`, `criptomoneda`, `criptomonedas`
- `blockchain`, `cripto`, `criptodivisa`
- `altcoin`, `defi`, `nft`
- `binance`, `coinbase`
- `solana`, `cardano`, `ripple`, `xrp`
- `dogecoin`, `doge`, `shiba`
- `token`, `web3`
- `metaverse`, `metaverso`
- `stablecoin`, `usdt`, `usdc`
- `mining`, `minería`
- `wallet`, `monedero digital`

### Niveles de filtrado:

1. **Nivel RSS** (Google News): Exclusiones en la URL de búsqueda
2. **Nivel Parser** (Edge Function): Verificación de título y descripción
3. **Nivel Base de Datos**: Queries de limpieza periódica

## 📚 Fuentes de Referencia (Consulta Manual)

Estas fuentes no tienen RSS público pero son referencias valiosas para curación manual:

### ETFdb.com

**URL**: https://etfdb.com

- **Descripción**: Base de datos completa de ETFs con análisis detallados
- **Cobertura**: Global (énfasis en mercado estadounidense)
- **Características**:
  - Comparador de ETFs
  - Screener avanzado
  - Holdings y composición
  - Performance histórica
  - Ratings y análisis

**Uso recomendado**:
- Verificación de datos de ETFs
- Análisis de composición
- Benchmarking de performance
- Research de nuevos productos

### Morningstar Global

**URL**: https://global.morningstar.com/es/etfs

**Secciones relevantes**:
- https://global.morningstar.com/es/etfs/los-etfs-ms-rentables-del-mes-2
- https://global.morningstar.com/es/etf/screener

- **Descripción**: Plataforma líder de análisis financiero
- **Cobertura**: Global con versión en español
- **Características**:
  - Ratings de Morningstar (estrellas)
  - Rankings mensuales de rentabilidad
  - Análisis cualitativo y cuantitativo
  - Screener de ETFs
  - Research institucional

**Uso recomendado**:
- Validación de ratings
- Comparativas de rentabilidad
- Análisis de riesgo
- Datos de flujos de capital

### Otras Fuentes de Referencia

1. **JustETF.com** (https://www.justetf.com/es/)
   - Plataforma europea especializada
   - Screener y comparador
   - Planes de inversión

2. **Bolsas de Valores**
   - BME (España): https://www.bolsasymercados.es
   - Euronext: https://www.euronext.com
   - London Stock Exchange (LSE)

3. **Reguladores**
   - CNMV (España): https://www.cnmv.es
   - ESMA (Europa): https://www.esma.europa.eu
   - SEC (USA): https://www.sec.gov

## 🔄 Proceso de Scraping

### Automatizado (Edge Function)

1. **Frecuencia**: Cada 6 horas (configurable)
2. **Comando manual**:
   ```bash
   bash -c 'SERVICE_KEY=$(grep SUPABASE_SERVICE_ROLE_KEY .env.local | cut -d= -f2); curl -X POST "https://utvioubcqkwwzvufhups.supabase.co/functions/v1/fetch-news" -H "Authorization: Bearer ${SERVICE_KEY}" -H "Content-Type: application/json"'
   ```

### Flujo de Procesamiento

```
1. Fetch RSS → 2. Parse XML → 3. Filter Crypto → 4. Check Duplicates → 5. Insert Draft
```

### Estadísticas del Último Scraping

- **Total encontradas**: 145 noticias
- **Insertadas**: 85 nuevas
- **Saltadas**: 50 duplicadas
- **Filtradas (crypto)**: 10 excluidas ✅
- **Errores**: 0

## ✅ Calidad de Contenido

### Criterios de Inclusión

✅ **Incluir**:
- ETFs de renta variable (acciones)
- ETFs de renta fija (bonos)
- ETFs sectoriales (tecnología, salud, energía, etc.)
- ETFs geográficos (Europa, Asia, emergentes, etc.)
- ETFs temáticos (ESG, dividendos, value, growth, etc.)
- Gestoras de fondos cotizados
- Análisis de mercados financieros tradicionales
- Regulación de fondos de inversión

❌ **Excluir**:
- Cualquier mención a criptomonedas
- Bitcoin ETFs o productos relacionados
- Blockchain y tecnologías cripto
- NFTs y activos digitales
- Exchanges de crypto
- DeFi y Web3

### Proceso de Publicación

1. **Scraping automático** → Estado: `draft`
2. **Revisión manual/automática** → Verificar calidad y relevancia
3. **Publicación** → Cambiar status a `published`:
   ```sql
   UPDATE news_articles
   SET status = 'published', published_at = NOW()
   WHERE id = 'xxx';
   ```

## 📈 Métricas de Rendimiento

### Cobertura por Categoría

| Categoría | Artículos | %  |
|-----------|-----------|-----|
| ETFs      | 210       | 79% |
| Gestoras  | 35        | 13% |
| Mercados  | 21        | 8%  |

### Idioma

- **Español**: 100%

### Fuentes Más Productivas

1. Google News ETF España: ~40%
2. Google News Gestoras: ~25%
3. Google News Renta Variable: ~20%
4. Google News Renta Fija: ~10%
5. Finect ETFs: ~5%

## 📚 CATÁLOGO COMPLETO DE FUENTES DE REFERENCIA

### Medios Españoles (15 fuentes)

1. **Expansión** - Mercados y finanzas
   - https://www.expansion.com/mercados.html

2. **Morningstar España** - Análisis de ETFs y fondos ⭐
   - https://global.morningstar.com/es/etfs
   - Calidad: ⭐⭐⭐⭐⭐ (Ratings profesionales)

3. **Rankia** - Comunidad financiera
   - https://www.rankia.com/categorias/etfs
   - Tiene RSS: Posible integración futura

4. **RankiaPro** - Análisis profesional
   - https://rankiapro.com/es/

5. **Finect** - Red social financiera ✅
   - https://www.finect.com/etfs
   - https://www.finect.com/articulos-financieros/noticias
   - **ACTIVA** - Integrada en RSS scraping

6. **Cinco Días (El País)** - Fondos y planes
   - https://cincodias.elpais.com/fondos-y-planes/

7. **El Economista** - Mercados y cotizaciones
   - https://www.eleconomista.es/mercados-cotizaciones/

8. **El Español - Invertia** - Finanzas personales
   - https://www.elespanol.com/invertia/mis-finanzas/

9. **Intereconomía** - Fondos de inversión
   - https://www.intereconomia.com/tag/fondos-de-inversion/

10. **Capital Radio** - Noticias de fondos
    - https://www.capitalradio.es/noticias/fondos

11. **Estrategias de Inversión** - Especializado en fondos
    - https://www.estrategiasdeinversion.com/fondos/

12. **Citywire España** - Gestión de activos
    - https://citywire.com/es

13. **Que Fondos** - Comparador y noticias
    - https://www.quefondos.com/es/fondos/

14. **Funds Society** - ETF category ⭐
    - https://www.fundssociety.com/es/categoria/etf/
    - Calidad: ⭐⭐⭐⭐ (Especializado en gestión de activos)

15. **Investing.com** - Noticias financieras
    - https://es.investing.com/news

### Medios Internacionales (11 fuentes)

1. **Bloomberg** - ETFs Markets ⭐
   - https://www.bloomberg.com/markets/etfs
   - Calidad: ⭐⭐⭐⭐⭐ (Líder mundial en datos financieros)

2. **Reuters** - ETF Market News ⭐
   - https://www.reuters.com/markets/etf/
   - Calidad: ⭐⭐⭐⭐⭐ (Agencia de noticias global)

3. **Europa Press** - Economía y finanzas
   - https://www.europapress.es/economia/finanzas-00340/

4. **ETF.com** - Especialista en ETFs ⭐
   - https://www.etf.com/
   - Calidad: ⭐⭐⭐⭐⭐ (Referencia mundial en ETFs)

5. **ETF Trends** - Tendencias del sector ⭐
   - https://www.etftrends.com/
   - Calidad: ⭐⭐⭐⭐ (Análisis de tendencias)

6. **ETF Stream** - Europa-focused ⭐
   - https://www.etfstream.com/
   - Calidad: ⭐⭐⭐⭐ (Especializado en mercado europeo)

7. **Financial Times (FT)** - ETF Hub ⭐
   - https://www.ft.com/etf-hub
   - Calidad: ⭐⭐⭐⭐⭐ (Líder en finanzas)

8. **Ignites** - ETF Industry News
   - https://www.ignites.com/
   - Calidad: ⭐⭐⭐⭐ (Información de la industria)

9. **ETFGI** - Research & Analytics ⭐
   - https://etfgi.com/news
   - Calidad: ⭐⭐⭐⭐⭐ (Research institucional)

10. **EY (Ernst & Young)** - ETF Reports
    - https://www.ey.com/en_lu/exchange-traded-funds-etfs-active-and-passive
    - Calidad: ⭐⭐⭐⭐ (Análisis de Big Four)

11. **ETFdb.com** - Base de datos completa ⭐
    - https://etfdb.com
    - Calidad: ⭐⭐⭐⭐⭐ (La más completa)

## 📰 CÓMO SE CITAN LAS FUENTES

### En la Base de Datos

Cada artículo almacena:
```sql
source_name     → Nombre del medio (ej: "Google News ETF España")
source_url      → URL original del artículo
source_published_at → Fecha de publicación en la fuente original
```

### En la API

```json
{
  "title": "Las luces y sombras de un ETF de innovación",
  "source_name": "Morningstar",
  "source_url": "https://global.morningstar.com/...",
  "source_published_at": "2026-06-04T19:15:16+00:00"
}
```

### En el Frontend

**Página de detalle** (`/noticias/[slug]`):
- Muestra enlace a fuente original al final del artículo
- Formato: "Fuente original: [Nombre del medio] ↗"
- El enlace abre en nueva pestaña (`target="_blank"`)

**Grid de noticias** (`/noticias`):
- Meta info incluye fecha de publicación original
- Se respeta la autoría de la fuente

## 🛠️ Mantenimiento

### Tareas Regulares

- **Diaria**: Scraping automático
- **Semanal**: Revisión de calidad de fuentes
- **Mensual**: Limpieza de artículos obsoletos
- **Trimestral**: Evaluación de nuevas fuentes

### Queries de Mantenimiento

```sql
-- Ver últimos artículos
SELECT title, source_name, created_at
FROM news_articles
ORDER BY created_at DESC
LIMIT 20;

-- Estadísticas por fuente
SELECT source_name, COUNT(*) as total
FROM news_articles
GROUP BY source_name
ORDER BY total DESC;

-- Buscar posibles artículos crypto que pasaron el filtro
SELECT title FROM news_articles
WHERE LOWER(title) LIKE '%crypto%'
   OR LOWER(title) LIKE '%bitcoin%';
```

## 📞 Contacto y Contribuciones

Para sugerir nuevas fuentes o reportar problemas de calidad:

- **Email**: info@artigence.net
- **GitHub**: https://github.com/ruyx/ETFNEXO/issues

---

**Última actualización**: 2026-06-05
**Versión**: 2.0 (con filtros anti-crypto)
