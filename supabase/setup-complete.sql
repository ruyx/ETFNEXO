-- ============================================
-- ETF Nexo - Setup Completo de Base de Datos
-- ============================================
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- URL: https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql/new

-- ============================================
-- 1. TABLA: fund_managers (Gestoras)
-- ============================================

CREATE TABLE IF NOT EXISTS fund_managers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Datos iniciales de gestoras
INSERT INTO fund_managers (slug, name, website_url) VALUES
  ('ishares', 'iShares (BlackRock)', 'https://www.ishares.com'),
  ('vanguard', 'Vanguard', 'https://www.vanguard.com'),
  ('xtrackers', 'Xtrackers (DWS)', 'https://www.xtrackers.com'),
  ('amundi', 'Amundi', 'https://www.amundi.com'),
  ('spdr', 'SPDR (State Street)', 'https://www.ssga.com/spdr'),
  ('lyxor', 'Lyxor (Société Générale)', 'https://www.lyxoretf.com'),
  ('invesco', 'Invesco', 'https://www.invesco.com'),
  ('ubs', 'UBS Asset Management', 'https://www.ubs.com/etf')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 2. TABLA: etfs (Catálogo de ETFs)
-- ============================================

CREATE TABLE IF NOT EXISTS etfs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Identificación
  isin TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  official_name TEXT,
  yahoo_ticker TEXT,
  tickers JSONB DEFAULT '[]',

  -- Relación con gestora
  manager_id UUID REFERENCES fund_managers(id),

  -- Precios
  nav_price DECIMAL(10,4),
  nav_date DATE,
  market_price DECIMAL(10,4),
  market_price_date DATE,
  currency TEXT DEFAULT 'EUR',

  -- Rendimientos
  return_1w DECIMAL(8,4),
  return_1m DECIMAL(8,4),
  return_1y DECIMAL(8,4),
  return_3y DECIMAL(8,4),
  volatility_1y DECIMAL(8,4),

  -- Datos fundamentales
  ter DECIMAL(6,4),  -- TER en decimal (0.0020 = 0.20%)
  aum_millions DECIMAL(12,2),
  tracking_error DECIMAL(6,4),
  dividend_policy TEXT,
  benchmark_index TEXT,
  replication_method TEXT,
  domicile TEXT,
  base_currency TEXT,
  listing_exchanges JSONB DEFAULT '[]',

  -- Holdings
  number_of_holdings INTEGER,
  top_10_holdings JSONB DEFAULT '[]',

  -- Métricas de riesgo
  sharpe_ratio DECIMAL(8,4),
  bid_ask_spread DECIMAL(6,4),

  -- Categorización
  category TEXT,
  region TEXT,
  sector TEXT,

  -- Documentación
  kid_url TEXT,
  kid_date DATE,

  -- Estado
  data_updated_at TIMESTAMPTZ DEFAULT NOW(),
  data_quality_score INTEGER DEFAULT 100,
  data_staleness_days INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_etfs_isin ON etfs(isin);
CREATE INDEX IF NOT EXISTS idx_etfs_ticker ON etfs(yahoo_ticker);
CREATE INDEX IF NOT EXISTS idx_etfs_manager ON etfs(manager_id);
CREATE INDEX IF NOT EXISTS idx_etfs_return_1y ON etfs(return_1y DESC) WHERE return_1y IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_etfs_aum ON etfs(aum_millions DESC) WHERE aum_millions IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_etfs_sharpe ON etfs(sharpe_ratio DESC) WHERE sharpe_ratio IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_etfs_category ON etfs(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_etfs_region ON etfs(region) WHERE region IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_etfs_active ON etfs(is_active) WHERE is_active = TRUE;

-- RLS
ALTER TABLE etfs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON etfs FOR SELECT USING (true);

-- ============================================
-- 3. TABLA: user_ratings (Valoraciones)
-- ============================================

CREATE TABLE IF NOT EXISTS user_ratings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  etf_id UUID REFERENCES etfs(id) ON DELETE CASCADE,
  user_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(etf_id, user_email)
);

