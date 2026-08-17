-- ============================================
-- Agregar campo FAQ a tabla news_articles
-- Para funcionalidad "Resumen Exprés"
-- ============================================

-- Agregar columna JSONB para almacenar array de FAQs
ALTER TABLE news_articles
ADD COLUMN faq JSONB DEFAULT '[]'::jsonb;

-- Comentario explicativo
COMMENT ON COLUMN news_articles.faq IS 'Array de preguntas y respuestas frecuentes para el artículo. Formato: [{"question": "texto", "answer": "html"}]';

-- Índice GIN para búsquedas eficientes en el JSON
CREATE INDEX idx_news_articles_faq ON news_articles USING GIN (faq);
