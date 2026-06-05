# ETF Nexo - Comunidad y Rankings de ETF

Plataforma profesional de análisis y rankings de ETFs. Conocimiento democratizado, comunidad de inversores y herramientas de inversión inteligente.

**🚀 [Quick Start Guide](./QUICK_START.md)** | **📖 [Setup Guide](./SETUP.md)** | **🎨 [Design System](./design-system/MASTER.md)**

## 🎨 Sistema de Diseño

El proyecto sigue el **Manual de Imagen ETF Nexo V1.0** con:

- **Colores principales**: Azul (#235D87), Teal (#5DABB8), Naranja (#F95602)
- **Tipografía**: Archivo (Google Fonts)
- **Voz de marca**: Auténtica, Clara, Empática, Profesional
- **Valores**: Conocimiento Democratizado, Comunidad, Accesibilidad, Crecimiento

Ver documentación completa en: [`design-system/MASTER.md`](./design-system/MASTER.md)

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 + React 18 + TypeScript
- **Styling**: Tailwind CSS + Custom Design System
- **Database**: Supabase PostgreSQL
- **Data Source**: Yahoo Finance API (yfinance) + Scraping ligero
- **Hosting**: Vercel (frontend) + Hostinger VPS Mini (scrapers)
- **Icons**: Lucide React
- **Charts**: Recharts

## 📋 Prerequisitos

- Node.js >= 18.17.0
- pnpm >= 8.0.0
- Supabase CLI
- Python 3.11+ (para scrapers)

## 🚀 Inicio Rápido

### 1. Instalar Dependencias

```bash
pnpm install
```

### 2. Configurar Variables de Entorno

El archivo `.env.local` ya está configurado con las credenciales de Supabase.

### 3. Configurar Supabase

```bash
# Login a Supabase
supabase login

# Link al proyecto
supabase link --project-ref utvioubcqkwwzvufhups

# Aplicar migraciones
supabase db push --linked
```

### 4. Iniciar Desarrollo

```bash
pnpm dev
```

Abre [http://localhost:5000](http://localhost:5000) en tu navegador.

## 📁 Estructura del Proyecto

```
etf-nexo/
├── app/                      # Next.js 14 App Router
│   ├── api/                  # API Routes
│   │   └── v1/
│   │       ├── etfs/        # Endpoints de ETFs
│   │       ├── rankings/    # Endpoints de rankings
│   │       └── newsletter/  # Endpoints de newsletter
│   ├── etfs/                # Páginas de ETFs
│   │   └── [isin]/         # Página individual de ETF
│   ├── globals.css         # Estilos globales + Tailwind
│   ├── layout.tsx          # Layout principal
│   └── page.tsx            # Landing page
├── components/              # Componentes React
│   ├── etf/                # Componentes específicos de ETFs
│   ├── layout/             # Layout components (Header, Footer)
│   └── ui/                 # Componentes UI reutilizables
├── lib/                     # Utilidades y configuración
│   ├── supabase/           # Clientes de Supabase
│   └── utils/              # Funciones auxiliares
├── public/                  # Archivos estáticos
│   ├── logo/               # Logos y marca
│   └── patterns/           # Patrones decorativos
├── supabase/               # Configuración Supabase
│   └── migrations/         # Migraciones SQL
├── types/                   # TypeScript types
│   └── database.types.ts   # Tipos de base de datos
├── design-system/          # Sistema de diseño completo
│   └── MASTER.md           # Documentación de diseño
└── .claude/                # Skills y configuración Claude Code
    └── skills/
        ├── STACK.md                              # Credenciales y stack
        ├── GUIA_MAESTRA_HERRAMIENTAS_AVANZADAS.md # Guía de herramientas
        ├── ETFNEXO_SKILLS_RECOMENDADOS.md         # Skills para ETF Nexo
        ├── LIGHTRAG_INTEGRATION.md                # LightRAG (Fase 2)
        └── supabase-cli-database.md               # Comandos Supabase CLI
```

## 🗄️ Base de Datos

### Tablas Principales

- **`fund_managers`**: Gestoras de ETFs (iShares, Vanguard, etc.)
- **`etfs`**: Catálogo principal de ETFs con datos dinámicos
- **`etf_price_history`**: Histórico de precios para gráficos
- **`weekly_rankings`**: Rankings semanales calculados
- **`newsletter_subscribers`**: Suscriptores del newsletter
- **`affiliate_clicks`**: Tracking de clicks en brokers

### Comandos Útiles Supabase CLI

```bash
# Ver estado de migraciones
supabase migration list --linked

# Ejecutar query
echo "SELECT COUNT(*) FROM etfs;" | supabase db query --linked

# Ver schema de tabla
echo "\d+ etfs" | supabase db query --linked

# Crear nueva migración
supabase migration new nombre_migracion
```

## 🎨 Sistema de Diseño en Código

### Colores

```tsx
// Tailwind classes disponibles
className="bg-primary-blue"       // Azul corporativo #235D87
className="bg-primary-teal"       // Teal innovación #5DABB8
className="bg-primary-orange"     // Naranja energía #F95602
className="bg-neutral-50"         // Fondo cream #FAF9F6

// Gradientes
className="bg-gradient-primary"   // Blue → Teal
className="bg-gradient-secondary" // Teal → Orange
```

### Tipografía

```tsx
// Heading classes
className="heading-1"  // 3.5rem bold
className="heading-2"  // 2.5rem bold
className="heading-3"  // 2rem bold

// Body text
className="body-large"  // 1.125rem normal
className="body-base"   // 1rem normal
className="body-small"  // 0.875rem normal

// Números financieros
className="financial-number"  // Bold, tabular nums
```

### Componentes

```tsx
// Botones
className="btn-primary"    // CTA principal (naranja)
className="btn-secondary"  // Secundario (azul outline)
className="btn-ghost"      // Ghost (transparente)

// Cards
className="card"           // Card base con hover
className="glass-card"     // Card con glassmorphism

// Inputs
className="input"          // Input con focus states

// Badges
className="badge badge-success"  // Badge verde
className="badge badge-warning"  // Badge naranja
className="badge badge-info"     // Badge azul
```

## 📊 Integración Yahoo Finance

Ver documentación completa en: [`ESTRATEGIA_DATOS_YAHOO_FINANCE.md`](./ESTRATEGIA_DATOS_YAHOO_FINANCE.md)

### Datos Cubiertos por Yahoo Finance (80%)

- ✅ Precios NAV diarios
- ✅ Histórico completo (10+ años)
- ✅ Rendimientos calculados (1S, 1M, YTD, 1A, 3A, 5A)
- ✅ Volatilidad (desviación estándar)
- ✅ Volumen (para score de liquidez)

### Datos a Scrapear (20%)

- ⚠️ TER (Total Expense Ratio) - 1 vez/mes
- ⚠️ AUM actualizado - 1 vez/mes
- ⚠️ Holdings (Fase 2)

## 🧪 Scripts de Desarrollo

```bash
# Desarrollo
pnpm dev          # Iniciar servidor de desarrollo

# Build
pnpm build        # Build para producción
pnpm start        # Iniciar servidor de producción

# Calidad de código
pnpm lint         # Linter ESLint
pnpm type-check   # TypeScript type checking
```

## 📦 Próximos Pasos

### MVP (Semanas 1-8)

- [x] Sistema de diseño completo
- [x] Estructura base Next.js 14
- [x] Migraciones iniciales Supabase
- [ ] Componentes ETFCard, ScoreRing, PriceChart
- [ ] Scrapers Yahoo Finance
- [ ] Página ranking principal
- [ ] Página individual de ETF
- [ ] Newsletter con Buttondown
- [ ] Deploy Vercel + VPS

### Fase 2 (Post-MVP)

- [ ] Comparador de ETFs
- [ ] Academia ETF (blog)
- [ ] Comunidad (Discord)
- [ ] LightRAG para chatbot inteligente
- [ ] Mi Cartera (portfolio tracking)

## 🤝 Valores de Marca

### Pilares

1. **💡 Conocimiento Democratizado**: Información clara y accesible para todos
2. **👥 Comunidad**: Conectar inversores para aprender juntos
3. **♿ Accesibilidad Para Todos**: Plataforma intuitiva y fácil de usar
4. **📈 Crecimiento**: Herramientas para inversión inteligente

### Voz de Marca

- **Tono**: Auténtica, Clara, Empática, Profesional
- **Estilo**: Directo, educativo, cercano, transparente
- **Evitar**: Jerga innecesaria, promesas garantizadas, frialdad corporativa

## 📚 Documentación Adicional

- [Sistema de Diseño Completo](./design-system/MASTER.md)
- [Plan MVP Económico](./PLAN_MVP_ECONOMICO.md)
- [Arquitectura de Código](./ARQUITECTURA_CODIGO.md)
- [Estrategia Yahoo Finance](./ESTRATEGIA_DATOS_YAHOO_FINANCE.md)
- [Stack Tecnológico](./.claude/skills/STACK.md)
- [Skills Recomendados](./.claude/skills/ETFNEXO_SKILLS_RECOMENDADOS.md)

## 🔧 Herramientas Avanzadas

Este proyecto usa herramientas avanzadas de desarrollo con IA:

- **UI/UX Pro Max**: Generador de sistemas de diseño con IA
- **Claude-Mem**: Memoria persistente entre sesiones
- **ECC Skills**: 62+ skills para desarrollo (frontend, backend, python, testing)
- **LightRAG**: RAG con grafos (Fase 2, para chatbot)

Ver guía completa en: [`.claude/skills/GUIA_MAESTRA_HERRAMIENTAS_AVANZADAS.md`](./.claude/skills/GUIA_MAESTRA_HERRAMIENTAS_AVANZADAS.md)

## 📰 Sistema de Noticias Automatizado

Sistema completo de scraping y publicación de noticias:

- **Fuentes**: Google News RSS (ETFs, gestoras, mercados)
- **Estado**: ✅ 257 noticias importadas, 20 publicadas
- **Frecuencia**: Automático cada 6 horas (configurable)
- **Edge Function**: Desplegada en Supabase

Ver documentación completa: [`docs/NEWS_SYSTEM.md`](./docs/NEWS_SYSTEM.md)

## 🚀 CI/CD y Deployment

### GitHub + Vercel
- **Repositorio**: https://github.com/ruyx/ETFNEXO
- **Producción**: https://etfnexo.vercel.app
- **Deployments**: Automáticos en cada push a `main`

### Workflow
1. `git push origin main` → GitHub detecta cambios
2. Vercel inicia build automáticamente
3. Build completa en ~2 minutos
4. Deploy aliased a production URL

## 📧 Contacto

- **Email**: info@artigence.net
- **Proyecto**: ETF Nexo MVP
- **Versión**: 0.1.0
- **Fecha**: Junio 2026
- **GitHub**: https://github.com/ruyx/ETFNEXO

---

**Hecho con ❤️ usando Next.js 14, Supabase y Claude Code**

🤖 Generated with [Claude Code](https://claude.com/claude-code)
