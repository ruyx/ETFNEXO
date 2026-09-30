/**
 * WebMCP - Web Machine Learning Control Protocol
 *
 * Main export file for WebMCP integration
 */

// Registry
export { WebMCPRegistry, getWebMCPRegistry, initializeWebMCP } from './registry';

// Tools
export { searchETFTool } from './tools/search-etf';
export { explainTermTool } from './tools/explain-term';
export { analyzePortfolioTool } from './tools/analyze-portfolio';
export { compareETFsTool } from './tools/compare-etfs';

// Utils
export { parseNaturalQuery, describeFilters, validateFilters } from './utils/nlp-parser';
export {
  parseAdvancedQuery,
  validateAndNormalizeFilters,
  describeFiltersAdvanced,
  detectIntent
} from './utils/nlp-parser-advanced';
export {
  checkRateLimit,
  resetRateLimit,
  getRateLimitStats,
  cleanupExpiredLimits,
  RATE_LIMITS,
} from './utils/rate-limiter';
export {
  sanitizeString,
  validateTicker,
  validateTickers,
  validateWeights,
  validateSearchQuery,
  validateTerm,
} from './utils/security';

// Hooks
export { useWebMCP, useWebMCPSupport } from './hooks/useWebMCP';

// Types
export type {
  Tool,
  ToolInputSchema,
  SearchETFArgs,
  SearchETFResult,
  SearchFilters,
  ExplainTermArgs,
  ExplainTermResult,
  AnalyzePortfolioArgs,
  AnalyzePortfolioResult,
  PortfolioMetrics,
  PortfolioRecommendation,
  CompareETFsArgs,
  CompareETFsResult,
  ETFComparison,
  ComparisonWinners,
  WebMCPEventMap,
} from './types';
