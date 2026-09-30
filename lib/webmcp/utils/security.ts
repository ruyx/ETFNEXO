/**
 * Security Utilities para WebMCP
 *
 * Validación y sanitización de inputs para prevenir:
 * - Injection attacks
 * - XSS
 * - Excessive resource consumption
 */

/**
 * Sanitiza string removiendo caracteres potencialmente peligrosos
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  // Truncar a longitud máxima
  let sanitized = input.substring(0, maxLength);

  // Remover caracteres de control (excepto espacios, tabs, newlines)
  sanitized = sanitized.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Trim espacios
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Valida que un ticker sea formato válido
 */
export function validateTicker(ticker: string): boolean {
  // Tickers típicos: IWDA.AS, CSPX.L, VWCE.DE, SPY
  // Formato: 1-10 caracteres alfanuméricos, opcionalmente + "." + 1-3 caracteres
  const tickerPattern = /^[A-Z0-9]{1,10}(?:\.[A-Z]{1,3})?$/i;

  return tickerPattern.test(ticker);
}

/**
 * Valida array de tickers
 */
export function validateTickers(tickers: string[], maxCount: number = 20): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!Array.isArray(tickers)) {
    errors.push('tickers debe ser un array');
    return { valid: false, errors };
  }

  if (tickers.length === 0) {
    errors.push('tickers no puede estar vacío');
  }

  if (tickers.length > maxCount) {
    errors.push(`Máximo ${maxCount} tickers permitidos (recibido: ${tickers.length})`);
  }

  // Validar cada ticker
  tickers.forEach((ticker, index) => {
    if (typeof ticker !== 'string') {
      errors.push(`ticker[${index}] debe ser string`);
    } else if (!validateTicker(ticker)) {
      errors.push(`ticker[${index}] "${ticker}" tiene formato inválido`);
    }
  });

  // Detectar duplicados
  const unique = new Set(tickers.map((t) => t.toUpperCase()));
  if (unique.size < tickers.length) {
    errors.push('tickers contiene duplicados');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valida array de weights para portfolio
 */
export function validateWeights(weights: number[], tickersCount: number): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!Array.isArray(weights)) {
    errors.push('weights debe ser un array');
    return { valid: false, errors };
  }

  if (weights.length !== tickersCount) {
    errors.push(`weights debe tener mismo largo que tickers (${tickersCount})`);
  }

  // Validar cada weight
  weights.forEach((weight, index) => {
    if (typeof weight !== 'number') {
      errors.push(`weight[${index}] debe ser número`);
    } else if (weight < 0 || weight > 1) {
      errors.push(`weight[${index}] debe estar entre 0 y 1 (recibido: ${weight})`);
    } else if (isNaN(weight) || !isFinite(weight)) {
      errors.push(`weight[${index}] es NaN o Infinity`);
    }
  });

  // Validar que suman ~1.0 (tolerancia ±5%)
  const sum = weights.reduce((acc, w) => acc + w, 0);
  if (Math.abs(sum - 1.0) > 0.05) {
    errors.push(`weights deben sumar ~1.0 (actual: ${sum.toFixed(3)})`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valida query string para búsqueda
 */
export function validateSearchQuery(query: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (typeof query !== 'string') {
    errors.push('query debe ser string');
    return { valid: false, errors };
  }

  // Sanitizar y validar longitud
  const sanitized = sanitizeString(query, 500);

  if (sanitized.length === 0) {
    errors.push('query no puede estar vacío');
  }

  if (sanitized.length < 3) {
    errors.push('query debe tener al menos 3 caracteres');
  }

  // Detectar patrones sospechosos (SQL injection, XSS)
  const suspiciousPatterns = [
    /(\bor\b|\band\b).*[=<>]/i,  // SQL injection básico
    /<script/i,                   // XSS básico
    /javascript:/i,               // XSS protocol
    /on\w+\s*=/i,                // Event handlers
    /\bexec\b|\beval\b/i,        // Code execution
  ];

  suspiciousPatterns.forEach((pattern) => {
    if (pattern.test(sanitized)) {
      errors.push('query contiene patrón sospechoso');
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Valida término para explain tool
 */
export function validateTerm(term: string): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (typeof term !== 'string') {
    errors.push('term debe ser string');
    return { valid: false, errors };
  }

  const sanitized = sanitizeString(term, 100);

  if (sanitized.length === 0) {
    errors.push('term no puede estar vacío');
  }

  // Términos deben ser palabras simples o frases cortas
  if (sanitized.length > 50) {
    errors.push('term demasiado largo (máximo 50 caracteres)');
  }

  // No debe contener caracteres especiales sospechosos
  if (/[<>{}[\]\\]/.test(sanitized)) {
    errors.push('term contiene caracteres inválidos');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Rate limit error helper
 */
export function createRateLimitError(resetAt: number): Error {
  const resetInSeconds = Math.ceil((resetAt - Date.now()) / 1000);
  return new Error(
    `Rate limit excedido. Intenta nuevamente en ${resetInSeconds} segundos.`
  );
}

/**
 * Validation error helper
 */
export function createValidationError(errors: string[]): Error {
  return new Error(`Validación fallida: ${errors.join(', ')}`);
}
