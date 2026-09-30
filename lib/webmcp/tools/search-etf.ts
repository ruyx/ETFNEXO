/**
 * Search ETF Tool - WebMCP
 *
 * Permite a AI agents buscar ETFs usando lenguaje natural
 * Ejemplo: "ETFs de tecnología europea con TER bajo"
 */

import { createClient } from '@/lib/supabase/client';
import type { Tool, SearchETFArgs, SearchETFResult } from '../types';
import { parseNaturalQuery, describeFilters, validateFilters } from '../utils/nlp-parser';

export const searchETFTool: Tool<SearchETFArgs, SearchETFResult> = {
  name: 'search-etf',
  description:
    'Busca ETFs por criterios específicos usando lenguaje natural. Soporta filtros por región (Europa, USA, Emergentes, Asia, Global), sector (Technology, Healthcare, ESG, Financials, Energy, Consumer, Real Estate), TER (gastos), AUM (tamaño del fondo), ETFNexo Score (calidad), y tipo de réplica (física/sintética). Actualiza la interfaz con los resultados encontrados.',
  requiresAuth: false,
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description:
          'Descripción del tipo de ETF buscado en lenguaje natural. Ejemplos: "ETFs de tecnología europea con TER bajo", "ETFs sostenibles de emergentes", "ETFs grandes de USA", "mejores ETFs de salud"',
      },
      maxResults: {
        type: 'number',
        default: 20,
        minimum: 1,
        maximum: 100,
        description: 'Número máximo de resultados a devolver (default: 20, máximo: 100)',
      },
    },
    required: ['query'],
  },

  async execute({ query, maxResults = 20 }) {
    console.log('[WebMCP] search-etf invoked:', { query, maxResults });

    // Emit evento de inicio
    window.dispatchEvent(
      new CustomEvent('webmcp:tool-invoked', {
        detail: { toolName: 'search-etf', args: { query, maxResults }, timestamp: Date.now() },
      })
    );

    const startTime = Date.now();

    try {
      // 1. Parsear query en lenguaje natural → filtros estructurados
      const filters = parseNaturalQuery(query);
      console.log('[WebMCP] Parsed filters:', filters);

      // 2. Validar filtros
      const validation = validateFilters(filters);
      if (!validation.valid) {
        throw new Error(`Filtros inválidos: ${validation.errors.join(', ')}`);
      }

      // 3. Construir query a Supabase
      const supabase = createClient();
      let queryBuilder = supabase
        .from('etfs')
        .select(
          'isin, name, ter, aum_millions, average_rating, region, sector, replication_method, yahoo_ticker'
        )
        .eq('is_active' as any, true as any)
        .order('average_rating', { ascending: false, nullsFirst: false })
        .limit(maxResults);

      // Aplicar filtros
      if (filters.region) {
        queryBuilder = queryBuilder.eq('region', filters.region);
      }

      if (filters.sector) {
        queryBuilder = queryBuilder.eq('sector', filters.sector);
      }

      if (filters.maxTER !== undefined) {
        queryBuilder = queryBuilder.lte('ter', filters.maxTER);
      }

      if (filters.minAUM !== undefined) {
        // Convertir AUM de euros a millions para la query
        const minAUMMillions = filters.minAUM / 1_000_000;
        queryBuilder = queryBuilder.gte('aum_millions', minAUMMillions);
      }

      if (filters.minScore !== undefined) {
        queryBuilder = queryBuilder.gte('average_rating', filters.minScore);
      }

      if (filters.replicationType) {
        queryBuilder = queryBuilder.eq('replication_method', filters.replicationType);
      }

      // 4. Ejecutar query
      const { data, error } = await queryBuilder;

      if (error) {
        console.error('[WebMCP] Search error:', error);
        throw new Error(`Error buscando ETFs: ${error.message}`);
      }

      // 5. Preparar resultado
      const result: SearchETFResult = {
        count: data?.length || 0,
        etfs: (data || []).map((etf) => ({
          ticker: etf.yahoo_ticker || etf.isin, // Usar yahoo_ticker o ISIN como identificador
          name: etf.name,
          ter: etf.ter || 0,
          aum: (etf.aum_millions || 0) * 1_000_000, // Convertir millions → euros
          etfnexo_score: etf.average_rating || 0, // ETFNexo score es average_rating
          region: etf.region || undefined,
          sector: etf.sector || undefined,
        })),
        appliedFilters: filters,
        query,
      };

      // 6. Actualizar UI vía evento
      window.dispatchEvent(
        new CustomEvent('webmcp:search-results', {
          detail: {
            etfs: result.etfs,
            query,
            filters,
          },
        })
      );

      const duration = Date.now() - startTime;
      console.log(`[WebMCP] search-etf completed in ${duration}ms:`, result.count, 'ETFs found');

      // Emit evento de finalización
      window.dispatchEvent(
        new CustomEvent('webmcp:tool-completed', {
          detail: { toolName: 'search-etf', result, duration },
        })
      );

      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      console.error('[WebMCP] search-etf error:', error);

      // Emit evento de error
      window.dispatchEvent(
        new CustomEvent('webmcp:tool-error', {
          detail: { toolName: 'search-etf', error: error.message },
        })
      );

      throw error;
    }
  },
};
