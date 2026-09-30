# WebMCP - Web Machine Learning Control Protocol

## Overview

WebMCP integration para ETF Nexo permite que agentes de IA (Chrome AI, Edge Copilot, extensiones) interactúen con la plataforma mediante "tools" invocables directamente en el navegador.

**Estado:** MVP implementado (Fase 1)  
**Tools disponibles:** 2 (search-etf, explain-etf-term)  
**Soporte:** Chrome/Edge Canary con flag experimental

---

## Estructura del Proyecto

```
lib/webmcp/
├── README.md                   # Este archivo
├── index.ts                    # Exports principales
├── types.ts                    # TypeScript types
├── registry.ts                 # Tool registration manager
├── tools/
│   ├── search-etf.ts          # Tool: Búsqueda de ETFs
│   └── explain-term.ts        # Tool: Explicar términos
├── utils/
│   └── nlp-parser.ts          # Natural language → SQL filters
└── hooks/
    └── useWebMCP.ts           # React hook para UI

components/webmcp/
├── WebMCPProvider.tsx         # Context provider
├── SearchResultsPanel.tsx     # UI: Resultados de búsqueda
└── TermExplanationTooltip.tsx # UI: Explicaciones de términos

docs/
└── WEBMCP-QUICKSTART.md       # Guía de inicio rápido

scripts/
└── test-webmcp.html           # Test suite standalone
```

---

## Quick Start

### 1. Instalación

Ya está integrado en el proyecto. No requiere instalación adicional.

### 2. Habilitar WebMCP en Chrome Canary

1. Descargar Chrome Canary: https://www.google.com/chrome/canary/
2. Ir a: `chrome://flags/#optimization-guide-on-device-model`
3. Cambiar a: **Enabled**
4. Reiniciar Chrome Canary

### 3. Verificar que funciona

```javascript
// En DevTools Console de etfnexo.com
'modelContext' in document  // Debe retornar: true
window.__ETF_NEXO_WEBMCP_ENABLED__  // Debe retornar: true
```

### 4. Test Manual

Abrir: `/scripts/test-webmcp.html` en Chrome Canary

---

## Uso desde Código

### Hook `useWebMCP`

```tsx
'use client';

import { useWebMCP } from '@/lib/webmcp';

export function MyComponent() {
  const { status, searchResults, explainedTerm } = useWebMCP();
  
  if (!status.isSupported) {
    return <p>WebMCP no soportado</p>;
  }
  
  if (searchResults) {
    return (
      <div>
        <h2>{searchResults.count} ETFs encontrados</h2>
        {searchResults.etfs.map(etf => (
          <div key={etf.ticker}>
            {etf.name} - {etf.etfnexo_score}/10
          </div>
        ))}
      </div>
    );
  }
  
  return null;
}
```

### Escuchar Eventos

```tsx
useEffect(() => {
  const handleSearchResults = (e: CustomEvent) => {
    console.log('Search results:', e.detail);
  };
  
  window.addEventListener('webmcp:search-results', handleSearchResults as EventListener);
  
  return () => {
    window.removeEventListener('webmcp:search-results', handleSearchResults as EventListener);
  };
}, []);
```

---

## Tools Disponibles

### 1. `search-etf`

**Descripción:** Busca ETFs usando lenguaje natural

**Input:**
```typescript
{
  query: string;        // "ETFs de tecnología europea con TER bajo"
  maxResults?: number;  // Default: 20, Max: 100
}
```

**Output:**
```typescript
{
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
```

**Ejemplo:**

```
Query: "mejores ETFs de salud"

Filtros aplicados:
- sector: Healthcare
- minScore: 8.0

Resultado: 12 ETFs encontrados
```

---

### 2. `explain-etf-term`

**Descripción:** Explica términos financieros con ejemplos

**Input:**
```typescript
{
  term: string;      // "TER", "tracking error", "ESG"
  context?: string;  // Slug del artículo actual (opcional)
}
```

**Output:**
```typescript
{
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
```

**Términos soportados:**
- TER
- Tracking Error
- AUM
- Réplica Física
- Réplica Sintética
- ESG
- Dividend Yield
- ETFNexo Score

---

## NLP Parser

El parser convierte queries en lenguaje natural a filtros SQL:

```typescript
import { parseNaturalQuery } from '@/lib/webmcp/utils/nlp-parser';

const filters = parseNaturalQuery("ETFs de tecnología europea con TER < 0.3%");

// Resultado:
{
  region: 'Europe',
  sector: 'Technology',
  maxTER: 0.003
}
```

**Patrones soportados:**

