-- =====================================================
-- IMPORTANTE: Ejecutar este SQL en el panel de Supabase
-- =====================================================
-- Descripción: Actualizar vista interviews_with_metadata
--              para incluir campos de autor y mostrar_en_noticias
-- Fecha: 2026-09-23
-- =====================================================

-- Paso 1: Eliminar vista existente
DROP VIEW IF EXISTS interviews_with_metadata CASCADE;

-- Paso 2: Recrear vista con TODOS los campos necesarios
CREATE VIEW interviews_with_metadata AS
SELECT
  i.id,
  i.title,
  i.slug,
  i.description,
  i.youtube_video_id,
  i.category_id,
  i.status,
  i.published_at,
  i.views_count,
  i.key_points,
  i.meta_title,
  i.meta_description,
  i.created_at,
  i.updated_at,

  -- Campos de imagen y contenido
  i.featured_image_url,
  i.featured_image_alt,
  i.content,
  i.faq,

  -- Campo de noticias (IMPORTANTE para mostrar entrevistas en noticias)
  i.mostrar_en_noticias,

  -- Author data (IMPORTANTE para mostrar autor en la entrevista)
  i.author_id,
  a.name as author_name,
  a.slug as author_slug,
  a.display_name as author_display_name,
  a.avatar_url as author_avatar_url,
  a.email as author_email,
  a.signature as author_signature,

  -- Category data
  c.name as category_name,
  c.slug as category_slug,
  c.color_hex as category_color,

  -- Source metadata (campos calculados para compatibilidad con news)
  'Entrevista ETF Nexo' as source_name,
  CONCAT('https://etfnexo.com/entrevistas/', i.slug) as source_url

FROM interviews i
LEFT JOIN interview_categories c ON i.category_id = c.id
LEFT JOIN interview_authors a ON i.author_id = a.id;

-- Paso 3: Comentario
COMMENT ON VIEW interviews_with_metadata IS 'Vista con datos completos de entrevistas incluyendo autor y flag de noticias';

-- =====================================================
-- INSTRUCCIONES:
-- 1. Ir a: https://supabase.com/dashboard/project/pgkmepwodeeqfqhwyhlo
-- 2. Ir a: SQL Editor
-- 3. Copiar y pegar TODO este archivo
-- 4. Ejecutar (botón Run)
-- 5. Verificar que la vista se haya creado correctamente
-- =====================================================
