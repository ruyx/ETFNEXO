-- ============================================
-- ETF Nexo - Campos Completos según Documento Técnico
-- ============================================
-- Fecha: 2026-06-03
-- Versión: 1.1
-- Descripción: Agregar los 30+ campos especificados en ETFNexo_Estructura_Tecnica_Datos.docx

-- ============================================
-- AGREGAR CAMPOS FALTANTES A TABLA etfs
-- ============================================

-- Identificación y Naming
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS official_name TEXT;
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS tickers JSONB DEFAULT '[]';  -- Array de tickers en diferentes bolsas

-- Precios
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS market_price DECIMAL(10,4);  -- Precio de mercado (diferente de NAV)
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS market_price_date DATE;

-- Datos fundamentales (de KID/KIID)
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS aum_millions DECIMAL(12,2);  -- Activos bajo gestión en millones EUR - CRÍTICO
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS tracking_error DECIMAL(6,4); -- Desviación vs índice (%)
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS dividend_policy TEXT;        -- 'distributing' o 'accumulating'
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS benchmark_index TEXT;        -- Nombre del índice replicado
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS replication_method TEXT;     -- 'physical', 'synthetic', 'sampling'
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS domicile TEXT;               -- País de registro (ej: 'IE', 'LU', 'FR')
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS base_currency TEXT;          -- Moneda base del fondo
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS listing_exchanges JSONB DEFAULT '[]'; -- Bolsas donde cotiza

-- Cartera (Holdings)
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS number_of_holdings INTEGER;
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS top_10_holdings JSONB DEFAULT '[]';  -- Array de {name, weight, isin}

-- Métricas de riesgo/rendimiento calculadas
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS sharpe_ratio DECIMAL(8,4);   -- CRÍTICO para ranking (rendimiento ajustado)
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS bid_ask_spread DECIMAL(6,4); -- Spread promedio (%) - CRÍTICO para liquidez

-- Categorización
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS category TEXT;               -- 'equity', 'bond', 'commodity', 'mixed', 'alternative'
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS region TEXT;                 -- 'global', 'europe', 'us', 'asia', 'emerging', etc.
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS sector TEXT;                 -- Si aplica: 'technology', 'healthcare', etc.

-- Documentación oficial
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS kid_url TEXT;                -- URL al documento KID/KIID oficial
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS kid_date DATE;               -- Fecha de publicación del KID

-- Estado de datos
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS data_quality_score INTEGER DEFAULT 100; -- Score de calidad (0-100)
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS data_staleness_days INTEGER DEFAULT 0;  -- Días desde última actualización
ALTER TABLE etfs ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;         -- FALSE si datos >3 días desactualizados

-- ============================================
-- AGREGAR CAMPO community_score A TABLA weekly_rankings
-- ============================================

ALTER TABLE weekly_rankings ADD COLUMN IF NOT EXISTS community_score DECIMAL(5,2) DEFAULT 0;  -- 20% peso - rating usuarios

-- ============================================
-- COMENTARIOS PARA NUEVOS CAMPOS
-- ============================================