| Categoría | Ejemplos |
|-----------|----------|
| **Región** | "europa", "USA", "emergentes", "asia", "global" |
| **Sector** | "tecnología", "salud", "ESG", "financiero", "energía" |
| **TER** | "TER < 0.3%", "gastos bajos", "barato" |
| **AUM** | "AUM > 500M", "grande", "líquido" |
| **Score** | "score > 8", "mejores", "alta calidad" |
| **Réplica** | "física", "sintética" |

---

## Eventos WebMCP

| Evento | Cuándo se emite | Payload |
|--------|----------------|---------|
| `webmcp:initialized` | Registry inicializado | `{ toolCount, tools }` |
| `webmcp:tool-invoked` | Tool invocado por AI | `{ toolName, args, timestamp }` |
| `webmcp:tool-completed` | Tool completado | `{ toolName, result, duration }` |
| `webmcp:tool-error` | Tool falló | `{ toolName, error }` |
| `webmcp:search-results` | Búsqueda completada | `{ etfs, query, filters }` |
| `webmcp:term-explained` | Término explicado | `{ term, definition, relatedArticles }` |

---

## Testing

### Test Automático

```bash
# Abrir test suite en navegador
open scripts/test-webmcp.html  # macOS
start scripts/test-webmcp.html # Windows
```

### Test Manual

```javascript
// En DevTools Console

// 1. Verificar API
'modelContext' in document

// 2. Simular búsqueda
window.dispatchEvent(new CustomEvent('webmcp:search-results', {
  detail: {
    etfs: [
      { ticker: 'IWDA.AS', name: 'iShares Core MSCI World', ter: 0.002, aum: 75000000000, etfnexo_score: 8.9 }
    ],
    query: 'test',
    filters: {}
  }
}));

// 3. Simular explicación
window.dispatchEvent(new CustomEvent('webmcp:term-explained', {
  detail: {
    term: 'TER',
    definition: 'Total Expense Ratio...',
    relatedArticles: []
  }
}));
```

---

## Development

### Agregar un nuevo Tool

1. **Crear tool file:**
   ```typescript
   // lib/webmcp/tools/my-tool.ts
   import type { Tool } from '../types';

   export const myTool: Tool = {
     name: 'my-tool',
     description: 'Description for AI agent',
     requiresAuth: false,
     inputSchema: {
       type: 'object',
       properties: {
         param: { type: 'string', description: 'Param description' }
       },
       required: ['param']
     },
     async execute({ param }) {
       // Tool logic
       return { result: 'success' };
     }
   };
   ```

2. **Registrar en registry:**
   ```typescript
   // lib/webmcp/registry.ts
   import { myTool } from './tools/my-tool';

   async initialize() {
     // ...
     await this.registerTool(myTool);
   }
   ```

3. **Agregar tipos:**
   ```typescript
   // lib/webmcp/types.ts
   export interface MyToolArgs {
     param: string;
   }

   export interface MyToolResult {
     result: string;
   }
   ```

---

## Roadmap

### ✅ Fase 1: MVP (Completado)
- ✅ Registry base
- ✅ Tool: search-etf
- ✅ Tool: explain-etf-term
- ✅ NLP parser básico
- ✅ React hooks
- ✅ UI components

### 🚧 Fase 2: Production (4 semanas)
- [ ] Tool: analyze-portfolio
- [ ] Tool: compare-etfs
- [ ] NLP mejorado (Transformers.js)
- [ ] Custom extension fallback
- [ ] E2E tests

### 📋 Fase 3: AI Enhancement (6 semanas)
- [ ] Fine-tuning de NLP
- [ ] Personalización
- [ ] Multi-idioma
- [ ] Voice input

---

## Troubleshooting

### API no disponible

**Error:** `'modelContext' is not defined`

**Solución:**
1. Usar Chrome Canary
2. Habilitar flag: `chrome://flags/#optimization-guide-on-device-model`
3. Reiniciar navegador

---

### Tools no se registran

**Error:** `Failed to register tool`

**Solución:**
1. Verificar logs en DevTools Console
2. Buscar `[WebMCP]` prefix
3. Verificar estructura de inputSchema

---

### Panel de resultados no aparece

**Causa:** Evento no emitido

**Solución:**
1. Verificar que `SearchResultsPanel` está montado
2. Emitir evento manualmente para test
3. Verificar Event Log en test suite

---

## Referencias

- **Spec:** https://webmachinelearning.github.io/webmcp/
- **Proposal:** `/tmp/claude-1000/.../webmcp-integration-proposal.md`
- **Quick Start:** `docs/WEBMCP-QUICKSTART.md`

---

**🤖 WebMCP MVP - Ready for Testing**
