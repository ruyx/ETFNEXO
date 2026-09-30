/**
 * useWebMCP Hook
 *
 * React hook para usar WebMCP tools desde componentes
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { getWebMCPRegistry } from '../registry';
import type { SearchETFResult, ExplainTermResult } from '../types';

export interface WebMCPStatus {
  isSupported: boolean;
  isInitialized: boolean;
  toolCount: number;
}

export function useWebMCP() {
  const [status, setStatus] = useState<WebMCPStatus>({
    isSupported: false,
    isInitialized: false,
    toolCount: 0,
  });

  const [searchResults, setSearchResults] = useState<SearchETFResult | null>(null);
  const [explainedTerm, setExplainedTerm] = useState<ExplainTermResult | null>(null);

  useEffect(() => {
    const registry = getWebMCPRegistry();

    // Actualizar status cuando se inicialice
    const handleInitialized = (e: CustomEvent) => {
      setStatus({
        isSupported: true,
        isInitialized: true,
        toolCount: e.detail.toolCount,
      });
    };

    window.addEventListener('webmcp:initialized', handleInitialized as EventListener);

    // Escuchar resultados de búsqueda
    const handleSearchResults = (e: CustomEvent) => {
      setSearchResults({
        count: e.detail.etfs.length,
        etfs: e.detail.etfs,
        appliedFilters: e.detail.filters,
        query: e.detail.query,
      });
    };

    window.addEventListener('webmcp:search-results', handleSearchResults as EventListener);

    // Escuchar explicaciones de términos
    const handleTermExplained = (e: CustomEvent) => {
      setExplainedTerm({
        term: e.detail.term,
        definition: e.detail.definition,
        relatedArticles: e.detail.relatedArticles,
        importance: 'medium', // Default
      });
    };

    window.addEventListener('webmcp:term-explained', handleTermExplained as EventListener);

    // Verificar status inicial
    setStatus({
      isSupported: registry.isWebMCPSupported(),
      isInitialized: registry.isInitialized(),
      toolCount: registry.getAllTools().length,
    });

    return () => {
      window.removeEventListener('webmcp:initialized', handleInitialized as EventListener);
      window.removeEventListener('webmcp:search-results', handleSearchResults as EventListener);
      window.removeEventListener('webmcp:term-explained', handleTermExplained as EventListener);
    };
  }, []);

  const clearSearchResults = useCallback(() => {
    setSearchResults(null);
  }, []);

  const clearExplainedTerm = useCallback(() => {
    setExplainedTerm(null);
  }, []);

  return {
    status,
    searchResults,
    explainedTerm,
    clearSearchResults,
    clearExplainedTerm,
  };
}

/**
 * Hook simplificado para verificar soporte de WebMCP
 */
export function useWebMCPSupport(): boolean {
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('modelContext' in document);
  }, []);

  return isSupported;
}