COMMENT ON COLUMN etfs.official_name IS 'Denominación completa oficial del ETF';
COMMENT ON COLUMN etfs.tickers IS 'Array de tickers en diferentes bolsas: [{exchange: "XETRA", ticker: "EUNL"}, ...]';
COMMENT ON COLUMN etfs.aum_millions IS 'Activos bajo gestión en millones EUR - CRÍTICO para ranking liquidez';
COMMENT ON COLUMN etfs.tracking_error IS 'Desviación del rendimiento vs índice benchmark (%)';
COMMENT ON COLUMN etfs.dividend_policy IS 'Política de dividendos: distributing (reparte) o accumulating (reinvierte)';
COMMENT ON COLUMN etfs.benchmark_index IS 'Índice que replica el ETF (ej: MSCI World, S&P 500)';
COMMENT ON COLUMN etfs.replication_method IS 'Método: physical (compra directa), synthetic (swaps), sampling (muestra representativa)';
COMMENT ON COLUMN etfs.domicile IS 'País de registro del fondo (IE=Irlanda, LU=Luxemburgo, FR=Francia)';
COMMENT ON COLUMN etfs.listing_exchanges IS 'Bolsas donde cotiza: ["XETRA", "LSE", "Euronext"]';
COMMENT ON COLUMN etfs.number_of_holdings IS 'Número total de posiciones en la cartera';
COMMENT ON COLUMN etfs.top_10_holdings IS 'Top 10 holdings: [{name: "Apple Inc", weight: 5.2, isin: "US0378..."}, ...]';
COMMENT ON COLUMN etfs.sharpe_ratio IS 'Sharpe Ratio (retorno vs riesgo) - CRÍTICO para ranking performance';
COMMENT ON COLUMN etfs.bid_ask_spread IS 'Spread bid-ask promedio semanal (%) - CRÍTICO para ranking liquidez';
COMMENT ON COLUMN etfs.category IS 'Clase de activo: equity, bond, commodity, mixed, alternative';
COMMENT ON COLUMN etfs.region IS 'Cobertura geográfica: global, europe, us, asia, emerging, etc.';
COMMENT ON COLUMN etfs.sector IS 'Sector específico si aplica: technology, healthcare, financials, energy, etc.';
COMMENT ON COLUMN etfs.kid_url IS 'URL al documento KID/KIID oficial de la gestora';
COMMENT ON COLUMN etfs.kid_date IS 'Fecha de publicación del último KID disponible';
COMMENT ON COLUMN etfs.data_quality_score IS 'Score de calidad de datos (100=completo, <70=incompleto)';
COMMENT ON COLUMN etfs.data_staleness_days IS 'Días transcurridos desde última actualización de datos';
COMMENT ON COLUMN etfs.is_active IS 'FALSE si datos >3 días desactualizados o ETF suspendido';

COMMENT ON COLUMN weekly_rankings.community_score IS 'Score de valoración de comunidad (0-100) - 20% peso en ranking';

-- ============================================
-- CREAR ÍNDICES PARA NUEVOS CAMPOS CRÍTICOS
-- ============================================

CREATE INDEX IF NOT EXISTS idx_etfs_aum ON etfs(aum_millions DESC) WHERE aum_millions IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_etfs_sharpe ON etfs(sharpe_ratio DESC) WHERE sharpe_ratio IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_etfs_category ON etfs(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_etfs_region ON etfs(region) WHERE region IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_etfs_active ON etfs(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_etfs_quality ON etfs(data_quality_score DESC);

-- ============================================
-- TABLA NUEVA: user_ratings (Valoraciones de Usuarios)
-- ============================================

CREATE TABLE IF NOT EXISTS user_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  etf_id UUID REFERENCES etfs(id) ON DELETE CASCADE,
  user_email TEXT,  -- Opcional, puede ser anónimo
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Un usuario puede valorar múltiples veces, pero contaremos la última
  UNIQUE(etf_id, user_email)
);

-- Índices
CREATE INDEX idx_user_ratings_etf ON user_ratings(etf_id);
CREATE INDEX idx_user_ratings_date ON user_ratings(created_at);

-- RLS
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON user_ratings FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON user_ratings FOR INSERT WITH CHECK (true);

-- Comentarios
COMMENT ON TABLE user_ratings IS 'Valoraciones de usuarios (1-5 estrellas) - 20% del ranking';
COMMENT ON COLUMN user_ratings.rating IS 'Valoración de 1 a 5 estrellas';

-- ============================================
-- FUNCIÓN: Calcular community_score promedio
-- ============================================

CREATE OR REPLACE FUNCTION calculate_community_score(etf_uuid UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  rating_count INTEGER;
  score DECIMAL(5,2);
BEGIN
  -- Obtener promedio y cantidad de ratings
  SELECT AVG(rating), COUNT(*) INTO avg_rating, rating_count
  FROM user_ratings
  WHERE etf_id = etf_uuid;

  -- Si hay menos de 10 valoraciones, retornar 0 (según documento técnico)
  IF rating_count < 10 THEN
    RETURN 0;
  END IF;

  -- Convertir promedio 1-5 a escala 0-100
  -- 1 estrella = 0 puntos, 5 estrellas = 100 puntos
  score := ((avg_rating - 1) / 4.0) * 100;

  RETURN score;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION calculate_community_score IS 'Calcula community_score (0-100) desde valoraciones usuarios. Requiere mínimo 10 ratings.';

-- ============================================
-- DATOS DE EJEMPLO: Campos nuevos en ETFs existentes
-- ============================================
-- (Se agregarán cuando estén disponibles desde scrapers)

-- ============================================
-- COMENTARIOS FINALES
-- ============================================
COMMENT ON SCHEMA public IS 'ETF Nexo - Schema completo v1.1 con 30+ campos por ETF';
