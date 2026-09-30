/**
 * Explain Term Tool - WebMCP
 *
 * Explica términos financieros relacionados con ETFs en contexto
 * Busca en el glosario de academia y sugiere contenido relacionado
 */

import { createClient } from '@/lib/supabase/client';
import type { Tool, ExplainTermArgs, ExplainTermResult } from '../types';

// Glosario básico embebido (mientras se crea el glosario en Supabase)
const EMBEDDED_GLOSSARY: Record<string, { definition: string; example?: string; importance: 'low' | 'medium' | 'high' }> = {
  'ter': {
    definition: 'Total Expense Ratio (TER) es el porcentaje de gastos anuales que cobra el ETF. Incluye comisiones de gestión, custodia y administración.',
    example: 'Un ETF con TER de 0.20% significa que por cada €10,000 invertidos, pagarás €20 al año en gastos.',
    importance: 'high',
  },
  'tracking error': {
    definition: 'Tracking Error mide cuánto se desvía la rentabilidad del ETF respecto a su índice de referencia. Menor tracking error = mejor replicación.',
    example: 'Si el índice S&P 500 sube +10% y tu ETF sube +9.85%, el tracking error es ~0.15%.',
    importance: 'high',
  },
  'aum': {
    definition: 'Assets Under Management (AUM) es el valor total de los activos gestionados por el ETF. Mayor AUM generalmente significa mayor liquidez.',
    example: 'Un ETF con AUM de €5B es más líquido que uno con €100M, lo que facilita comprar/vender sin impactar el precio.',
    importance: 'medium',
  },
  'réplica física': {
    definition: 'Réplica Física significa que el ETF compra directamente todas (o la mayoría) de las acciones del índice que replica.',
    example: 'Un ETF del S&P 500 con réplica física posee acciones reales de Apple, Microsoft, Amazon, etc.',
    importance: 'medium',
  },
  'réplica sintética': {
    definition: 'Réplica Sintética usa derivados (swaps) en lugar de comprar acciones directamente. Puede tener menor tracking error pero añade riesgo de contraparte.',
    example: 'Un ETF sintético del MSCI World usa un swap con un banco para replicar el índice sin poseer las acciones.',
    importance: 'medium',
  },
  'esg': {
    definition: 'ESG (Environmental, Social, Governance) son criterios de inversión sostenible. Los ETFs ESG excluyen empresas con bajo desempeño ambiental, social o de gobernanza.',
    example: 'Un ETF ESG excluiría empresas de tabaco, armas, o con alta huella de carbono.',
    importance: 'high',
  },
  'dividend yield': {
    definition: 'Dividend Yield es el porcentaje de dividendos anuales que paga el ETF respecto a su precio. Importante para inversores que buscan ingresos.',
    example: 'Un ETF con precio €100 que paga €3 en dividendos anuales tiene dividend yield de 3%.',
    importance: 'medium',
  },
  'etfnexo score': {
    definition: 'ETFNexo Score es nuestra calificación propietaria (0-10) que evalúa la calidad del ETF considerando TER, tracking error, liquidez, diversificación y rendimiento histórico.',
    example: 'Un score de 9/10 indica un ETF excelente en todos los criterios. Un score <6/10 requiere evaluación cuidadosa.',
    importance: 'high',
  },
};

