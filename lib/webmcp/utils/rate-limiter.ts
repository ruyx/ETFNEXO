/**
 * Rate Limiter para WebMCP Tools
 *
 * Previene abuso limitando llamadas por tool y usuario
 * Usa localStorage para tracking client-side
 */

export interface RateLimitConfig {
  maxCalls: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Configuración de rate limits por tool
 */
export const RATE_LIMITS: Record<string, RateLimitConfig> = {
  'search-etf': { maxCalls: 100, windowMs: 60_000 }, // 100 calls/min
  'explain-etf-term': { maxCalls: 200, windowMs: 60_000 }, // 200 calls/min
  'analyze-portfolio': { maxCalls: 20, windowMs: 60_000 }, // 20 calls/min
  'compare-etfs': { maxCalls: 50, windowMs: 60_000 }, // 50 calls/min
};

/**
 * Storage key prefix para rate limiting
 */
const STORAGE_PREFIX = 'webmcp_ratelimit_';

/**
 * Verifica si una llamada está permitida según rate limits
 */
export function checkRateLimit(toolName: string): RateLimitResult {
  const config = RATE_LIMITS[toolName];

  if (!config) {
    // Sin límite configurado, permitir
    return { allowed: true, remaining: Infinity, resetAt: 0 };
  }

  const key = `${STORAGE_PREFIX}${toolName}`;
  const now = Date.now();

  try {
    // Obtener historial de llamadas
    const historyJson = localStorage.getItem(key);
    let history: number[] = historyJson ? JSON.parse(historyJson) : [];

    // Limpiar llamadas fuera de la ventana
    history = history.filter((timestamp) => now - timestamp < config.windowMs);

    // Verificar si excede límite
    if (history.length >= config.maxCalls) {
      const oldestCall = Math.min(...history);
      const resetAt = oldestCall + config.windowMs;

      return {
        allowed: false,
        remaining: 0,
        resetAt,
      };
    }

    // Agregar nueva llamada
    history.push(now);
    localStorage.setItem(key, JSON.stringify(history));

    return {
      allowed: true,
      remaining: config.maxCalls - history.length,
      resetAt: now + config.windowMs,
    };
  } catch (error) {
    // Si localStorage falla (privado mode, etc), permitir
    console.warn('[WebMCP] Rate limit storage error:', error);
    return { allowed: true, remaining: Infinity, resetAt: 0 };
  }
}

/**
 * Reset rate limit para un tool (para testing o admin)
 */
export function resetRateLimit(toolName: string): void {
  const key = `${STORAGE_PREFIX}${toolName}`;
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.warn('[WebMCP] Failed to reset rate limit:', error);
  }
}

/**
 * Obtiene estadísticas de uso de un tool
 */
export function getRateLimitStats(toolName: string): {
  calls: number;
  limit: number;
  remaining: number;
  resetIn: number;
} {
  const config = RATE_LIMITS[toolName];

  if (!config) {
    return { calls: 0, limit: Infinity, remaining: Infinity, resetIn: 0 };
  }

  const key = `${STORAGE_PREFIX}${toolName}`;
  const now = Date.now();

  try {
    const historyJson = localStorage.getItem(key);
    const history: number[] = historyJson ? JSON.parse(historyJson) : [];

    // Limpiar expirados
    const validHistory = history.filter((timestamp) => now - timestamp < config.windowMs);

    const resetIn = validHistory.length > 0
      ? Math.max(0, config.windowMs - (now - Math.min(...validHistory)))
      : 0;

    return {
      calls: validHistory.length,
      limit: config.maxCalls,
      remaining: Math.max(0, config.maxCalls - validHistory.length),
      resetIn,
    };
  } catch (error) {
    return { calls: 0, limit: config.maxCalls, remaining: config.maxCalls, resetIn: 0 };
  }
}

/**
 * Limpia rate limits expirados de todos los tools
 */
export function cleanupExpiredLimits(): void {
  const now = Date.now();

  try {
    Object.keys(RATE_LIMITS).forEach((toolName) => {
      const key = `${STORAGE_PREFIX}${toolName}`;
      const config = RATE_LIMITS[toolName];
      const historyJson = localStorage.getItem(key);

      if (!historyJson) return;

      const history: number[] = JSON.parse(historyJson);
      const validHistory = history.filter((timestamp) => now - timestamp < config.windowMs);

      if (validHistory.length === 0) {
        localStorage.removeItem(key);
      } else if (validHistory.length < history.length) {
        localStorage.setItem(key, JSON.stringify(validHistory));
      }
    });
  } catch (error) {
    console.warn('[WebMCP] Cleanup error:', error);
  }
}
