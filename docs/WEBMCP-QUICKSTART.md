# WebMCP - Quick Start Guide

## ¿Qué es WebMCP?

WebMCP (Web Machine Learning Control Protocol) permite a ETF Nexo exponer funcionalidades como "tools" que agentes de IA (Chrome AI, Edge Copilot, extensiones) pueden invocar directamente en el navegador.

**Estado:** MVP implementado con 2 tools básicos

---

## Soporte de Navegadores

| Navegador | Estado | Cómo habilitar |
|-----------|--------|----------------|
| **Chrome Canary** | ✅ Experimental | Ver instrucciones abajo |
| **Edge Canary** | ✅ Experimental | Ver instrucciones abajo |
| Chrome Stable | ❌ No disponible | Esperar lanzamiento oficial |
| Safari | ❌ No disponible | Sin planes anunciados |
| Firefox | ❌ No disponible | Sin planes anunciados |

---

## Habilitar WebMCP en Chrome Canary

1. **Descargar Chrome Canary:**
   ```
   https://www.google.com/chrome/canary/
   ```

2. **Habilitar flag de WebMCP:**
   ```
   chrome://flags/#optimization-guide-on-device-model
   ```
   
   Cambiar a: **Enabled**

3. **Reiniciar Chrome Canary**

4. **Verificar que funciona:**
   ```javascript
   // Abrir DevTools Console en etfnexo.com
   'modelContext' in document  // Debe retornar: true
   ```

5. **Ver tools registrados:**
   ```javascript
   // En DevTools Console
   window.__ETF_NEXO_WEBMCP_ENABLED__  // Debe retornar: true
   ```

---

## Tools Disponibles (MVP)

### 1. `search-etf` - Búsqueda de ETFs por lenguaje natural

**Descripción:** Busca ETFs usando criterios en lenguaje natural

**Ejemplos de uso:**

```
User: "Muéstrame ETFs de tecnología europea con TER menor a 0.3%"

AI Agent → Invoca: search-etf({
  query: "tecnología europea TER<0.3%",
  maxResults: 20
})

Resultado:
- UI actualizada con 15 ETFs encontrados
- Panel flotante muestra resultados
- Filtros aplicados: región=Europe, sector=Technology, maxTER=0.003
```

**Parámetros soportados:**

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `query` | string | Query en lenguaje natural | ✅ Sí |
| `maxResults` | number | Número máximo de resultados (default: 20, max: 100) | ❌ No |

**Filtros que entiende:**

- **Región:** Europa, USA, Emergentes, Asia, Global
- **Sector:** Technology, Healthcare, ESG, Financials, Energy, Consumer, Real Estate
- **TER:** "TER < 0.3%", "gastos bajos", "barato"
- **AUM:** "AUM > 500M", "grande", "líquido"
- **Score:** "score > 8", "mejores", "alta calidad"
- **Réplica:** "física", "sintética"

---

### 2. `explain-etf-term` - Explicar términos financieros

**Descripción:** Explica términos de ETFs con ejemplos y contenido relacionado

**Ejemplos de uso:**

```
User: "¿Qué es el tracking error?"

AI Agent → Invoca: explain-etf-term({
  term: "tracking error",
  context: "fiscalidad-etf-espana"
})

Resultado:
- Tooltip flotante con definición
- Ejemplo práctico
- Links a artículos relacionados
- Término highlighted en página
```

**Parámetros:**

| Parámetro | Tipo | Descripción | Requerido |
|-----------|------|-------------|-----------|
| `term` | string | Término a explicar | ✅ Sí |
| `context` | string | Contexto opcional (slug artículo) | ❌ No |

**Términos soportados:**

- TER (Total Expense Ratio)
- Tracking Error
- AUM (Assets Under Management)
- Réplica Física
- Réplica Sintética
- ESG
- Dividend Yield
- ETFNexo Score

---

## Integración en Código

### Usar el hook `useWebMCP`

```tsx
'use client';

import { useWebMCP } from '@/lib/webmcp';

export function MyComponent() {
  const { status, searchResults, explainedTerm } = useWebMCP();
  
  // Verificar soporte
  if (!status.isSupported) {
    return <div>WebMCP no soportado en este navegador</div>;
  }
  
  // Mostrar resultados de búsqueda
  if (searchResults) {
    return (
      <div>
        <h2>{searchResults.count} ETFs encontrados</h2>
        <ul>
          {searchResults.etfs.map(etf => (
            <li key={etf.ticker}>
              {etf.name} - Score: {etf.etfnexo_score}/10
            </li>
          ))}
        </ul>
      </div>
    );
  }
  
  return <div>Esperando resultados de AI agent...</div>;
}
```

