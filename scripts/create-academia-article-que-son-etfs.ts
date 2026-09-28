// Script para crear artículo Academia: ¿Qué son los ETFs?
// Keywords: qué son los ETF (4,400 búsquedas/mes)
// Target: Featured snippet + long-tail keywords

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

const article = {
  title: '¿Qué son los ETFs? Guía Completa para Invertir en Fondos Cotizados',
  slug: 'que-son-los-etf',
  category_id: null, // Usar categoría principal si existe
  content: `
<div class="article-content">

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

<h2>Tipos de ETFs más Comunes</h2>

<h3>1. ETFs de Renta Variable (Acciones)</h3>
<ul>
  <li><strong>ETFs de índices globales:</strong> S&P 500, MSCI World, FTSE All-World</li>
  <li><strong>ETFs regionales:</strong> Europa (Euro Stoxx 50), Asia-Pacífico, Mercados emergentes</li>
  <li><strong>ETFs sectoriales:</strong> Tecnología (NASDAQ-100), Energía renovable, Salud</li>
  <li><strong>ETFs temáticos:</strong> Inteligencia Artificial, Blockchain, Agua, ESG</li>
</ul>

<h3>2. ETFs de Renta Fija (Bonos)</h3>
<ul>
  <li><strong>Deuda pública:</strong> Bonos del Tesoro USA, Bund alemán</li>
  <li><strong>Deuda corporativa:</strong> Investment Grade, High Yield</li>
  <li><strong>Duración:</strong> Corto plazo (&lt;5 años), Largo plazo (&gt;10 años)</li>
</ul>

<h3>3. ETFs de Materias Primas</h3>
<ul>
  <li><strong>Metales preciosos:</strong> Oro, Plata, Platino (físicos o futuros)</li>
  <li><strong>Energía:</strong> Petróleo WTI, Gas natural</li>
  <li><strong>Agrícolas:</strong> Cestas diversificadas de commodities</li>
</ul>

<h3>4. ETFs Monetarios y Alternativos</h3>
<ul>
  <li><strong>ETFs de cash:</strong> Réplica de tipos de interés a corto plazo</li>
  <li><strong>ETFs inversos:</strong> Ganan cuando el índice cae (hedge)</li>
  <li><strong>ETFs apalancados:</strong> 2x-3x la rentabilidad del índice (alto riesgo)</li>
</ul>

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

  <div style="background: white; border: 2px solid #ec4899; border-radius: 12px; padding: 1.5rem;">
    <h4 style="color: #ec4899; margin-top: 0;">🇪🇸 Fiscalidad Eficiente</h4>
    <p style="margin-bottom: 0; color: #64748b; font-size: 0.95rem;">
      En España, traspasos entre ETFs sin tributar (hasta 2026). Diferimiento fiscal.
    </p>
  </div>

  <div style="background: white; border: 2px solid #06b6d4; border-radius: 12px; padding: 1.5rem;">
    <h4 style="color: #06b6d4; margin-top: 0;">🎯 Gestión Pasiva</h4>
    <p style="margin-bottom: 0; color: #64748b; font-size: 0.95rem;">
      No necesitas analizar empresas. El índice se rebalancea automáticamente.
    </p>
  </div>
</div>

<h2>Desventajas y Riesgos de los ETFs</h2>

<ul style="line-height: 2;">
  <li><strong>Riesgo de mercado:</strong> Si el índice cae 20%, tu ETF también. No elimina volatilidad.</li>
  <li><strong>Tracking error:</strong> Pequeña desviación respecto al índice (0.05%-0.30% anual).</li>
  <li><strong>Comisiones de compra-venta:</strong> Tu broker puede cobrar por transacción.</li>
  <li><strong>Spread bid-ask:</strong> Diferencia entre precio de compra y venta (ETFs poco líquidos).</li>
  <li><strong>No superan al mercado:</strong> Réplica = rentabilidad del índice, nunca superior.</li>
  <li><strong>Riesgo de divisa:</strong> ETFs en USD expuestos a fluctuaciones EUR/USD (salvo hedged).</li>
</ul>

<h2>¿Cómo Funcionan los ETFs? Mecanismo de Réplica</h2>

<h3>Réplica Física (Completa o Muestreo)</h3>
<p>
El ETF <strong>compra directamente</strong> los activos del índice. Por ejemplo, un ETF del S&P 500
posee acciones reales de Apple, Microsoft, Amazon, etc.
</p>
<ul>
  <li><strong>Réplica completa:</strong> Posee TODAS las acciones del índice en la proporción exacta.</li>
  <li><strong>Muestreo (sampling):</strong> Posee una muestra representativa (índices con 1000+ activos).</li>
</ul>

<h3>Réplica Sintética (Swap)</h3>
<p>
El ETF <strong>no compra los activos</strong>, sino que firma un contrato de swap con un banco.
El banco se compromete a entregar la rentabilidad del índice a cambio de una comisión.
</p>
<ul>
  <li><strong>Ventaja:</strong> Menor tracking error, acceso a mercados ilíquidos.</li>
  <li><strong>Desventaja:</strong> Riesgo de contraparte (si el banco quiebra, pérdida potencial).</li>
</ul>

<h2>ETFs de Acumulación vs Distribución</h2>

<table style="width: 100%; border-collapse: collapse; margin: 2rem 0;">
  <thead>
    <tr style="background: #1e293b; color: white;">
      <th style="padding: 1rem; text-align: left; border: 1px solid #cbd5e1;">Tipo</th>
      <th style="padding: 1rem; text-align: left; border: 1px solid #cbd5e1;">¿Qué hace con dividendos?</th>
      <th style="padding: 1rem; text-align: left; border: 1px solid #cbd5e1;">Mejor para...</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background: #f8fafc;">
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><strong>Acumulación (Acc)</strong></td>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">Reinvierte automáticamente en el ETF</td>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">Inversión a largo plazo, interés compuesto</td>
    </tr>
    <tr>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;"><strong>Distribución (Dist)</strong></td>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">Paga dividendos en efectivo (trimestral)</td>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">Jubilación, rentas pasivas</td>
    </tr>
  </tbody>
</table>

<p>
<strong>En España:</strong> Los ETFs de acumulación son más eficientes fiscalmente.
No tributan hasta vender, mientras que los dividendos de ETFs distribución tributan cada año.
</p>

<h2>Ejemplos de ETFs Populares</h2>

<h3>ETFs de Índices Globales</h3>
<ul>
  <li><strong>Vanguard S&P 500 UCITS ETF (VUSA):</strong> 500 empresas USA, TER 0.07%</li>
  <li><strong>iShares Core MSCI World (IWDA):</strong> 1,500 empresas desarrolladas, TER 0.20%</li>
  <li><strong>Vanguard FTSE All-World (VWCE):</strong> 3,700 empresas (desarrolladas + emergentes), TER 0.22%</li>
</ul>

<h3>ETFs de Europa</h3>
<ul>
  <li><strong>iShares Core EURO STOXX 50 (SX5E):</strong> 50 empresas Eurozona, TER 0.10%</li>
  <li><strong>Lyxor IBEX 35 (LYIB):</strong> Bolsa española, TER 0.30%</li>
</ul>

<h3>ETFs Sectoriales y Temáticos</h3>
<ul>
  <li><strong>iShares Global Clean Energy (ICLN):</strong> Energías renovables, TER 0.46%</li>
  <li><strong>ARK Innovation ETF (ARKK):</strong> Empresas disruptivas (IA, genómica), TER 0.75%</li>
  <li><strong>SPDR Gold Shares (GLD):</strong> Oro físico, TER 0.40%</li>
</ul>

<h2>¿Cómo Comprar ETFs en España?</h2>

<h3>Paso 1: Elegir un Broker</h3>
<p>Opciones populares en España:</p>
<ul>
  <li><strong>Interactive Brokers:</strong> Comisiones bajas, amplio catálogo global</li>
  <li><strong>DeGiro:</strong> Sin comisiones en ETFs de la lista core (100+ ETFs gratis)</li>
  <li><strong>MyInvestor:</strong> Sin comisiones, pero catálogo limitado</li>
  <li><strong>Renta 4, Openbank:</strong> Bancos tradicionales (comisiones más altas)</li>
</ul>

<h3>Paso 2: Buscar el ETF por Ticker o ISIN</h3>
<p>
Cada ETF tiene un <strong>ticker</strong> (ej: VUSA, IWDA) y un código <strong>ISIN</strong> (ej: IE00B3XXRP09).
Búscalo en el catálogo del broker.
</p>

<h3>Paso 3: Introducir Orden de Compra</h3>
<ul>
  <li><strong>Orden de mercado:</strong> Compra al precio actual (ejecución inmediata)</li>
  <li><strong>Orden limitada:</strong> Compra solo si el precio alcanza tu límite</li>
</ul>

<h3>Paso 4: Revisar Holdings y Rebalancear</h3>
<p>
Los ETFs se rebalancean automáticamente, pero revisa tu cartera trimestralmente para ajustar asignación.
</p>

<h2>Impuestos y Fiscalidad de ETFs en España (2026)</h2>

<h3>Tributación de Ganancias (al vender)</h3>
<table style="width: 100%; border-collapse: collapse; margin: 1.5rem 0;">
  <thead>
    <tr style="background: #1e293b; color: white;">
      <th style="padding: 1rem; border: 1px solid #cbd5e1;">Ganancia</th>
      <th style="padding: 1rem; border: 1px solid #cbd5e1;">Tipo impositivo</th>
    </tr>
  </thead>
  <tbody>
    <tr style="background: #f8fafc;">
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">Hasta 6,000€</td>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">19%</td>
    </tr>
    <tr>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">6,001€ - 50,000€</td>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">21%</td>
    </tr>
    <tr style="background: #f8fafc;">
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">50,001€ - 200,000€</td>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">23%</td>
    </tr>
    <tr>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">Más de 200,000€</td>
      <td style="padding: 0.75rem; border: 1px solid #e2e8f0;">26%</td>
    </tr>
  </tbody>
</table>

<h3>Tributación de Dividendos (ETFs distribución)</h3>
<p>
Los dividendos tributan como <strong>rendimientos del capital mobiliario</strong> al mismo tipo que las ganancias.
</p>

<h3>Ventaja Fiscal: Traspasos sin Tributar (hasta 2026)</h3>
<p>
<strong>Importante:</strong> Hasta 2026, puedes traspasar entre ETFs sin tributar (diferimiento fiscal).
A partir de 2027, se eliminará este beneficio y se tributará en cada venta.
</p>

<div class="warning-box" style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 1.5rem; margin: 2rem 0; border-radius: 8px;">
  <h3 style="margin-top: 0; color: #dc2626;">⚠️ Cambio Normativo 2027</h3>
  <p style="margin-bottom: 0; color: #991b1b; line-height: 1.8;">
    A partir de enero de 2027, los traspasos entre ETFs <strong>sí tributarán</strong>.
    Si planeas rebalancear, considera hacerlo antes de esa fecha para aprovechar el beneficio fiscal.
  </p>
</div>

<h2>Estrategias de Inversión con ETFs</h2>

<h3>1. Buy and Hold (Comprar y Mantener)</h3>
<p>
Compra ETFs de índices globales (MSCI World, S&P 500) y mantén 10-30 años.
<strong>Rentabilidad histórica:</strong> 7-10% anual promedio.
</p>

<h3>2. Dollar Cost Averaging (DCA)</h3>
<p>
Invierte una cantidad fija mensual (ej: 300€/mes) independientemente del precio.
Reduce impacto de volatilidad y elimina timing del mercado.
</p>

<h3>3. Cartera 60/40 (Acciones/Bonos)</h3>
<p>
60% ETFs de renta variable + 40% ETFs de bonos. Balance entre rentabilidad y estabilidad.
</p>

<h3>4. Cartera Bogleheads (3 ETFs)</h3>
<ul>
  <li>50% ETF global (VWCE, IWDA)</li>
  <li>30% ETF bonos (AGG, VGEA)</li>
  <li>20% ETF emergentes (EIMI, VWO)</li>
</ul>

<h2>Preguntas Frecuentes (FAQs)</h2>

<div class="faq-section" style="margin: 2rem 0;">

  <details style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem; cursor: pointer;">
    <summary style="font-weight: 700; font-size: 1.05rem; color: #1e293b; cursor: pointer;">
      ¿Cuánto dinero necesito para empezar a invertir en ETFs?
    </summary>
    <p style="margin-top: 1rem; color: #475569; line-height: 1.8;">
      Desde <strong>50-100€</strong> puedes comprar 1 participación de ETFs como VUSA o IWDA.
      Brokers como DeGiro o MyInvestor no exigen inversión mínima.
      Recomendación: empieza con 100-300€/mes en DCA para crear el hábito.
    </p>
  </details>

  <details style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem;">
    <summary style="font-weight: 700; font-size: 1.05rem; color: #1e293b; cursor: pointer;">
      ¿Qué es mejor: ETF o fondo indexado?
    </summary>
    <p style="margin-top: 1rem; color: #475569; line-height: 1.8;">
      <strong>ETFs:</strong> liquidez inmediata, comisiones más bajas, cotizan en bolsa.
      <strong>Fondos indexados:</strong> traspasos sin tributar (permanente), ideales si inviertes a muy largo plazo.
      En España, hasta 2026 los ETFs también tienen traspasos sin tributar.
      Ambos replican índices, la diferencia es operativa.
    </p>
  </details>

  <details style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem;">
    <summary style="font-weight: 700; font-size: 1.05rem; color: #1e293b; cursor: pointer;">
      ¿Los ETFs reparten dividendos?
    </summary>
    <p style="margin-top: 1rem; color: #475569; line-height: 1.8;">
      Depende del tipo de ETF. Los <strong>ETFs de distribución</strong> pagan dividendos trimestralmente.
      Los <strong>ETFs de acumulación</strong> reinvierten los dividendos automáticamente.
      En España, los ETFs Acc son más eficientes fiscalmente porque no tributan hasta vender.
    </p>
  </details>

  <details style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem;">
    <summary style="font-weight: 700; font-size: 1.05rem; color: #1e293b; cursor: pointer;">
      ¿Puedo perder todo mi dinero con un ETF?
    </summary>
    <p style="margin-top: 1rem; color: #475569; line-height: 1.8;">
      Técnicamente <strong>sí</strong>, si todas las empresas del índice quiebran (extremadamente improbable).
      En índices globales como MSCI World (1,500 empresas), la diversificación minimiza este riesgo.
      Sin embargo, puedes perder <strong>temporalmente</strong> 20-50% en crisis (2008, 2020).
      Historicamente, los mercados siempre se recuperan en plazos de 5-10 años.
    </p>
  </details>

  <details style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem;">
    <summary style="font-weight: 700; font-size: 1.05rem; color: #1e293b; cursor: pointer;">
      ¿Cuál es el mejor ETF para principiantes?
    </summary>
    <p style="margin-top: 1rem; color: #475569; line-height: 1.8;">
      <strong>Vanguard FTSE All-World (VWCE)</strong> o <strong>iShares MSCI World (IWDA)</strong>.
      Ambos ofrecen diversificación global instantánea (3,000+ empresas), comisiones bajas (&lt;0.25%),
      y son ETFs de acumulación (reinvierten dividendos). Ideal para DCA mensual a largo plazo.
    </p>
  </details>

  <details style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem;">
    <summary style="font-weight: 700; font-size: 1.05rem; color: #1e293b; cursor: pointer;">
      ¿Qué es el TER de un ETF?
    </summary>
    <p style="margin-top: 1rem; color: #475569; line-height: 1.8;">
      El <strong>TER (Total Expense Ratio)</strong> es el coste anual total de gestión del ETF.
      Incluye comisiones de gestión, custodia y auditoría. Se descuenta automáticamente del valor del ETF.
      Ejemplo: TER 0.20% = pagas 20€ al año por cada 10,000€ invertidos.
      ETFs pasivos tienen TER de 0.05%-0.50%, fondos activos 1-2%.
    </p>
  </details>

  <details style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem;">
    <summary style="font-weight: 700; font-size: 1.05rem; color: #1e293b; cursor: pointer;">
      ¿Los ETFs están garantizados por el FGD (Fondo de Garantía de Depósitos)?
    </summary>
    <p style="margin-top: 1rem; color: #475569; line-height: 1.8;">
      <strong>No.</strong> Los ETFs son valores mobiliarios, no depósitos bancarios.
      Sin embargo, están <strong>segregados</strong>: si tu broker quiebra, tus ETFs siguen siendo tuyos
      (no forman parte del patrimonio del broker). Los recuperas al migrar a otro broker.
    </p>
  </details>

  <details style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem;">
    <summary style="font-weight: 700; font-size: 1.05rem; color: #1e293b; cursor: pointer;">
      ¿Qué es mejor: ETF de acumulación o distribución en España?
    </summary>
    <p style="margin-top: 1rem; color: #475569; line-height: 1.8;">
      <strong>ETF de acumulación (Acc)</strong> para largo plazo. No tributan hasta vender,
      aprovechando interés compuesto y diferimiento fiscal. Los ETFs distribución tributan cada año
      por dividendos, reduciendo rentabilidad neta. Excepción: si necesitas ingresos pasivos en jubilación.
    </p>
  </details>

  <details style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem;">
    <summary style="font-weight: 700; font-size: 1.05rem; color: #1e293b; cursor: pointer;">
      ¿Qué diferencia hay entre ETF domiciliado en Irlanda vs USA?
    </summary>
    <p style="margin-top: 1rem; color: #475569; line-height: 1.8;">
      <strong>Domicilio Irlanda (UCITS):</strong> retención dividendos USA 15%, recuperable en España.
      <strong>Domicilio USA:</strong> retención 30%, NO recuperable. En España, <strong>siempre elige ETFs UCITS</strong>
      (domiciliados en Irlanda, Luxemburgo). Tienen código ISIN que empieza por IE o LU.
    </p>
  </details>

  <details style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; margin-bottom: 1rem;">
    <summary style="font-weight: 700; font-size: 1.05rem; color: #1e293b; cursor: pointer;">
      ¿Puedo invertir en ETFs desde una cuenta de pensiones (PIAS, PPA)?
    </summary>
    <p style="margin-top: 1rem; color: #475569; line-height: 1.8;">
      <strong>Depende del producto.</strong> Los PIAS/SIALP suelen permitir ETFs si el gestor lo habilita.
      Los <strong>Planes de Pensiones tradicionales</strong> generalmente no permiten ETFs directamente,
      solo fondos de pensiones. Alternativa: abrir cuenta individual de broker y gestionar ETFs manualmente.
    </p>
  </details>

</div>

<h2>Conclusión: ¿Son los ETFs para Ti?</h2>

<p>
Los ETFs son <strong>ideales para:</strong>
</p>
<ul>
  <li>Principiantes que quieren diversificar sin complicaciones</li>
  <li>Inversores a largo plazo (10-30 años) que buscan réplica de índices</li>
  <li>Personas que prefieren gestión pasiva (sin analizar empresas)</li>
  <li>Inversores que valoran transparencia y comisiones bajas</li>
</ul>

<p>
<strong>No son ideales para:</strong>
</p>
<ul>
  <li>Traders de corto plazo (mejor acciones individuales)</li>
  <li>Inversores que buscan batir al mercado (necesitan fondos activos o stock picking)</li>
  <li>Perfiles muy conservadores (mejor bonos o depósitos)</li>
</ul>

<div class="cta-section" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2.5rem; border-radius: 16px; margin: 3rem 0; text-align: center;">
  <h3 style="margin-top: 0; font-size: 1.75rem; color: white;">🚀 ¿Listo para Empezar?</h3>
  <p style="font-size: 1.15rem; line-height: 1.8; margin: 1.5rem 0;">
    Explora nuestro <strong>ranking de ETFs 2026</strong> con más de 170 fondos analizados.
    Filtra por región, sector y TER. ETFNexo Score actualizado semanalmente.
  </p>
  <a href="/rankings" style="display: inline-block; background: white; color: #667eea; padding: 1rem 2rem; border-radius: 8px; font-weight: 700; text-decoration: none; margin-top: 1rem; transition: transform 0.2s;">
    Ver Rankings de ETFs →
  </a>
</div>

<div class="key-takeaways" style="background: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 2rem; margin: 3rem 0;">
  <h3 style="margin-top: 0; color: #16a34a;">📌 Puntos Clave para Recordar</h3>
  <ul style="margin-bottom: 0; line-height: 2; color: #166534;">
    <li>Los ETFs son fondos que cotizan en bolsa y replican índices</li>
    <li>Ofrecen diversificación instantánea con inversión mínima (50-100€)</li>
    <li>Comisiones muy bajas (TER 0.05%-0.50%) vs fondos activos (1-2%)</li>
    <li>Liquidez inmediata: compra/vende en horario de bolsa</li>
    <li>En España, ETFs de acumulación son más eficientes fiscalmente</li>
    <li>Estrategia recomendada: DCA mensual en ETF global (VWCE, IWDA)</li>
    <li>Horizontes de 10-30 años minimizan riesgo de volatilidad</li>
  </ul>
</div>

</div>
  `,
  excerpt: 'Guía completa sobre qué son los ETFs: definición, tipos, ventajas, fiscalidad en España, mejores ETFs 2026 y cómo empezar a invertir con ejemplos prácticos.',
  featured_image_url: '/images/academia/que-son-los-etf-hero.jpg',
  featured_image_alt: 'Gráfico explicativo de qué son los ETFs - Fondos cotizados en bolsa',
  meta_title: '¿Qué son los ETFs? Guía Completa 2026 para Invertir en Fondos Cotizados',
  meta_description: '✓ Qué son los ETFs ✓ Cómo funcionan ✓ Tipos de ETFs ✓ Ventajas y desventajas ✓ Fiscalidad en España ✓ Mejores ETFs 2026 ✓ Guía para principiantes con ejemplos',
  tags: ['etf', 'fondos cotizados', 'inversión', 'bolsa', 'índices', 'diversificación', 'guía principiantes'],
  difficulty: 'beginner',
  reading_time_minutes: 15,
  faq: [
    {
      question: '¿Cuánto dinero necesito para empezar a invertir en ETFs?',
      answer: 'Desde 50-100€ puedes comprar 1 participación de ETFs como VUSA o IWDA. Brokers como DeGiro o MyInvestor no exigen inversión mínima. Recomendación: empieza con 100-300€/mes en DCA para crear el hábito.'
    },
    {
      question: '¿Qué es mejor: ETF o fondo indexado?',
      answer: 'ETFs: liquidez inmediata, comisiones más bajas, cotizan en bolsa. Fondos indexados: traspasos sin tributar (permanente), ideales si inviertes a muy largo plazo. En España, hasta 2026 los ETFs también tienen traspasos sin tributar. Ambos replican índices, la diferencia es operativa.'
    },
    {
      question: '¿Los ETFs reparten dividendos?',
      answer: 'Depende del tipo de ETF. Los ETFs de distribución pagan dividendos trimestralmente. Los ETFs de acumulación reinvierten los dividendos automáticamente. En España, los ETFs Acc son más eficientes fiscalmente porque no tributan hasta vender.'
    },
    {
      question: '¿Cuál es el mejor ETF para principiantes?',
      answer: 'Vanguard FTSE All-World (VWCE) o iShares MSCI World (IWDA). Ambos ofrecen diversificación global instantánea (3,000+ empresas), comisiones bajas (<0.25%), y son ETFs de acumulación (reinvierten dividendos). Ideal para DCA mensual a largo plazo.'
    },
    {
      question: '¿Qué es el TER de un ETF?',
      answer: 'El TER (Total Expense Ratio) es el coste anual total de gestión del ETF. Incluye comisiones de gestión, custodia y auditoría. Se descuenta automáticamente del valor del ETF. Ejemplo: TER 0.20% = pagas 20€ al año por cada 10,000€ invertidos.'
    }
  ],
  status: 'published',
  published_at: new Date().toISOString(),
  author_id: null, // Se asignará automáticamente
};

async function createArticle() {
  try {
    const { data, error } = await supabase
      .from('academy_articles')
      .insert([article])
      .select()
      .single();

    if (error) {
      console.error('Error creating article:', error);
      process.exit(1);
    }

    console.log('✅ Article created successfully!');
    console.log('ID:', data.id);
    console.log('Slug:', data.slug);
    console.log('URL:', `https://etfnexo.com/academia/${data.slug}`);
  } catch (err) {
    console.error('Unexpected error:', err);
    process.exit(1);
  }
}

createArticle();
