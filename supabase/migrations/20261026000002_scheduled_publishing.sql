-- ============================================
-- Publicación programada (26 oct 2026)
-- ============================================
-- Noticias, academia y entrevistas admiten status = 'scheduled' con la fecha
-- futura en published_at. Un job de pg_cron los publica cada minuto.
-- Las lecturas públicas y RLS ya filtran status = 'published', así que un
-- contenido programado no se ve antes de tiempo.
-- Al pasar a 'published' saltan los triggers existentes (ping del sitemap,
-- contadores de autor), igual que al publicar a mano.
-- Idempotente: se puede ejecutar varias veces.

-- 1. Nuevo estado. Se borra el CHECK de status (sea cual sea su nombre en
--    producción: el que lista 'published') y se crea uno con nombre conocido.
DO $$
DECLARE
  t TEXT;
  c RECORD;
BEGIN
  FOREACH t IN ARRAY ARRAY['news_articles', 'academy_articles', 'interviews'] LOOP
    FOR c IN
      SELECT conname FROM pg_constraint
      WHERE conrelid = ('public.' || t)::regclass
        AND contype = 'c'
        AND pg_get_constraintdef(oid) ILIKE '%status%'
        AND pg_get_constraintdef(oid) ILIKE '%''published''%'
    LOOP
      EXECUTE format('ALTER TABLE public.%I DROP CONSTRAINT %I', t, c.conname);
    END LOOP;
    EXECUTE format(
      'ALTER TABLE public.%I ADD CONSTRAINT %I CHECK (status IN (''draft'', ''scheduled'', ''published'', ''archived''))',
      t, t || '_status_check'
    );
  END LOOP;
END $$;

-- 2. Índices para que el job solo mire los programados
CREATE INDEX IF NOT EXISTS idx_news_articles_scheduled
  ON news_articles(published_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_academy_articles_scheduled
  ON academy_articles(published_at) WHERE status = 'scheduled';
CREATE INDEX IF NOT EXISTS idx_interviews_scheduled
  ON interviews(published_at) WHERE status = 'scheduled';

-- 3. Publicador
CREATE OR REPLACE FUNCTION public.publish_scheduled_content()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  news_count INTEGER;
  academy_count INTEGER;
  interviews_count INTEGER;
BEGIN
  UPDATE news_articles
  SET status = 'published', updated_at = NOW()
  WHERE status = 'scheduled' AND published_at <= NOW();
  GET DIAGNOSTICS news_count = ROW_COUNT;

  UPDATE academy_articles
  SET status = 'published', updated_at = NOW()
  WHERE status = 'scheduled' AND published_at <= NOW();
  GET DIAGNOSTICS academy_count = ROW_COUNT;

  UPDATE interviews
  SET status = 'published', updated_at = NOW()
  WHERE status = 'scheduled' AND published_at <= NOW();
  GET DIAGNOSTICS interviews_count = ROW_COUNT;

  -- Solo se registra cuando publica algo (corre cada minuto)
  IF news_count + academy_count + interviews_count > 0 THEN
    INSERT INTO public.cron_logs (job_name, status, message, executed_at)
    VALUES (
      'publish-scheduled', 'success',
      format('Publicados: %s noticias, %s academia, %s entrevistas', news_count, academy_count, interviews_count),
      NOW()
    );
  END IF;

  RETURN news_count + academy_count + interviews_count;
END;
$$;

REVOKE ALL ON FUNCTION public.publish_scheduled_content() FROM PUBLIC, anon, authenticated;

-- 4. Job cada minuto (se reemplaza si ya existía)
SELECT cron.unschedule(jobid) FROM cron.job WHERE jobname = 'publish-scheduled-content';
SELECT cron.schedule('publish-scheduled-content', '* * * * *', 'SELECT public.publish_scheduled_content();');
