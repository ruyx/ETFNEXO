-- ============================================
-- ETF Nexo - Sistema de Publicidad (Ads)
-- ============================================
-- Descripción: Sistema completo de gestión de anuncios con tracking
-- Fecha: 2026-06-15
-- ============================================

-- ============================================
-- 1. TABLA: advertisers (Anunciantes)
-- ============================================
CREATE TABLE IF NOT EXISTS advertisers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  website VARCHAR(500),
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para advertisers
CREATE INDEX idx_advertisers_status ON advertisers(status);
CREATE INDEX idx_advertisers_created_at ON advertisers(created_at);

-- ============================================
-- 2. TABLA: ads (Anuncios)
-- ============================================
CREATE TABLE IF NOT EXISTS ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advertiser_id UUID REFERENCES advertisers(id) ON DELETE CASCADE,

  -- Información básica
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('image_banner', 'text_banner', 'script')),

  -- Contenido del anuncio (según tipo)
  -- Para image_banner:
  image_url VARCHAR(1000),
  image_alt TEXT,

  -- Para text_banner:
  title VARCHAR(255),
  description TEXT,
  cta_text VARCHAR(100),

  -- Para script (Google AdSense, etc):
  script_code TEXT,

  -- Común para todos:
  link_url VARCHAR(1000),
  target VARCHAR(20) DEFAULT '_blank' CHECK (target IN ('_blank', '_self', '_parent', '_top')),

  -- Ubicación y formato
  placement VARCHAR(100) NOT NULL CHECK (placement IN (
    'sidebar_top', 'sidebar_bottom',
    'article_top', 'article_mid', 'article_bottom',
    'feed_inline',
    'header', 'footer'
  )),
  size VARCHAR(50), -- Ej: '300x250', '728x90', '160x600', etc.

  -- Control de visualización
  priority INTEGER DEFAULT 0, -- Mayor prioridad = se muestra primero
  max_impressions INTEGER, -- NULL = ilimitado
  max_clicks INTEGER, -- NULL = ilimitado

  -- Programación
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,

  -- Segmentación (opcional)
  target_pages JSONB, -- Array de URLs o patrones
  target_categories JSONB, -- Array de categorías

  -- Estado
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'paused', 'ended', 'draft')),

  -- Métricas (desnormalizadas para performance)
  impressions_count INTEGER DEFAULT 0,
  clicks_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para ads
CREATE INDEX idx_ads_advertiser_id ON ads(advertiser_id);
CREATE INDEX idx_ads_type ON ads(type);
CREATE INDEX idx_ads_placement ON ads(placement);
CREATE INDEX idx_ads_status ON ads(status);
CREATE INDEX idx_ads_start_date ON ads(start_date);
CREATE INDEX idx_ads_end_date ON ads(end_date);
CREATE INDEX idx_ads_priority ON ads(priority DESC);
CREATE INDEX idx_ads_active_placement ON ads(status, placement) WHERE status = 'active';

-- ============================================
-- 3. TABLA: ad_impressions (Impresiones)
-- ============================================
CREATE TABLE IF NOT EXISTS ad_impressions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,

  -- Información de la impresión
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,

  -- Geolocalización (opcional)
  country VARCHAR(2),
  city VARCHAR(255),

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para ad_impressions
CREATE INDEX idx_ad_impressions_ad_id ON ad_impressions(ad_id);
CREATE INDEX idx_ad_impressions_created_at ON ad_impressions(created_at);
CREATE INDEX idx_ad_impressions_ad_date ON ad_impressions(ad_id, created_at);

-- Particionado por fecha para optimizar queries históricas (opcional, para escala)
-- CREATE INDEX idx_ad_impressions_created_at_brin ON ad_impressions USING BRIN (created_at);

-- ============================================
-- 4. TABLA: ad_clicks (Clics)
-- ============================================
CREATE TABLE IF NOT EXISTS ad_clicks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ad_id UUID REFERENCES ads(id) ON DELETE CASCADE,
  impression_id UUID REFERENCES ad_impressions(id) ON DELETE SET NULL,

  -- Información del clic
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,

  -- Geolocalización (opcional)
  country VARCHAR(2),
  city VARCHAR(255),

  -- Timestamp
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para ad_clicks
CREATE INDEX idx_ad_clicks_ad_id ON ad_clicks(ad_id);
CREATE INDEX idx_ad_clicks_impression_id ON ad_clicks(impression_id);
CREATE INDEX idx_ad_clicks_created_at ON ad_clicks(created_at);
CREATE INDEX idx_ad_clicks_ad_date ON ad_clicks(ad_id, created_at);