### Escuchar eventos WebMCP

```tsx
useEffect(() => {
  // Escuchar cuando tool es invocado
  const handleToolInvoked = (e: CustomEvent) => {
    console.log('Tool invoked:', e.detail.toolName);
  };
  
  window.addEventListener('webmcp:tool-invoked', handleToolInvoked);
  
  return () => {
    window.removeEventListener('webmcp:tool-invoked', handleToolInvoked);
  };
}, []);
```

---

## Testing Manual

### Test 1: Search ETF

1. Abrir Chrome Canary con flag habilitado
2. Ir a: `http://localhost:3000` (dev) o `https://etfnexo.com` (prod)
3. Abrir DevTools Console
4. Verificar:
   ```javascript
   window.__ETF_NEXO_WEBMCP_ENABLED__  // true
   ```

5. **Simular invocación desde AI agent** (mientras no haya AI agent real):
   ```javascript
   // En DevTools Console
   const searchTool = document.modelContext;
   
   // Invocar tool manualmente
   searchTool.registerTool({
     name: 'test-search',
     description: 'Test',
     inputSchema: { type: 'object', properties: {} },
     execute: async () => {
       // Trigger evento de búsqueda
       window.dispatchEvent(new CustomEvent('webmcp:search-results', {
         detail: {
           etfs: [
             { ticker: 'IWDA.AS', name: 'iShares Core MSCI World', ter: 0.002, aum: 75000000000, etfnexo_score: 8.9 }
           ],
           query: 'ETFs globales baratos',
           filters: { region: 'Global', maxTER: 0.003 }
         }
       }));
     }
   });
   ```

6. **Ver panel de resultados** aparecer en bottom-left

---

### Test 2: Explain Term

```javascript
// En DevTools Console
window.dispatchEvent(new CustomEvent('webmcp:term-explained', {
  detail: {
    term: 'TER',
    definition: 'Total Expense Ratio es el porcentaje de gastos anuales...',
    relatedArticles: []
  }
}));
```

Ver tooltip aparecer en bottom-right

---

## Debugging

### Ver logs de WebMCP

Todos los logs tienen prefijo `[WebMCP]`:

```javascript
// Filtrar logs en DevTools Console
console.log = new Proxy(console.log, {
  apply(target, thisArg, args) {
    if (args[0]?.includes('[WebMCP]')) {
      target.apply(thisArg, args);
    }
  }
});
```

### Badge de status (solo development)

En modo desarrollo, aparece un badge en bottom-right:

- 🟡 **WebMCP Initializing...** - Inicializando
- 🟢 **WebMCP Ready** - Listo y funcionando
- ⚪ **WebMCP Not Supported** - No soportado

Hacer click en ✕ para cerrar el badge.

---

## Roadmap Futuro

### Fase 2: Production (4 semanas)

- ✅ Tool: `analyze-portfolio` (análisis de cartera)
- ✅ Tool: `compare-etfs` (comparador)
- ✅ NLP mejorado con modelo local (Transformers.js)
- ✅ Soporte multi-navegador (extension fallback)

### Fase 3: AI Enhancement (6 semanas)

- ✅ Fine-tuning de NLP en queries ETF
- ✅ Personalización basada en historial
- ✅ Multi-idioma (ES/EN/FR)
- ✅ Voice input (Web Speech API)

---

## Troubleshooting

### "modelContext is not defined"

**Causa:** Flag no habilitado o navegador no soportado

**Solución:**
1. Verificar que usas Chrome Canary
2. Habilitar flag: `chrome://flags/#optimization-guide-on-device-model`
3. Reiniciar navegador

---

### Badge muestra "Not Supported"

**Causa:** API no disponible en este navegador

**Solución:**
- Usar Chrome Canary con flag habilitado
- En producción, la app funciona normal sin WebMCP (graceful degradation)

---

### Panel de resultados no aparece

**Causa:** Evento `webmcp:search-results` no se emitió

**Solución:**
1. Abrir DevTools Console
2. Verificar logs `[WebMCP]`
3. Emitir evento manualmente para test:
   ```javascript
   window.dispatchEvent(new CustomEvent('webmcp:search-results', {
     detail: { etfs: [], query: 'test', filters: {} }
   }));
   ```

---

## Soporte

**Documentación completa:**
- `/tmp/claude-1000/.../webmcp-integration-proposal.md` - Propuesta técnica completa

**Issues conocidos:**
- WebMCP solo funciona en Chrome/Edge Canary (experimental)
- NLP parser es básico (regex-based, mejorar en Fase 3)
- Sin AI agent real aún (simular con eventos manuales)

---

**🎯 WebMCP MVP implementado - Fase inicial completada**
