/**
 * WebMCP Registry
 *
 * Gestiona el registro de tools WebMCP y su ciclo de vida
 * Inicializa automáticamente al cargar la aplicación
 */

import type { Tool } from './types';
import { searchETFTool } from './tools/search-etf';
import { explainTermTool } from './tools/explain-term';
import { analyzePortfolioTool } from './tools/analyze-portfolio';
import { compareETFsTool } from './tools/compare-etfs';
import { checkRateLimit, cleanupExpiredLimits } from './utils/rate-limiter';
import { createRateLimitError } from './utils/security';

export class WebMCPRegistry {
  private tools = new Map<string, Tool>();
  private initialized = false;
  private isSupported = false;

  /**
   * Inicializa el registry y registra todos los tools
   * Retorna true si WebMCP está soportado, false en caso contrario
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) {
      console.log('[WebMCP] Registry already initialized');
      return this.isSupported;
    }

    console.log('[WebMCP] Initializing registry...');

    // 1. Limpiar rate limits expirados
    cleanupExpiredLimits();

    // 2. Verificar soporte de WebMCP
    this.isSupported = this.checkSupport();

    if (!this.isSupported) {
      console.warn('[WebMCP] Not supported in this browser');
      console.log('[WebMCP] To enable: Chrome Canary → chrome://flags → #optimization-guide-on-device-model → Enabled');
      this.initialized = true;
      return false;
    }

    console.log('[WebMCP] WebMCP API detected ✓');

    try {
      // 2. Registrar tools
      await this.registerTool(searchETFTool);
      console.log('[WebMCP] ✓ search-etf registered');

      await this.registerTool(explainTermTool);
      console.log('[WebMCP] ✓ explain-etf-term registered');

      await this.registerTool(analyzePortfolioTool);
      console.log('[WebMCP] ✓ analyze-portfolio registered');

      await this.registerTool(compareETFsTool);
      console.log('[WebMCP] ✓ compare-etfs registered');

      this.initialized = true;
      console.log(`[WebMCP] Registry initialized successfully (${this.tools.size} tools)`);

      // 3. Emitir evento global
      window.__ETF_NEXO_WEBMCP_ENABLED__ = true;
      window.dispatchEvent(new CustomEvent('webmcp:initialized', {
        detail: {
          toolCount: this.tools.size,
          tools: Array.from(this.tools.keys()),
        },
      }));

      return true;
    } catch (error) {
      console.error('[WebMCP] Initialization error:', error);
      this.initialized = true;
      return false;
    }
  }

  /**
   * Registra un tool en el registry y con la API nativa de WebMCP
   */
  async registerTool(tool: Tool): Promise<void> {
    if (!this.isSupported || !document.modelContext) {
      console.warn(`[WebMCP] Cannot register tool "${tool.name}": API not available`);
      return;
    }

    try {
      // Registrar con API nativa de WebMCP
      await document.modelContext.registerTool({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        execute: async (args: any) => {
          console.log(`[WebMCP] Tool "${tool.name}" invoked by AI agent`);

          // 1. Verificar rate limit
          const rateLimit = checkRateLimit(tool.name);
          if (!rateLimit.allowed) {
            throw createRateLimitError(rateLimit.resetAt);
          }

          // 2. Validación de permisos
          if (tool.requiresAuth && !this.isAuthenticated()) {
            throw new Error(`Tool "${tool.name}" requires authentication`);
          }

          // 3. Track invocación (analytics)
          this.trackToolInvocation(tool.name, args);

          // 4. Ejecutar tool
          const result = await tool.execute(args);

          return result;
        },
      });

      // Guardar en registry local
      this.tools.set(tool.name, tool);
    } catch (error) {
      console.error(`[WebMCP] Failed to register tool "${tool.name}":`, error);
      throw error;
    }
  }

  /**
   * Verifica si WebMCP está soportado en el navegador
   */
  private checkSupport(): boolean {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return false;
    }

    return 'modelContext' in document;
  }

  /**
   * Verifica si el usuario está autenticado
   * (para tools que requieren auth)
   */
  private isAuthenticated(): boolean {
    // TODO: Implementar check de autenticación real
    // Por ahora, verificar si hay cookie de sesión de Supabase
    if (typeof document === 'undefined') return false;

    const cookies = document.cookie.split('; ');
    return cookies.some(cookie => cookie.startsWith('sb-'));
  }

  /**
   * Track invocación de tool para analytics
   */
  private trackToolInvocation(toolName: string, args: any): void {
    try {
      // Google Analytics 4
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as any).gtag('event', 'webmcp_tool_invocation', {
          tool_name: toolName,
          has_args: Object.keys(args).length > 0,
          timestamp: new Date().toISOString(),
        });
      }

      // Console log para debugging
      console.log('[WebMCP Analytics]', {
        tool: toolName,
        args,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('[WebMCP] Analytics tracking error:', error);
    }
  }

  /**
   * Obtiene un tool registrado por nombre
   */
  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  /**
   * Obtiene todos los tools registrados
   */
  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  /**
   * Verifica si el registry está inicializado
   */
  isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Verifica si WebMCP está soportado
   */
  isWebMCPSupported(): boolean {
    return this.isSupported;
  }
}

// Singleton instance
let registryInstance: WebMCPRegistry | null = null;

/**
 * Obtiene la instancia singleton del registry
 */
export function getWebMCPRegistry(): WebMCPRegistry {
  if (!registryInstance) {
    registryInstance = new WebMCPRegistry();
  }
  return registryInstance;
}

/**
 * Inicializa WebMCP (llamar al montar la app)
 */
export async function initializeWebMCP(): Promise<boolean> {
  const registry = getWebMCPRegistry();
  return await registry.initialize();
}
