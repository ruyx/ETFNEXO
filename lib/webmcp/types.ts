/**
 * WebMCP Types
 *
 * Types para la integración de Web Machine Learning Control Protocol
 * Permite exponer funcionalidades de ETF Nexo como "tools" para AI agents
 */

export interface ToolInputSchema {
  type: 'object';
  properties: Record<string, {
    type: string;
    description: string;
    default?: any;
    enum?: string[];
    items?: any;
    minimum?: number;
    maximum?: number;
    minItems?: number;
    maxItems?: number;
  }>;
  required?: string[];
}

export interface Tool<TArgs = any, TResult = any> {
  name: string;
  description: string;
  inputSchema: ToolInputSchema;
  requiresAuth?: boolean;
  execute: (args: TArgs) => Promise<TResult>;
}

// Search ETF Tool Types
export interface SearchETFArgs {
  query: string;
  maxResults?: number;
}

export interface SearchETFResult {
  count: number;
  etfs: Array<{
    ticker: string;
    name: string;
    ter: number;
    aum: number;
    etfnexo_score: number;
    region?: string;
    sector?: string;
  }>;
  appliedFilters: SearchFilters;
  query: string;
}

export interface SearchFilters {
  region?: string;
  sector?: string;
  maxTER?: number;
  minAUM?: number;
  minScore?: number;
  replicationType?: 'physical' | 'synthetic';
}

// Explain Term Tool Types
export interface ExplainTermArgs {
  term: string;
  context?: string;
}

export interface ExplainTermResult {
  term: string;
  definition: string;
  example?: string;
  relatedArticles: Array<{
    slug: string;
    title: string;
    excerpt: string;
  }>;
  importance: 'low' | 'medium' | 'high';
}

// WebMCP Document API (browser extension of Document)
declare global {
  interface Document {
    modelContext?: {
      registerTool(tool: {
        name: string;
        description: string;
        inputSchema: ToolInputSchema;
        execute: (args: any) => Promise<any>;
      }): Promise<void>;
    };
  }

  interface Window {
    __ETF_NEXO_WEBMCP_ENABLED__?: boolean;
    __ETF_NEXO_EXTENSION__?: boolean;
  }
}

// Custom Events para comunicación entre tools y UI
export interface WebMCPEventMap {
  'webmcp:search-results': CustomEvent<{
    etfs: SearchETFResult['etfs'];
    query: string;
    filters: SearchFilters;
  }>;
  'webmcp:term-explained': CustomEvent<{
    term: string;
    definition: string;
    relatedArticles: ExplainTermResult['relatedArticles'];
  }>;
  'webmcp:tool-invoked': CustomEvent<{
    toolName: string;
    args: any;
    timestamp: number;
  }>;
  'webmcp:tool-completed': CustomEvent<{
    toolName: string;
    result: any;
    duration: number;
  }>;
  'webmcp:tool-error': CustomEvent<{
    toolName: string;
    error: string;
  }>;
}

export {};
