-- ============================================
-- ETF Nexo - Initial Schema
-- ============================================
-- Fecha: 2026-06-03
-- Versión: 1.0
-- Descripción: Creación de tablas iniciales para ETF Nexo MVP

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLA: fund_managers (Gestoras)
-- ============================================
CREATE TABLE IF NOT EXISTS fund_managers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_fund_managers_slug ON fund_managers(slug);

-- Comentarios
COMMENT ON TABLE fund_managers IS 'Gestoras de ETFs (iShares, Vanguard, Amundi, etc.)';
COMMENT ON COLUMN fund_managers.slug IS 'Slug para URLs amigables (ej: ishares, vanguard)';

-- ============================================
-- TABLA: etfs (ETFs Principales)
-- ============================================
CREATE TABLE IF NOT EXISTS etfs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  isin TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  yahoo_ticker TEXT,

  -- Datos estáticos (scrapeados mensualmente)
  ter DECIMAL(5,4),  -- Total Expense Ratio (0.0020 = 0.20%)

  -- Datos dinámicos (actualizados diariamente desde Yahoo Finance)
  nav_price DECIMAL(10,4),
  nav_date DATE,

  -- Rendimientos (%)
  return_1w DECIMAL(8,4),
  return_1m DECIMAL(8,4),
  return_ytd DECIMAL(8,4),
  return_1y DECIMAL(8,4),
  return_3y DECIMAL(8,4),
  return_5y DECIMAL(8,4),

  -- Volatilidad y liquidez
  volatility_1y DECIMAL(8,4),  -- Desviación estándar anualizada (%)
  volume_avg BIGINT,           -- Volumen promedio diario

  -- Metadata
  currency TEXT DEFAULT 'EUR',
  manager_id UUID REFERENCES fund_managers(id) ON DELETE SET NULL,
  data_updated_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_etfs_isin ON etfs(isin);
CREATE INDEX idx_etfs_manager ON etfs(manager_id);
CREATE INDEX idx_etfs_ticker ON etfs(yahoo_ticker);
CREATE INDEX idx_etfs_return_1y ON etfs(return_1y DESC);
CREATE INDEX idx_etfs_ter ON etfs(ter ASC);

-- Comentarios
COMMENT ON TABLE etfs IS 'Catálogo principal de ETFs';
COMMENT ON COLUMN etfs.isin IS 'ISIN único del ETF (ej: IE00B4L5Y983)';
COMMENT ON COLUMN etfs.yahoo_ticker IS 'Ticker de Yahoo Finance (ej: IWDA.L)';
COMMENT ON COLUMN etfs.ter IS 'Total Expense Ratio en decimal (0.0020 = 0.20%)';

-- ============================================
-- TABLA: etf_price_history (Histórico de Precios)
-- ============================================
CREATE TABLE IF NOT EXISTS etf_price_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  etf_id UUID REFERENCES etfs(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  nav_price DECIMAL(10,4) NOT NULL,
  volume BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(etf_id, date)
);

-- Índices
CREATE INDEX idx_price_history_etf ON etf_price_history(etf_id);
CREATE INDEX idx_price_history_date ON etf_price_history(date);

-- Comentarios
COMMENT ON TABLE etf_price_history IS 'Histórico de precios diarios para gráficos';

-- ============================================
-- TABLA: weekly_rankings (Rankings Semanales)
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_rankings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  etf_id UUID REFERENCES etfs(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,  -- Lunes de cada semana
  rank INTEGER NOT NULL,
  score DECIMAL(5,2) NOT NULL,     -- Score total (0-100)

  -- Sub-scores (0-100 cada uno)
  performance_score DECIMAL(5,2) NOT NULL,  -- 35% peso
  cost_score DECIMAL(5,2) NOT NULL,         -- 25% peso
  liquidity_score DECIMAL(5,2) NOT NULL,    -- 20% peso

  created_at TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(etf_id, week_start_date)
);

-- Índices
CREATE INDEX idx_rankings_week ON weekly_rankings(week_start_date);
CREATE INDEX idx_rankings_etf ON weekly_rankings(etf_id);
CREATE INDEX idx_rankings_score ON weekly_rankings(week_start_date, rank);