CREATE INDEX IF NOT EXISTS idx_user_ratings_etf ON user_ratings(etf_id);
CREATE INDEX IF NOT EXISTS idx_user_ratings_date ON user_ratings(created_at);

ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON user_ratings FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON user_ratings FOR INSERT WITH CHECK (true);

-- ============================================
-- 4. TABLA: weekly_rankings (Rankings Semanales)
-- ============================================

CREATE TABLE IF NOT EXISTS weekly_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  etf_id UUID REFERENCES etfs(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,

  -- Scores por dimensión (0-100)
  performance_score DECIMAL(5,2),    -- 35% peso
  cost_score DECIMAL(5,2),           -- 25% peso
  liquidity_score DECIMAL(5,2),      -- 20% peso
  community_score DECIMAL(5,2),      -- 20% peso

  -- Score total (promedio ponderado)
  total_score DECIMAL(5,2),

  -- Ranking
  rank INTEGER,

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(etf_id, week_start)
);

CREATE INDEX IF NOT EXISTS idx_weekly_rankings_week ON weekly_rankings(week_start DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_rankings_rank ON weekly_rankings(rank ASC) WHERE rank IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_weekly_rankings_score ON weekly_rankings(total_score DESC);

ALTER TABLE weekly_rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON weekly_rankings FOR SELECT USING (true);

-- ============================================
-- 5. FUNCIÓN: Calcular Community Score
-- ============================================

CREATE OR REPLACE FUNCTION calculate_community_score(etf_uuid UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  rating_count INTEGER;
  score DECIMAL(5,2);
BEGIN
  SELECT AVG(rating), COUNT(*) INTO avg_rating, rating_count
  FROM user_ratings
  WHERE etf_id = etf_uuid;

  IF rating_count < 10 THEN
    RETURN 0;
  END IF;

  score := ((avg_rating - 1) / 4.0) * 100;
  RETURN score;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. COMENTARIOS DE DOCUMENTACIÓN
-- ============================================

COMMENT ON TABLE etfs IS 'Catálogo completo de ETFs con 30+ campos de datos';
COMMENT ON TABLE fund_managers IS 'Gestoras de fondos (iShares, Vanguard, etc.)';
COMMENT ON TABLE user_ratings IS 'Valoraciones de usuarios (1-5 estrellas)';
COMMENT ON TABLE weekly_rankings IS 'Rankings semanales calculados con algoritmo ETFNexo Score';

COMMENT ON COLUMN etfs.ter IS 'Total Expense Ratio en decimal (0.0020 = 0.20%)';
COMMENT ON COLUMN etfs.aum_millions IS 'Assets Under Management en millones EUR';
COMMENT ON COLUMN etfs.sharpe_ratio IS 'Sharpe Ratio (rendimiento ajustado por riesgo)';
COMMENT ON COLUMN etfs.bid_ask_spread IS 'Spread promedio bid-ask en % (indicador de liquidez)';
COMMENT ON COLUMN etfs.top_10_holdings IS 'Top 10 holdings: [{"name": "Apple Inc", "weight": 5.2, "isin": "US037833..."}]';

COMMENT ON COLUMN weekly_rankings.performance_score IS '35% del score total - basado en Sharpe Ratio';
COMMENT ON COLUMN weekly_rankings.cost_score IS '25% del score total - basado en TER';
COMMENT ON COLUMN weekly_rankings.liquidity_score IS '20% del score total - basado en AUM + bid-ask spread';
COMMENT ON COLUMN weekly_rankings.community_score IS '20% del score total - basado en ratings usuarios';

-- ============================================
-- ✅ Setup completado
-- ============================================
SELECT 'ETF Nexo database setup completed successfully!' AS status;
