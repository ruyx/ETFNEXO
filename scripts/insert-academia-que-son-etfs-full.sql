-- Insertar artículo completo "¿Qué son los ETFs?"
-- Target: 4,400 búsquedas/mes

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
  E'<div class="article-content">

<div class="tldr-section" style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
  <h2 style="margin-top: 0; font-size: 1.25rem; color: #1e293b;">📌 TL;DR - Resumen en 30 segundos</h2>
  <p style="margin-bottom: 0; line-height: 1.8; color: #475569;">
    <strong>Los ETFs (Exchange Traded Funds)</strong> son fondos de inversión que cotizan en bolsa como acciones. 
    Replican índices (S&P 500, IBEX 35) y permiten diversificar con una sola compra. 
    <strong>Ventajas clave:</strong> comisiones bajas (0.05%-0.50%), alta liquidez, fiscalidad eficiente en España. 
    <strong>Ideales para:</strong> principiantes, inversores a largo plazo y carteras pasivas.
  </p>
</div>

<h2>¿Qué es un ETF? Definición Simple</h2>

<p>
Un <strong>ETF (Exchange Traded Fund o Fondo Cotizado)</strong> es un fondo de inversión que se compra y vende en bolsa 
como si fuera una acción individual, pero que contiene una <strong>cesta diversificada de activos</strong> 
(acciones, bonos, materias primas, etc.).
</p>

<p>
Imagina que quieres invertir en las <strong>500 empresas más grandes de Estados Unidos</strong> (el índice S&P 500). 
Comprar cada acción individualmente sería costoso y complejo. Con un ETF del S&P 500, <strong>compras las 500 empresas 
de una sola vez</strong> por el precio de una acción.
</p>

<div class="key-takeaway" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 1.5rem; border-radius: 12px; margin: 2rem 0;">
  <h3 style="margin-top: 0; color: white;">💡 Concepto Clave</h3>
  <p style="margin-bottom: 0; font-size: 1.05rem; line-height: 1.8;">
    Un ETF replica automáticamente un índice, sector o estrategia. Si el S&P 500 sube 10%, tu ETF sube 10%. 
    Sin necesidad de seleccionar acciones individuales ni rebalancear manualmente.
  </p>
</div>

<h2>Características Principales de los ETFs</h2>

<table style="width: 100%; border-collapse: collapse; margin: 2rem 0; font-size: 0.95rem;">
  <thead>
    <tr style="background: #1e293b; color: white;">
      <th style="padding: 1rem; text-align: left; border: 1px solid #cbd5e1;">Característica</th>
      <th style="padding: 1rem; text-align: left; border: 1px solid #cbd5e1;">ETF</th>
      <th style="padding: 1rem; text-align: left; border: 1px solid #cbd5e1;">Fondo Tradicional</th>
      <th style="padding: 1rem; text-align: left; border: 1px solid #cbd5e1;">Acción Individual</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background: #f8fafc;">
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><strong>Diversificación</strong></td>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">✅ Alta (100-500+ activos)</td>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">✅ Alta</td>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">❌ Nula</td>
    </tr>
    <tr>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><strong>Comisiones</strong></td>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">✅ Muy bajas (0.05%-0.50%)</td>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">⚠️ Medias (0.5%-2%)</td>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">✅ Ninguna (solo broker)</td>
    </tr>
    <tr style="background: #f8fafc;">
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><strong>Liquidez</strong></td>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">✅ Inmediata (horario bolsa)</td>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">❌ Tardía (1-3 días)</td>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">✅ Inmediata</td>
    </tr>
    <tr>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><strong>Transparencia</strong></td>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">✅ Diaria (holdings públicos)</td>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">⚠️ Mensual/Trimestral</td>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">✅ Total</td>
    </tr>
    <tr style="background: #f8fafc;">
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><strong>Inversión mínima</strong></td>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">✅ Desde 1 participación (~50-100€)</td>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">⚠️ 500-1000€ típico</td>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">✅ Desde 1 acción</td>
    </tr>
  </tbody>
</table>

<h2>Ventajas de Invertir en ETFs</h2>

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem; margin: 2rem 0;">
  <div style="background: white; border: 2px solid #10b981; border-radius: 12px; padding: 1.5rem;">
    <h4 style="color: #10b981; margin-top: 0;">✅ Diversificación Instantánea</h4>
    <p style="margin-bottom: 0; color: #64748b; font-size: 0.95rem;">
      Con 100€ puedes invertir en 500 empresas. Reduce riesgo individual de quiebras.
    </p>
  </div>
  
  <div style="background: white; border: 2px solid #3b82f6; border-radius: 12px; padding: 1.5rem;">
    <h4 style="color: #3b82f6; margin-top: 0;">💰 Comisiones Mínimas</h4>
    <p style="margin-bottom: 0; color: #64748b; font-size: 0.95rem;">
      TER (Total Expense Ratio) desde 0.05% anual. Fondos activos cobran 1-2%.
    </p>
  </div>
  
  <div style="background: white; border: 2px solid #8b5cf6; border-radius: 12px; padding: 1.5rem;">
    <h4 style="color: #8b5cf6; margin-top: 0;">⚡ Alta Liquidez</h4>
    <p style="margin-bottom: 0; color: #64748b; font-size: 0.95rem;">
      Compra/vende en horario de bolsa. Precio en tiempo real, no al cierre del día.
    </p>
  </div>
  
  <div style="background: white; border: 2px solid #f59e0b; border-radius: 12px; padding: 1.5rem;">
    <h4 style="color: #f59e0b; margin-top: 0;">📊 Transparencia Total</h4>
    <p style="margin-bottom: 0; color: #64748b; font-size: 0.95rem;">
      Holdings publicados diariamente. Sabes exactamente qué posees en todo momento.
    </p>
  </div>
