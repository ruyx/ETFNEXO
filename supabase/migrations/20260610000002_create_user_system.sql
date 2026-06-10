-- ============================================
-- ETF Nexo - User System
-- ============================================
-- Fecha: 2026-06-10
-- Versión: 1.0
-- Descripción: Sistema completo de usuarios con perfiles, ratings, reviews y watchlists

-- ============================================
-- TABLA: user_profiles (Perfiles de Usuarios)
-- ============================================
-- Nota: Supabase Auth ya gestiona auth.users, esta tabla extiende con info adicional
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  full_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,

  -- Preferencias
  preferred_currency VARCHAR(3) DEFAULT 'EUR',
  preferred_language VARCHAR(5) DEFAULT 'es',

  -- Notificaciones
  email_notifications BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT FALSE,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_user_profiles_username ON user_profiles(username);

-- Comentarios
COMMENT ON TABLE user_profiles IS 'Perfiles de usuarios (extiende auth.users de Supabase)';
COMMENT ON COLUMN user_profiles.id IS 'UUID del usuario (FK a auth.users)';
COMMENT ON COLUMN user_profiles.username IS 'Nombre de usuario público (único)';

-- ============================================
-- TABLA: user_ratings (Valoraciones de ETFs)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  etf_id UUID NOT NULL REFERENCES etfs(id) ON DELETE CASCADE,

  -- Rating
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),

  -- Review opcional
  review_title VARCHAR(200),
  review_text TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Un usuario solo puede valorar un ETF una vez
  UNIQUE(user_id, etf_id)
);

-- Índices
CREATE INDEX idx_user_ratings_user ON user_ratings(user_id);
CREATE INDEX idx_user_ratings_etf ON user_ratings(etf_id);
CREATE INDEX idx_user_ratings_rating ON user_ratings(rating);
CREATE INDEX idx_user_ratings_created ON user_ratings(created_at DESC);

-- Comentarios
COMMENT ON TABLE user_ratings IS 'Valoraciones (1-5 estrellas) y reviews de ETFs por usuarios';
COMMENT ON COLUMN user_ratings.rating IS 'Rating de 1 a 5 estrellas';
COMMENT ON COLUMN user_ratings.review_text IS 'Review detallado (opcional)';

-- ============================================
-- TABLA: user_watchlists (Listas de Seguimiento)
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  etf_id UUID NOT NULL REFERENCES etfs(id) ON DELETE CASCADE,

  -- Notas privadas del usuario
  notes TEXT,

  -- Metadata
  added_at TIMESTAMPTZ DEFAULT NOW(),

  -- Un ETF solo puede estar una vez en la watchlist de un usuario
  UNIQUE(user_id, etf_id)
);

-- Índices
CREATE INDEX idx_user_watchlists_user ON user_watchlists(user_id);
CREATE INDEX idx_user_watchlists_etf ON user_watchlists(etf_id);
CREATE INDEX idx_user_watchlists_added ON user_watchlists(added_at DESC);

-- Comentarios
COMMENT ON TABLE user_watchlists IS 'ETFs favoritos/seguidos por usuarios';
COMMENT ON COLUMN user_watchlists.notes IS 'Notas privadas del usuario sobre el ETF';

-- ============================================
-- VISTA: etf_ratings_summary (Resumen de Ratings por ETF)
-- ============================================
CREATE OR REPLACE VIEW public.etf_ratings_summary AS
SELECT
  etf_id,
  COUNT(*) as total_ratings,
  AVG(rating) as average_rating,
  COUNT(*) FILTER (WHERE rating = 5) as five_stars,
  COUNT(*) FILTER (WHERE rating = 4) as four_stars,
  COUNT(*) FILTER (WHERE rating = 3) as three_stars,
  COUNT(*) FILTER (WHERE rating = 2) as two_stars,
  COUNT(*) FILTER (WHERE rating = 1) as one_star,
  MAX(created_at) as last_rating_at
FROM user_ratings
GROUP BY etf_id;

-- Comentarios
COMMENT ON VIEW etf_ratings_summary IS 'Resumen agregado de ratings por ETF (para Community Score)';

-- ============================================
-- VISTA: user_activity_summary (Resumen de Actividad de Usuario)
-- ============================================
CREATE OR REPLACE VIEW public.user_activity_summary AS
SELECT
  u.id as user_id,
  u.email,
  p.username,
  COUNT(DISTINCT r.id) as total_ratings,
  COUNT(DISTINCT w.id) as total_watchlist_items,
  AVG(r.rating) as average_rating_given,
  MAX(r.created_at) as last_rating_at,
  MAX(w.added_at) as last_watchlist_added_at
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
LEFT JOIN user_ratings r ON u.id = r.user_id
LEFT JOIN user_watchlists w ON u.id = w.user_id
GROUP BY u.id, u.email, p.username;

