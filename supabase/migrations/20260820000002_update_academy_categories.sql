-- Actualizar categorías de Academia
-- Nueva estructura de 7 categorías especializadas en ETF

BEGIN;

-- Eliminar categorías anteriores
DELETE FROM academy_categories;

-- Insertar nuevas categorías
INSERT INTO academy_categories (name, slug, description, display_order, icon_name, color_hex) VALUES
  ('Fundamentos', 'fundamentos', 'Conceptos básicos sobre ETFs e inversión indexada', 1, 'BookOpen', '#3B82F6'),
  ('Tipologías de ETF', 'tipologias-etf', 'Clasificación y tipos de fondos cotizados', 2, 'Grid', '#10B981'),
  ('Análisis', 'analisis', 'Métodos de análisis y evaluación de ETFs', 3, 'TrendingUp', '#F59E0B'),
  ('Riesgos de los ETF', 'riesgos-etf', 'Gestión y comprensión de riesgos', 4, 'AlertTriangle', '#EF4444'),
  ('Operativa práctica', 'operativa-practica', 'Cómo operar y gestionar ETFs', 5, 'Settings', '#8B5CF6'),
  ('Fiscalidad y regulación', 'fiscalidad-regulacion', 'Aspectos legales y fiscales', 6, 'Scale', '#06B6D4'),
  ('Avanzado', 'avanzado', 'Estrategias y temas avanzados', 7, 'Zap', '#EC4899');

COMMIT;
