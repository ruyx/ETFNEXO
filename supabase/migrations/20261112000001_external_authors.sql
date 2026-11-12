-- ============================================
-- ETF Nexo - Autores externos de noticias
-- ============================================
-- Fecha: 2026-11-12
-- Noticias que envían otras entidades y se publican a su nombre.
-- El autor externo no tiene cuenta ni permisos: solo firma el artículo.
-- El correo es de contacto interno y no se muestra en la web.

CREATE TABLE IF NOT EXISTS public.external_authors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL CHECK (char_length(btrim(name)) BETWEEN 2 AND 120),
  email TEXT CHECK (email IS NULL OR email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  position TEXT CHECK (position IS NULL OR char_length(position) <= 120),
  company TEXT CHECK (company IS NULL OR char_length(company) <= 120),
  linkedin_url TEXT CHECK (linkedin_url IS NULL OR linkedin_url ~* '^https?://'),
  website_url TEXT CHECK (website_url IS NULL OR website_url ~* '^https?://'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_external_authors_name ON public.external_authors (lower(name));

DROP TRIGGER IF EXISTS update_external_authors_updated_at ON public.external_authors;
CREATE TRIGGER update_external_authors_updated_at BEFORE UPDATE ON public.external_authors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Solo editores (admin o redactor). La web pública lee con la service key.
ALTER TABLE public.external_authors ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "external_authors_editors_all" ON public.external_authors;
CREATE POLICY "external_authors_editors_all" ON public.external_authors
  FOR ALL USING (public.can_edit_articles()) WITH CHECK (public.can_edit_articles());

-- Relación con la noticia. Si se borra el autor, la noticia conserva la
-- firma en author_name.
ALTER TABLE public.news_articles
  ADD COLUMN IF NOT EXISTS external_author_id UUID
  REFERENCES public.external_authors(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_news_articles_external_author
  ON public.news_articles (external_author_id)
  WHERE external_author_id IS NOT NULL;

COMMENT ON TABLE public.external_authors IS 'Autores de entidades externas que firman noticias enviadas a ETF Nexo';
COMMENT ON COLUMN public.external_authors.email IS 'Contacto interno; no se publica';
COMMENT ON COLUMN public.news_articles.external_author_id IS 'Autor externo que firma la noticia';
