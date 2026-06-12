-- ============================================
-- Disable fetch-news cron job
-- ============================================
-- Fecha: 2026-06-12
-- Descripción: Desactiva el cron job de fetch-news automático
--              Solo mantener import-gsheets-news manual
-- ============================================

-- Desactivar el cron job de fetch-news (ejecutar en Supabase Dashboard)
-- SELECT cron.unschedule('fetch-news-every-6-hours');

-- Comentar la función para evitar ejecuciones accidentales
COMMENT ON FUNCTION public.fetch_news_cron() IS
  '[DESACTIVADO] Función de scraping automático RSS - reemplazada por import-gsheets-news manual';
