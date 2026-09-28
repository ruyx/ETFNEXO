-- Script SQL para insertar artículo "¿Qué son los ETFs?"
-- Ejecutar con: pnpm supabase db execute --file scripts/insert-academia-que-son-etfs.sql

INSERT INTO academy_articles (
  title,
  slug,
  content,
  excerpt,
  featured_image_url,
  featured_image_alt,
  meta_title,
  meta_description,
  tags,
  difficulty,
  reading_time_minutes,
  faq,
  status,
  published_at
) VALUES (
  '¿Qué son los ETFs? Guía Completa para Invertir en Fondos Cotizados',
  'que-son-los-etf',
  '<div class="article-content">Ver contenido completo en el script TypeScript</div>',
  'Guía completa sobre qué son los ETFs: definición, tipos, ventajas, fiscalidad en España, mejores ETFs 2026 y cómo empezar a invertir con ejemplos prácticos.',
  '/images/academia/que-son-los-etf-hero.jpg',
  'Gráfico explicativo de qué son los ETFs - Fondos cotizados en bolsa',
  '¿Qué son los ETFs? Guía Completa 2026 para Invertir en Fondos Cotizados',
  '✓ Qué son los ETFs ✓ Cómo funcionan ✓ Tipos de ETFs ✓ Ventajas y desventajas ✓ Fiscalidad en España ✓ Mejores ETFs 2026 ✓ Guía para principiantes con ejemplos',
  ARRAY['etf', 'fondos cotizados', 'inversión', 'bolsa', 'índices', 'diversificación', 'guía principiantes'],
  'beginner',
  15,
  '[
    {"question": "¿Cuánto dinero necesito para empezar a invertir en ETFs?", "answer": "Desde 50-100€ puedes comprar 1 participación de ETFs como VUSA o IWDA. Brokers como DeGiro o MyInvestor no exigen inversión mínima."},
    {"question": "¿Cuál es el mejor ETF para principiantes?", "answer": "Vanguard FTSE All-World (VWCE) o iShares MSCI World (IWDA). Ambos ofrecen diversificación global instantánea (3,000+ empresas), comisiones bajas (<0.25%)."}
  ]'::jsonb,
  'draft',
  NOW()
);