export const explainTermTool: Tool<ExplainTermArgs, ExplainTermResult> = {
  name: 'explain-etf-term',
  description:
    'Explica un término financiero relacionado con ETFs, con ejemplos prácticos y enlaces a contenido educativo. Términos soportados: TER, tracking error, AUM, réplica física/sintética, ESG, dividend yield, ETFNexo Score, y más.',
  requiresAuth: false,
  inputSchema: {
    type: 'object',
    properties: {
      term: {
        type: 'string',
        description:
          'Término a explicar. Ejemplos: "TER", "tracking error", "réplica física", "ESG", "dividend yield", "AUM"',
      },
      context: {
        type: 'string',
        description:
          'Contexto opcional de dónde apareció el término (slug del artículo, sección de la página). Ayuda a personalizar la explicación.',
      },
    },
    required: ['term'],
  },

  async execute({ term, context }) {
    console.log('[WebMCP] explain-etf-term invoked:', { term, context });

    // Emit evento de inicio
    window.dispatchEvent(
      new CustomEvent('webmcp:tool-invoked', {
        detail: { toolName: 'explain-etf-term', args: { term, context }, timestamp: Date.now() },
      })
    );

    const startTime = Date.now();

    try {
      const normalizedTerm = term.toLowerCase().trim();

      // 1. Buscar en glosario embebido
      let definition = EMBEDDED_GLOSSARY[normalizedTerm]?.definition;
      let example = EMBEDDED_GLOSSARY[normalizedTerm]?.example;
      let importance = EMBEDDED_GLOSSARY[normalizedTerm]?.importance || 'medium';

      // 2. Si no está en embebido, fallback a definición básica
      // TODO: Cuando se cree tabla academy_glossary en Supabase, descomentar búsqueda
      if (!definition) {
        // const supabase = createClient();
        // const { data: glossaryEntry } = await supabase
        //   .from('academy_glossary')
        //   .select('term, definition, example, importance')
        //   .ilike('term', normalizedTerm)
        //   .single();
        //
        // if (glossaryEntry) {
        //   definition = glossaryEntry.definition;
        //   example = glossaryEntry.example;
        //   importance = glossaryEntry.importance || 'medium';
        // }

        // Fallback: generar definición básica
        definition = `"${term}" es un término financiero relacionado con ETFs. Consulta nuestra academia para más información.`;
      }

      // 3. Buscar artículos relacionados que mencionen el término
      const supabase = createClient();
      const { data: relatedArticles } = await supabase
        .from('academy_articles')
        .select('slug, title, excerpt')
        .or(`title.ilike.%${normalizedTerm}%,content.ilike.%${normalizedTerm}%`)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(3);

      // 4. Preparar resultado
      const result: ExplainTermResult = {
        term,
        definition,
        example,
        relatedArticles: (relatedArticles || []).map((article) => ({
          slug: article.slug,
          title: article.title,
          excerpt: article.excerpt || '',
        })),
        importance: importance as 'low' | 'medium' | 'high',
      };

      // 5. Actualizar UI vía evento
      window.dispatchEvent(
        new CustomEvent('webmcp:term-explained', {
          detail: {
            term,
            definition,
            relatedArticles: result.relatedArticles,
          },
        })
      );

      // 6. Highlight término en página (si hay context)
      if (context && typeof document !== 'undefined') {
        highlightTermInPage(term);
      }

      const duration = Date.now() - startTime;
      console.log(`[WebMCP] explain-etf-term completed in ${duration}ms`);

      // Emit evento de finalización
      window.dispatchEvent(
        new CustomEvent('webmcp:tool-completed', {
          detail: { toolName: 'explain-etf-term', result, duration },
        })
      );

      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error('[WebMCP] explain-etf-term error:', error);

      // Emit evento de error
      window.dispatchEvent(
        new CustomEvent('webmcp:tool-error', {
          detail: { toolName: 'explain-etf-term', error: error.message },
        })
      );

      throw error;
    }
  },
};

/**
 * Highlight un término en la página actual
 * Usa mark.js para resaltar todas las ocurrencias
 */
function highlightTermInPage(term: string): void {
  try {
    // Buscar todas las ocurrencias del término en el contenido principal
    const mainContent = document.querySelector('main') || document.body;
    const textNodes: Text[] = [];

    // Recursively find all text nodes
    function findTextNodes(node: Node) {
      if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node as Text);
      } else {
        node.childNodes.forEach(findTextNodes);
      }
    }

    findTextNodes(mainContent);

    // Highlight término (case-insensitive)
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    textNodes.forEach((textNode) => {
      const text = textNode.textContent || '';
      if (regex.test(text)) {
        const span = document.createElement('mark');
        span.className = 'webmcp-highlight';
        span.style.backgroundColor = '#ffd700';
        span.style.padding = '2px 4px';
        span.style.borderRadius = '2px';
        span.style.transition = 'background-color 0.3s';

        const highlightedText = text.replace(regex, (match) => `<mark class="webmcp-highlight">${match}</mark>`);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = highlightedText;

        if (textNode.parentNode) {
          while (tempDiv.firstChild) {
            textNode.parentNode.insertBefore(tempDiv.firstChild, textNode);
          }
          textNode.parentNode.removeChild(textNode);
        }
      }
    });

    // Auto-remove highlight después de 5 segundos
    setTimeout(() => {
      document.querySelectorAll('.webmcp-highlight').forEach((mark) => {
        const text = mark.textContent || '';
        const textNode = document.createTextNode(text);
        mark.parentNode?.replaceChild(textNode, mark);
      });
    }, 5000);
  } catch (error) {
    console.error('[WebMCP] Error highlighting term:', error);
  }
}
