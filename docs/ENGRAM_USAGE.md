# Engram - Sistema de Memoria Persistente

Guía completa para usar Engram como sistema de memoria del proyecto ETF Nexo.

## 🧠 ¿Qué es Engram?

Engram es un sistema de memoria persistente para agentes de IA que permite recordar información entre sesiones de trabajo. Funciona como un "cerebro" que almacena conocimiento del proyecto, decisiones técnicas, soluciones a problemas, y contexto importante.

**Beneficios:**
- Memoria persistente entre sesiones de Claude Code
- Búsqueda rápida de información técnica
- Historial de decisiones y soluciones
- Contexto del proyecto siempre disponible
- Compatible con múltiples agentes (Claude Code, OpenCode, Cursor, etc.)

## 📊 Estado Actual

```bash
# Ver estadísticas
engram stats

# Resultado esperado:
# Projects: etfnexo, xprinta
# Observations: 15+ (7 de etfnexo, 8 de xprinta)
```

## 🔍 Buscar Información

### Búsqueda Básica

```bash
# Buscar por palabra clave
engram search "noticias"
engram search "supabase"
engram search "vercel"

# Buscar en proyecto específico
engram search "API" --project etfnexo

# Buscar por tipo
engram search "arquitectura" --type architecture
engram search "flujo" --type workflow
```

### Tipos de Memoria Disponibles

- `architecture`: Arquitectura y stack tecnológico
- `feature`: Características y funcionalidades
- `config`: Configuración y credenciales
- `workflow`: Flujos de trabajo y comandos
- `troubleshooting`: Problemas y soluciones
- `api`: APIs y endpoints
- `decision`: Decisiones técnicas importantes
- `discovery`: Descubrimientos y aprendizajes

### Búsqueda Avanzada

```bash
# Limitar resultados
engram search "deploy" --limit 5

# Ver contexto cronológico
engram timeline <obs_id>

# Ver contexto reciente
engram context etfnexo
```

## 💾 Guardar Información Nueva

### Sintaxis Básica

```bash
engram save "<título>" "<contenido>" --type <tipo> --project etfnexo
```

### Ejemplos Prácticos

```bash
# Guardar una decisión técnica
engram save "Uso de Vercel Edge Functions" "Decidimos NO usar Vercel Edge Functions para el scraper de noticias porque Supabase Edge Functions (Deno) ya está integrado y funciona bien. Edge Functions de Vercel tienen limitaciones de runtime." --type decision --project etfnexo

# Guardar un descubrimiento
engram save "Cache de Vercel en producción" "Los usuarios ven 404 después de deploy porque el browser carga JavaScript viejo con hash antiguo. Solución: Hard refresh (Ctrl+Shift+R) o modo incógnito." --type discovery --project etfnexo

# Guardar una nueva feature
engram save "Sistema de Rankings" "Implementado sistema de rankings de ETFs por performance, volumen y tamaño. API: /api/v1/rankings?metric=performance. Base de datos: tabla rankings con refresh diario via cron job." --type feature --project etfnexo

# Guardar solución a un problema
engram save "Error: Cannot find module en build" "Causa: imports dinámicos no soportados en build estático. Solución: Cambiar import('@/lib/foo') por import estático: import { foo } from '@/lib/foo'" --type troubleshooting --project etfnexo
```

## 📚 Información Ya Almacenada

El proyecto ETF Nexo tiene las siguientes memorias guardadas:

