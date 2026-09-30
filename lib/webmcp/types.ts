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

// Analyze Portfolio Tool Types
export interface AnalyzePortfolioArgs {
  tickers: string[];
  weights?: number[];
}

export interface PortfolioMetrics {
  totalETFs: number;
  averageTER: number;
  totalAUM: number;
  averageScore: number;
  regionExposure: Record<string, number>;
  sectorExposure: Record<string, number>;
  replicationMix: {
    physical: number;
    synthetic: number;
    unknown: number;
  };
}

export interface PortfolioRecommendation {
  type: 'warning' | 'suggestion' | 'optimization';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  affectedETFs?: string[];
}

export interface AnalyzePortfolioResult {
  metrics: PortfolioMetrics;
  recommendations: PortfolioRecommendation[];
  etfs: Array<{
    ticker: string;
    name: string;
    weight: number;
    ter: number;
    score: number;
    region?: string;
    sector?: string;
  }>;
}

// Compare ETFs Tool Types
export interface CompareETFsArgs {
  tickers: string[];
  metrics?: string[];
}

export interface ETFComparison {
  ticker: string;
  name: string;
  ter: number;
  aum: number;
  score: number;
  region?: string;
  sector?: string;
  replicationMethod?: string;
}

export interface ComparisonWinners {
  lowestTER?: string;
  highestScore?: string;
  largestAUM?: string;
  bestReplication?: string;
}

export interface CompareETFsResult {
  etfs: ETFComparison[];
  winners: ComparisonWinners;
  summary: string;
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
  'webmcp:portfolio-analyzed': CustomEvent<{
    metrics: PortfolioMetrics;
    recommendations: PortfolioRecommendation[];
    etfs: AnalyzePortfolioResult['etfs'];
  }>;
  'webmcp:etfs-compared': CustomEvent<{
    etfs: ETFComparison[];
    winners: ComparisonWinners;
    summary: string;
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
