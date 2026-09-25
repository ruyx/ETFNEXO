-- =====================================================
-- Migration: Migrate old sponsor data to new JSONB array format
-- Description: Convertir sponsors antiguos (campos individuales) a nuevo array
-- Date: 2026-09-25
-- =====================================================

-- NOTA: Esta migración es OPCIONAL y solo necesaria si existían
-- artículos con sponsors guardados en el formato antiguo ANTES
-- de aplicar la migración 20260925000003.
--
-- Si todos los sponsors se agregaron DESPUÉS de la migración,
-- esta migración no es necesaria.

-- Esta migración NO se ejecutará automáticamente porque los campos
-- antiguos ya fueron eliminados en la migración anterior.
-- Solo se incluye aquí como referencia en caso de que se necesite
-- restaurar datos de un backup.

/*
-- Si tuvieras un backup de los datos antiguos, el código sería así:

-- news_articles
UPDATE news_articles
SET sponsors = CASE
  WHEN old_backup.sponsor_enabled = true THEN
    jsonb_build_array(
      jsonb_build_object(
        'company_name', old_backup.sponsor_company_name,
        'logo_url', old_backup.sponsor_logo_url,
        'website_url', old_backup.sponsor_website_url
      )
    )
  ELSE '[]'::jsonb
END
FROM old_backup_table old_backup
WHERE news_articles.id = old_backup.id
AND old_backup.sponsor_enabled = true;

-- interviews
UPDATE interviews
SET sponsors = CASE
  WHEN old_backup.sponsor_enabled = true THEN
    jsonb_build_array(
      jsonb_build_object(
        'company_name', old_backup.sponsor_company_name,
        'logo_url', old_backup.sponsor_logo_url,
        'website_url', old_backup.sponsor_website_url
      )
    )
  ELSE '[]'::jsonb
END
FROM old_backup_table old_backup
WHERE interviews.id = old_backup.id
AND old_backup.sponsor_enabled = true;

-- academy_articles
UPDATE academy_articles
SET sponsors = CASE
  WHEN old_backup.sponsor_enabled = true THEN
    jsonb_build_array(
      jsonb_build_object(
        'company_name', old_backup.sponsor_company_name,
        'logo_url', old_backup.sponsor_logo_url,
        'website_url', old_backup.sponsor_website_url
      )
    )
  ELSE '[]'::jsonb
END
FROM old_backup_table old_backup
WHERE academy_articles.id = old_backup.id
AND old_backup.sponsor_enabled = true;
*/

-- Comentario final
COMMENT ON COLUMN news_articles.sponsors IS 'Array de sponsors/patrocinadores migrado desde campos individuales';
COMMENT ON COLUMN interviews.sponsors IS 'Array de sponsors/patrocinadores migrado desde campos individuales';
COMMENT ON COLUMN academy_articles.sponsors IS 'Array de sponsors/patrocinadores migrado desde campos individuales';