-- ============================================
-- 5. VISTA: ad_stats (Estadísticas agregadas)
-- ============================================
CREATE OR REPLACE VIEW ad_stats AS
SELECT
  a.id,
  a.name,
  a.type,
  a.placement,
  a.status,
  a.advertiser_id,
  adv.name AS advertiser_name,

  -- Métricas
  COALESCE(imp.total_impressions, 0) AS total_impressions,
  COALESCE(clk.total_clicks, 0) AS total_clicks,

  -- CTR (Click-Through Rate)
  CASE
    WHEN COALESCE(imp.total_impressions, 0) > 0
    THEN ROUND((COALESCE(clk.total_clicks, 0)::NUMERIC / imp.total_impressions) * 100, 2)
    ELSE 0
  END AS ctr_percentage,

  -- Límites
  a.max_impressions,
  a.max_clicks,

  -- Progreso
  CASE
    WHEN a.max_impressions IS NOT NULL AND a.max_impressions > 0
    THEN ROUND((COALESCE(imp.total_impressions, 0)::NUMERIC / a.max_impressions) * 100, 2)
    ELSE NULL
  END AS impressions_progress,

  CASE
    WHEN a.max_clicks IS NOT NULL AND a.max_clicks > 0
    THEN ROUND((COALESCE(clk.total_clicks, 0)::NUMERIC / a.max_clicks) * 100, 2)
    ELSE NULL
  END AS clicks_progress,

  -- Fechas
  a.start_date,
  a.end_date,
  a.created_at,
  a.updated_at

FROM ads a
LEFT JOIN advertisers adv ON a.advertiser_id = adv.id
LEFT JOIN (
  SELECT ad_id, COUNT(*) AS total_impressions
  FROM ad_impressions
  GROUP BY ad_id
) imp ON a.id = imp.ad_id
LEFT JOIN (
  SELECT ad_id, COUNT(*) AS total_clicks
  FROM ad_clicks
  GROUP BY ad_id
) clk ON a.id = clk.ad_id;

-- ============================================
-- 6. FUNCIONES: Triggers para updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para advertisers
CREATE TRIGGER update_advertisers_updated_at
BEFORE UPDATE ON advertisers
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Triggers para ads
CREATE TRIGGER update_ads_updated_at
BEFORE UPDATE ON ads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. FUNCIÓN: Incrementar contador de impresiones
-- ============================================
CREATE OR REPLACE FUNCTION increment_ad_impressions()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ads
  SET impressions_count = impressions_count + 1
  WHERE id = NEW.ad_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_impressions
AFTER INSERT ON ad_impressions
FOR EACH ROW
EXECUTE FUNCTION increment_ad_impressions();

-- ============================================
-- 8. FUNCIÓN: Incrementar contador de clics
-- ============================================
CREATE OR REPLACE FUNCTION increment_ad_clicks()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ads
  SET clicks_count = clicks_count + 1
  WHERE id = NEW.ad_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_clicks
AFTER INSERT ON ad_clicks
FOR EACH ROW
EXECUTE FUNCTION increment_ad_clicks();

-- ============================================
-- 9. FUNCIÓN: Auto-pausar anuncios cuando alcanzan límites
-- ============================================
CREATE OR REPLACE FUNCTION check_ad_limits()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar límite de impresiones
  IF NEW.max_impressions IS NOT NULL AND NEW.impressions_count >= NEW.max_impressions THEN
    NEW.status = 'ended';
  END IF;

  -- Verificar límite de clics
  IF NEW.max_clicks IS NOT NULL AND NEW.clicks_count >= NEW.max_clicks THEN
    NEW.status = 'ended';
  END IF;

  -- Verificar fecha de fin
  IF NEW.end_date IS NOT NULL AND NOW() > NEW.end_date THEN
    NEW.status = 'ended';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_limits
BEFORE UPDATE ON ads
FOR EACH ROW
EXECUTE FUNCTION check_ad_limits();

-- ============================================
-- 10. POLÍTICAS RLS (Row Level Security)
-- ============================================

-- Habilitar RLS
ALTER TABLE advertisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_impressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_clicks ENABLE ROW LEVEL SECURITY;

-- Política para lectura pública de anuncios activos (para mostrar en el sitio)
CREATE POLICY "Anuncios activos son públicos"
ON ads FOR SELECT
USING (status = 'active' AND (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW()));

-- Política para insertar impresiones (público)
CREATE POLICY "Cualquiera puede registrar impresiones"
ON ad_impressions FOR INSERT
WITH CHECK (true);

-- Política para insertar clics (público)
CREATE POLICY "Cualquiera puede registrar clics"
ON ad_clicks FOR INSERT
WITH CHECK (true);

-- Política para administradores (acceso completo)
-- Nota: Esto requiere que el usuario autenticado tenga el rol 'admin'
CREATE POLICY "Admins tienen acceso completo a advertisers"
ON advertisers FOR ALL
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins tienen acceso completo a ads"
ON ads FOR ALL
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins pueden ver todas las impresiones"
ON ad_impressions FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Admins pueden ver todos los clics"
ON ad_clicks FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================
-- 11. DATOS DE EJEMPLO (Opcional - comentado)
-- ============================================
/*
-- Anunciante de ejemplo
INSERT INTO advertisers (name, email, website, status) VALUES
('Banco de Inversiones Demo', 'contacto@bancodemo.com', 'https://bancodemo.com', 'active');

-- Anuncio de ejemplo (banner de imagen)
INSERT INTO ads (
  advertiser_id,
  name,
  type,
  image_url,
  link_url,
  placement,
  size,
  priority,
  status
) VALUES (
  (SELECT id FROM advertisers WHERE name = 'Banco de Inversiones Demo'),
  'Banner Sidebar - Cuenta de Inversión',
  'image_banner',
  'https://ejemplo.com/banner-300x250.jpg',
  'https://bancodemo.com/cuenta-inversion',
  'sidebar_top',
  '300x250',
  10,
  'active'
);
*/

-- ============================================
-- FIN DE LA MIGRACIÓN
-- ============================================