</div>

<h2>¿Cómo Comprar ETFs en España?</h2>

<h3>Paso 1: Elegir un Broker</h3>
<p>Opciones populares en España:</p>
<ul>
  <li><strong>Interactive Brokers:</strong> Comisiones bajas, amplio catálogo global</li>
  <li><strong>DeGiro:</strong> Sin comisiones en ETFs de la lista core (100+ ETFs gratis)</li>
  <li><strong>MyInvestor:</strong> Sin comisiones, pero catálogo limitado</li>
</ul>

<h2>Preguntas Frecuentes (FAQs)</h2>

<details style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem;">
  <summary style="font-weight: 700; font-size: 1.05rem; color: #1e293b; cursor: pointer;">
    ¿Cuánto dinero necesito para empezar a invertir en ETFs?
  </summary>
  <p style="margin-top: 1rem; color: #475569; line-height: 1.8;">
    Desde <strong>50-100€</strong> puedes comprar 1 participación de ETFs como VUSA o IWDA. 
    Brokers como DeGiro o MyInvestor no exigen inversión mínima.
  </p>
</details>

<details style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem;">
  <summary style="font-weight: 700; font-size: 1.05rem; color: #1e293b; cursor: pointer;">
    ¿Cuál es el mejor ETF para principiantes?
  </summary>
  <p style="margin-top: 1rem; color: #475569; line-height: 1.8;">
    <strong>Vanguard FTSE All-World (VWCE)</strong> o <strong>iShares MSCI World (IWDA)</strong>. 
    Ambos ofrecen diversificación global instantánea (3,000+ empresas), comisiones bajas (&lt;0.25%).
  </p>
</details>

<div class="cta-section" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2.5rem; border-radius: 16px; margin: 3rem 0; text-align: center;">
  <h3 style="margin-top: 0; font-size: 1.75rem; color: white;">🚀 ¿Listo para Empezar?</h3>
  <p style="font-size: 1.15rem; line-height: 1.8; margin: 1.5rem 0;">
    Explora nuestro <strong>ranking de ETFs 2026</strong> con más de 170 fondos analizados.
  </p>
  <a href="/rankings" style="display: inline-block; background: white; color: #667eea; padding: 1rem 2rem; border-radius: 8px; font-weight: 700; text-decoration: none;">
    Ver Rankings de ETFs →
  </a>
</div>

</div>',
  'Guía completa sobre qué son los ETFs: definición, tipos, ventajas, fiscalidad en España, mejores ETFs 2026 y cómo empezar a invertir con ejemplos prácticos.',
  '/images/academia/que-son-los-etf-hero.jpg',
  'Gráfico explicativo de qué son los ETFs - Fondos cotizados en bolsa',
  '¿Qué son los ETFs? Guía Completa 2026 para Invertir en Fondos Cotizados',
  '✓ Qué son los ETFs ✓ Cómo funcionan ✓ Tipos de ETFs ✓ Ventajas y desventajas ✓ Fiscalidad en España ✓ Mejores ETFs 2026 ✓ Guía para principiantes con ejemplos',
  ARRAY['etf', 'fondos cotizados', 'inversión', 'bolsa', 'índices', 'diversificación', 'guía principiantes'],
  'beginner',
  15,
  '[
    {
      "question": "¿Cuánto dinero necesito para empezar a invertir en ETFs?",
      "answer": "Desde 50-100€ puedes comprar 1 participación de ETFs como VUSA o IWDA. Brokers como DeGiro o MyInvestor no exigen inversión mínima. Recomendación: empieza con 100-300€/mes en DCA para crear el hábito."
    },
    {
      "question": "¿Qué es mejor: ETF o fondo indexado?",
      "answer": "ETFs: liquidez inmediata, comisiones más bajas, cotizan en bolsa. Fondos indexados: traspasos sin tributar (permanente), ideales si inviertes a muy largo plazo. En España, hasta 2026 los ETFs también tienen traspasos sin tributar."
    },
    {
      "question": "¿Los ETFs reparten dividendos?",
      "answer": "Depende del tipo de ETF. Los ETFs de distribución pagan dividendos trimestralmente. Los ETFs de acumulación reinvierten los dividendos automáticamente. En España, los ETFs Acc son más eficientes fiscalmente porque no tributan hasta vender."
    },
    {
      "question": "¿Cuál es el mejor ETF para principiantes?",
      "answer": "Vanguard FTSE All-World (VWCE) o iShares MSCI World (IWDA). Ambos ofrecen diversificación global instantánea (3,000+ empresas), comisiones bajas (<0.25%), y son ETFs de acumulación. Ideal para DCA mensual a largo plazo."
    },
    {
      "question": "¿Qué es el TER de un ETF?",
      "answer": "El TER (Total Expense Ratio) es el coste anual total de gestión del ETF. Incluye comisiones de gestión, custodia y auditoría. Se descuenta automáticamente del valor del ETF. Ejemplo: TER 0.20% = pagas 20€ al año por cada 10,000€ invertidos."
    }
  ]'::jsonb,
  'published',
  NOW()
);