-- Comentarios
COMMENT ON VIEW user_activity_summary IS 'Resumen de actividad de cada usuario';

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Habilitar RLS en todas las tablas de usuarios
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_watchlists ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES: user_profiles
-- ============================================

-- Cualquier usuario autenticado puede ver perfiles públicos
CREATE POLICY "Profiles are viewable by authenticated users"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (true);

-- Los usuarios pueden crear su propio perfil
CREATE POLICY "Users can create their own profile"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Los usuarios solo pueden actualizar su propio perfil
CREATE POLICY "Users can update their own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Los usuarios pueden eliminar su propio perfil
CREATE POLICY "Users can delete their own profile"
  ON user_profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = id);

-- ============================================
-- RLS POLICIES: user_ratings
-- ============================================

-- Todos pueden ver todos los ratings (públicos)
CREATE POLICY "Ratings are viewable by everyone"
  ON user_ratings FOR SELECT
  TO authenticated, anon
  USING (true);

-- Los usuarios autenticados pueden crear ratings
CREATE POLICY "Authenticated users can create ratings"
  ON user_ratings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios solo pueden actualizar sus propios ratings
CREATE POLICY "Users can update their own ratings"
  ON user_ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios solo pueden eliminar sus propios ratings
CREATE POLICY "Users can delete their own ratings"
  ON user_ratings FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES: user_watchlists
-- ============================================

-- Los usuarios solo pueden ver su propia watchlist
CREATE POLICY "Users can view their own watchlist"
  ON user_watchlists FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Los usuarios pueden añadir ETFs a su watchlist
CREATE POLICY "Users can add to their own watchlist"
  ON user_watchlists FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propias notas de watchlist
CREATE POLICY "Users can update their own watchlist"
  ON user_watchlists FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden eliminar items de su watchlist
CREATE POLICY "Users can delete from their own watchlist"
  ON user_watchlists FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ============================================
-- FUNCIÓN: Actualizar average_rating en etfs
-- ============================================
CREATE OR REPLACE FUNCTION update_etf_average_rating()
RETURNS TRIGGER AS $$
BEGIN
  -- Calcular y actualizar average_rating del ETF afectado
  UPDATE etfs
  SET average_rating = (
    SELECT AVG(rating)::DECIMAL(3,2)
    FROM user_ratings
    WHERE etf_id = COALESCE(NEW.etf_id, OLD.etf_id)
  )
  WHERE id = COALESCE(NEW.etf_id, OLD.etf_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Actualizar average_rating automáticamente
-- ============================================
DROP TRIGGER IF EXISTS trigger_update_etf_rating ON user_ratings;
CREATE TRIGGER trigger_update_etf_rating
AFTER INSERT OR UPDATE OR DELETE ON user_ratings
FOR EACH ROW
EXECUTE FUNCTION update_etf_average_rating();

-- ============================================
-- FUNCIÓN: Crear perfil automáticamente al registrarse
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    SPLIT_PART(NEW.email, '@', 1), -- Username temporal basado en email
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGER: Crear perfil automáticamente
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- AGREGAR CAMPO average_rating A TABLA etfs
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'etfs' AND column_name = 'average_rating'
  ) THEN
    ALTER TABLE etfs ADD COLUMN average_rating DECIMAL(3,2) DEFAULT NULL;
    COMMENT ON COLUMN etfs.average_rating IS 'Rating promedio de usuarios (1.00-5.00)';
    CREATE INDEX idx_etfs_average_rating ON etfs(average_rating DESC);
  END IF;
END $$;

-- ============================================
-- DATOS DE PRUEBA (Opcional - Solo para desarrollo)
-- ============================================
-- NOTA: Descomentar solo en ambiente de desarrollo
/*
-- Insertar ratings de prueba (requiere usuarios existentes en auth.users)
INSERT INTO user_ratings (user_id, etf_id, rating, review_title, review_text)
SELECT
  (SELECT id FROM auth.users LIMIT 1),
  id,
  (RANDOM() * 4 + 1)::INTEGER, -- Rating aleatorio 1-5
  'Gran ETF para diversificación',
  'Excelente relación riesgo-retorno. Comisiones bajas y buena liquidez.'
FROM etfs
LIMIT 5
ON CONFLICT (user_id, etf_id) DO NOTHING;
*/