-- Comentarios
COMMENT ON TABLE weekly_rankings IS 'Rankings semanales calculados cada lunes';
COMMENT ON COLUMN weekly_rankings.score IS 'Score total ponderado (0-100)';

-- ============================================
-- TABLA: newsletter_subscribers (Suscriptores Newsletter)
-- ============================================
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  unsubscribed_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,

  CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Índices
CREATE INDEX idx_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX idx_subscribers_active ON newsletter_subscribers(is_active) WHERE is_active = TRUE;

-- Comentarios
COMMENT ON TABLE newsletter_subscribers IS 'Suscriptores del newsletter semanal';

-- ============================================
-- TABLA: affiliate_clicks (Tracking de Afiliados)
-- ============================================
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broker_name TEXT NOT NULL,
  etf_id UUID REFERENCES etfs(id) ON DELETE SET NULL,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  referrer_url TEXT,
  user_ip TEXT
);

-- Índices
CREATE INDEX idx_affiliate_broker ON affiliate_clicks(broker_name);
CREATE INDEX idx_affiliate_etf ON affiliate_clicks(etf_id);
CREATE INDEX idx_affiliate_date ON affiliate_clicks(clicked_at);

-- Comentarios
COMMENT ON TABLE affiliate_clicks IS 'Tracking de clicks en enlaces de brokers (afiliados)';

-- ============================================
-- FUNCIONES: Updated_at Trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar trigger a tablas con updated_at
CREATE TRIGGER update_fund_managers_updated_at BEFORE UPDATE ON fund_managers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_etfs_updated_at BEFORE UPDATE ON etfs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- RLS (Row Level Security) - Deshabilitado para MVP
-- ============================================
-- Por ahora, todas las tablas son públicas de solo lectura
-- En Fase 2 se implementará autenticación y permisos

ALTER TABLE fund_managers ENABLE ROW LEVEL SECURITY;
ALTER TABLE etfs ENABLE ROW LEVEL SECURITY;
ALTER TABLE etf_price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_rankings ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Políticas: TODO puede leer, solo service_role puede escribir
CREATE POLICY "Public read access" ON fund_managers FOR SELECT USING (true);
CREATE POLICY "Public read access" ON etfs FOR SELECT USING (true);
CREATE POLICY "Public read access" ON etf_price_history FOR SELECT USING (true);
CREATE POLICY "Public read access" ON weekly_rankings FOR SELECT USING (true);

-- Newsletter: permitir insert público (para formulario de suscripción)
CREATE POLICY "Public read access" ON newsletter_subscribers FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON newsletter_subscribers FOR INSERT WITH CHECK (true);

-- Affiliate clicks: permitir insert público (para tracking)
CREATE POLICY "Public insert access" ON affiliate_clicks FOR INSERT WITH CHECK (true);

-- ============================================
-- DATOS INICIALES: Gestoras
-- ============================================
INSERT INTO fund_managers (name, slug, website_url, description) VALUES
  ('iShares', 'ishares', 'https://www.ishares.com', 'Líder mundial en ETFs por BlackRock'),
  ('Vanguard', 'vanguard', 'https://www.vanguard.com', 'Pionero en fondos indexados de bajo coste'),
  ('Amundi', 'amundi', 'https://www.amundi.com', 'Líder europeo en gestión de activos'),
  ('Xtrackers', 'xtrackers', 'https://www.xtrackers.com', 'ETFs de DWS Group'),
  ('Invesco', 'invesco', 'https://www.invesco.com', 'Gestor global con amplia gama de ETFs'),
  ('WisdomTree', 'wisdomtree', 'https://www.wisdomtree.com', 'Innovador en ETFs temáticos y smart beta'),
  ('SPDR', 'spdr', 'https://www.ssga.com/spdr', 'ETFs de State Street Global Advisors'),
  ('HSBC', 'hsbc', 'https://www.assetmanagement.hsbc.com', 'ETFs de HSBC Asset Management')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- COMENTARIOS FINALES
-- ============================================
COMMENT ON SCHEMA public IS 'ETF Nexo - Schema principal (v1.0)';