1. **Arquitectura del Proyecto** (#9)
   - Stack: Next.js 14, Supabase, Vercel, TypeScript
   - Repositorio y URLs de producción
   - Estructura de directorios

2. **Sistema de Noticias Automatizado** (#10)
   - Base de datos (5 tablas + 1 vista)
   - Edge Function de scraping
   - API endpoints
   - Flujo de publicación

3. **Configuración de Accesos** (#11)
   - Credenciales de Supabase
   - Configuración de Vercel
   - GitHub y SSH keys
   - Archivos sensibles a NO commitear

4. **Sistema Multi-Proyecto** (#12)
   - activate-project.sh
   - Wrappers CLI (supabase-etf, vercel-etf)
   - Git local config
   - Variables de entorno aisladas

5. **Flujos de Trabajo** (#13)
   - Workflow de desarrollo
   - Comandos frecuentes
   - Deployment
   - Gestión de noticias

6. **Problemas Comunes y Soluciones** (#14)
   - 7 problemas resueltos con soluciones
   - Errores de API, wrappers, Git, TypeScript
   - Referencias a documentación

7. **API Endpoints** (#15)
   - 6 APIs documentadas
   - Parámetros y responses
   - Cliente Supabase
   - Tipos TypeScript

## 🔄 Gestión de Memoria

### Ver Todas las Memorias del Proyecto

```bash
engram search "" --project etfnexo --limit 20
```

### Actualizar una Memoria

```bash
# Si la información cambió, NO actualizar la memoria vieja
# En su lugar, crear una nueva memoria con --type decision
# explicando el cambio

engram save "Migración de Vercel a Netlify" "Decidimos migrar de Vercel a Netlify por costos. Pasos: 1) Configurar Netlify, 2) Actualizar DNS, 3) Migrar env vars. SUPERSEDE memoria #11 sobre Vercel config." --type decision --project etfnexo
```

### Eliminar una Memoria (Soft Delete)

```bash
engram delete <obs_id>

# Eliminar permanentemente (hard delete)
engram delete <obs_id> --hard
```

## 🎯 Mejores Prácticas

### ✅ QUÉ Guardar

- Decisiones técnicas importantes (qué y por qué)
- Soluciones a problemas no triviales
- Configuración de servicios externos
- Flujos de trabajo complejos
- Descubrimientos y "gotchas" del proyecto
- Contexto histórico de features
- Dependencias y limitaciones conocidas

### ❌ QUÉ NO Guardar

- Código completo (usa Git para eso)
- Información que cambia frecuentemente
- Datos sensibles (aunque Engram es local)
- Cosas obvias o triviales
- Información duplicada que ya está en docs/

### 📝 Formato Recomendado

**Título**: Descriptivo y específico (30-60 caracteres)
- ✅ "Sistema de Noticias Automatizado"
- ✅ "Error: API 500 en /api/v1/noticias"
- ❌ "Base de datos"
- ❌ "Arreglé un bug"

**Contenido**: Estructurado y accionable
```
Problema: <descripción>
Causa: <por qué ocurrió>
Solución: <cómo se resolvió>
Comando/Código: <ejemplo concreto>
Referencias: <docs, commits, PRs>
```

## 🚀 Integración con Workflow

### Activación del Proyecto

El script `activate-project.sh` podría mostrar memorias recientes:

```bash
# Agregar al final de activate-project.sh
echo ""
echo "📚 Memorias recientes de Engram:"
engram context etfnexo 2>/dev/null | head -10 || echo "  (Ejecuta 'engram context etfnexo' para ver contexto)"
```

### Comandos Útiles en Aliases

Agregar a `activate-project.sh`:

```bash
alias mem-search-etf='engram search --project etfnexo'
alias mem-save-etf='engram save --project etfnexo'
alias mem-context-etf='engram context etfnexo'
```

## 🌐 Sincronización (Opcional)

### Git Sync (Local)

```bash
# Exportar nuevas memorias a .engram/
engram sync --project etfnexo

# En otra máquina, importar
engram sync --import
```

### Cloud Sync (Beta)

Si trabajas en múltiples máquinas:

```bash
# Configurar servidor cloud
engram cloud config --server http://tu-servidor:18080

# Enrollar proyecto
engram cloud enroll etfnexo

# Sincronizar
engram sync --cloud --project etfnexo
```

## 🖥️ Terminal UI

Interfaz interactiva para explorar memorias:

```bash
engram tui
```

**Navegación:**
- `j/k`: Mover arriba/abajo
- `/`: Buscar
- `Enter`: Ver detalle
- `q`: Salir

## 🔧 Troubleshooting

### Engram no encuentra memorias del proyecto

```bash
# Verificar que el proyecto existe
engram projects list

# Si no aparece 'etfnexo', las memorias se guardaron sin --project
# Buscar todas las memorias
engram search "" --limit 50
```

### Error: "Could not check for updates"

Ignorar - es solo un warning de red. No afecta funcionalidad.

### Quiero exportar todas las memorias

```bash
engram export etfnexo-memories.json
```

## 📖 Referencias

- Documentación oficial: https://github.com/Gentleman-Programming/engram
- Base de datos local: `~/.engram/engram.db`
- Comandos completos: `engram help`

---

**Última actualización:** 2026-06-05
