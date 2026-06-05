# 🚀 ETF Nexo - Primeros Pasos Ejecutivos

## ⚡ Quick Start - Primeros 7 Días

### Día 1: Setup Infraestructura (4 horas)

#### ✅ Tareas
- [ ] Crear cuenta Supabase → https://supabase.com/dashboard
- [ ] Crear nuevo proyecto en Supabase (elegir región EU West)
- [ ] Copiar `Project URL` y `anon public` key
- [ ] Crear cuenta Vercel → https://vercel.com/signup
- [ ] Conectar cuenta GitHub con Vercel
- [ ] Comprar dominio `etfnexo.com` en Namecheap (~€8.88/año)
- [ ] Configurar Cloudflare (DNS gratuito + CDN)

#### 📝 Notas
```bash
# Guardar credenciales en archivo .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Solo backend
```

---

### Día 2: Database Schema (3 horas)

#### ✅ Tareas
- [ ] Conectar a Supabase SQL Editor
- [ ] Ejecutar `database/schema.sql` completo
- [ ] Verificar tablas creadas:
  - `fund_managers`
  - `etfs`
  - `weekly_rankings`
  - `newsletter_subscribers`
  - `featured_etf`
- [ ] Cargar datos seed de gestoras (`database/seed/fund_managers.sql`)
- [ ] Verificar foreign keys y constraints

#### 🧪 Test
```sql
-- Verificar estructura
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Verificar gestoras cargadas
SELECT * FROM fund_managers;
```

---

### Día 3: Frontend Base (6 horas)

#### ✅ Tareas
- [ ] Crear proyecto Next.js 14
```bash
npx create-next-app@latest etfnexo-frontend \
  --typescript \
  --tailwind \
  --app \
  --src-dir \
  --import-alias "@/*"
```
- [ ] Instalar dependencias clave
```bash
npm install @supabase/supabase-js
npm install recharts
npm install date-fns
npm install clsx tailwind-merge
```
- [ ] Crear `lib/supabase.ts` (cliente Supabase)
- [ ] Crear `lib/types.ts` (interfaces TypeScript)
- [ ] Setup Tailwind config con colores de marca
- [ ] Crear componente `<Header />`
- [ ] Crear componente `<Footer />`
- [ ] Página home básica (`app/page.tsx`)

#### 🎨 Diseño
Usar Tailwind UI gratuito como referencia: https://tailwindui.com/components

---

### Día 4: Scraper Proof of Concept (5 horas)

#### ✅ Tareas
- [ ] Crear carpeta `scrapers/`
- [ ] Setup Python venv
```bash
python3.11 -m venv venv
source venv/bin/activate
```
- [ ] Instalar dependencias
```bash
pip install playwright yfinance supabase beautifulsoup4 python-dotenv
playwright install chromium
```
- [ ] Implementar `yahoo/nav_prices.py` (Yahoo Finance API)
- [ ] Probar scraping de 5 ETFs conocidos:
  - IE00B4L5Y983 (iShares Core MSCI World)
  - IE00B3RBWM25 (Vanguard FTSE All-World)
  - LU1681043599 (Amundi S&P 500)
  - IE00BJ0KDQ92 (Xtrackers MSCI World)
  - IE00B53SZB19 (Invesco S&P 500)
- [ ] Guardar datos en Supabase `etfs` table

#### 🧪 Test
```python
# scrapers/test_yahoo.py
import yfinance as yf

etf = yf.Ticker("IWDA.L")  # iShares Core MSCI World (London)
print(etf.info)
print(etf.history(period="1y"))
```

---

### Día 5: Ranking MVP (4 horas)

#### ✅ Tareas
- [ ] Implementar `scrapers/ranking/calculate.py`
- [ ] Cargar al menos 20 ETFs en DB (manual o script)
- [ ] Ejecutar cálculo de ranking semanal
- [ ] Verificar datos en tabla `weekly_rankings`
- [ ] Crear endpoint API `app/api/ranking/route.ts`
- [ ] Probar API con curl:
```bash
curl http://localhost:3000/api/ranking
```

---

### Día 6: UI Ranking Page (5 horas)

#### ✅ Tareas
- [ ] Crear componente `<ETFCard />`
- [ ] Crear componente `<ScoreBadge />`
- [ ] Crear componente `<RankingTable />`
- [ ] Página `/ranking` con listado Top 50
- [ ] Implementar filtros básicos (por gestora)
- [ ] Agregar loading states
- [ ] Agregar error handling

#### 🎨 UI Components
```typescript
// components/ETFCard.tsx - ver ARQUITECTURA_CODIGO.md
```

---

### Día 7: Deploy MVP (3 horas)

#### ✅ Tareas
- [ ] Commit todo el código a GitHub
- [ ] Conectar repo con Vercel
- [ ] Configurar variables de entorno en Vercel
- [ ] Deploy automático
- [ ] Verificar build exitoso
- [ ] Configurar dominio custom `etfnexo.com` en Vercel
- [ ] Configurar DNS en Cloudflare
- [ ] Probar sitio en producción
- [ ] Test Lighthouse (objetivo: >90)

#### 🌐 URLs Finales
- Frontend: `https://etfnexo.com`
- Supabase Studio: `https://app.supabase.com/project/xxxxx`
- Vercel Dashboard: `https://vercel.com/tu-usuario/etfnexo-frontend`

---

## 📊 Diagrama de Arquitectura

```
┌─────────────────────────────────────────────────────────────┐
│                      USUARIOS                               │
│            (Inversores, Gestoras, Comunidad)                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ↓
        ┌────────────────────────────┐
        │   Cloudflare CDN (Gratis)  │
        │   - Cache estático          │
        │   - DDoS protection         │
        └────────────┬───────────────┘
                     │
                     ↓
┌────────────────────────────────────────────────────────────┐
│              VERCEL (Frontend - Gratis)                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │           Next.js 14 App Router                     │   │
│  │                                                      │   │
│  │  Pages:                      Components:            │   │
│  │  - / (Home + Top 10)         - ETFCard              │   │
│  │  - /ranking                  - ScoreBadge           │   │
│  │  - /etf/[isin]               - RankingTable         │   │
│  │  - /gestoras                 - NewsletterCTA        │   │
│  │  - /academia                                        │   │
│  │                                                      │   │
│  │  API Routes:                                        │   │
│  │  - /api/ranking              - /api/newsletter      │   │
│  └─────────────────┬────────────────────────────────────┘   │
└────────────────────┼────────────────────────────────────────┘
                     │
                     ↓
        ┌────────────────────────────┐
        │  Supabase (DB - Gratis)    │
        │                            │
        │  PostgreSQL:               │
        │  - etfs                    │
        │  - fund_managers           │
        │  - weekly_rankings         │
        │  - newsletter_subscribers  │
        │  - featured_etf            │
        └────────────┬───────────────┘
                     ↑
                     │
                     │ (Insert/Update datos)
                     │
┌────────────────────┴────────────────────────────────────────┐
│         Hostinger VPS Mini (Scrapers - €3.99/mes)           │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Python 3.11 + Playwright                            │   │
│  │                                                       │   │
│  │  Scrapers:                                           │   │
│  │  - ishares/scraper.py                                │   │
│  │  - vanguard/scraper.py                               │   │
│  │  - amundi/scraper.py                                 │   │
│  │  - yahoo/nav_prices.py (Yahoo Finance API)           │   │
│  │                                                       │   │
│  │  Ranking:                                            │   │
│  │  - ranking/calculate.py (Score ETF Nexo)             │   │
│  │                                                       │   │
│  │  Cron Jobs:                                          │   │
│  │  - Viernes 22:00 → run_all.py (scrapers)             │   │
│  │  - Lunes 06:00 → calculate.py (ranking)              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                     │
                     ↓ (Scrape datos)
        ┌────────────────────────────┐
        │   Fuentes Externas         │
        │                            │
        │  - ishares.com             │
        │  - vanguard.es             │
        │  - amundietf.com           │
        │  - Yahoo Finance API       │
        │  - PDFs KIDs oficiales     │
        └────────────────────────────┘


┌─────────────────────────────────────────────────────────────┐
│                  SERVICIOS ADICIONALES                      │
│                                                             │
│  - Buttondown/Resend: Newsletter (€0-9/mes)                │
│  - Discord: Comunidad temporal (€0)                         │
│  - HubSpot CRM: Pipeline patrocinadores (€0)                │
│  - Plausible: Analytics sin cookies (€0 self-hosted)        │
│  - UptimeRobot: Monitoring (€0)                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Diagrama de Base de Datos

```sql
┌─────────────────────┐
│  fund_managers      │
├─────────────────────┤
│ id (PK)             │───┐
│ name                │   │
│ slug                │   │
│ website             │   │
│ logo_url            │   │
│ verified            │   │
│ created_at          │   │
└─────────────────────┘   │
                          │
                          │ (FK)
                          │
┌─────────────────────────┴───────────────┐
│           etfs                          │
├─────────────────────────────────────────┤
│ id (PK)                                 │───┐
│ isin (UNIQUE)                           │   │
│ name                                    │   │
│ ticker                                  │   │
│ fund_manager_id (FK) ──────────────────┘   │
│                                             │
│ nav_price                                   │
│ nav_date                                    │
│ ter                                         │
│ aum_millions                                │
│                                             │
│ return_1w, return_1m, return_ytd            │
│ return_1y, return_3y                        │
│                                             │
│ index_name                                  │
│ replication_method                          │
│ distribution_policy                         │
│ domicile, currency                          │
│                                             │
│ kid_url                                     │
│ data_updated_at                             │
│ created_at                                  │
└─────────────────┬───────────────────────────┘
                  │
                  │ (FK)
                  │
┌─────────────────┴───────────────┐
│     weekly_rankings             │
├─────────────────────────────────┤
│ id (PK)                         │
│ week_number                     │
│ year                            │
│ etf_id (FK) ────────────────────┘
│ rank
│ score (0-100)
│
│ score_performance
│ score_cost
│ score_liquidity
│
│ created_at
│
│ UNIQUE(week_number, year, etf_id)
└─────────────────────────────────┘


┌─────────────────┴───────────────┐
│     featured_etf                │
├─────────────────────────────────┤
│ id (PK)                         │
│ week_number                     │
│ year                            │
│ etf_id (FK) ────────────────────┘
│ editorial_summary
│ why_featured
│ published_at
│
│ UNIQUE(week_number, year)
└─────────────────────────────────┘


┌─────────────────────────────────┐
│  newsletter_subscribers         │
├─────────────────────────────────┤
│ id (PK)                         │
│ email (UNIQUE)                  │
│ subscribed_at                   │
│ source (home|academia|ranking)  │
│ active                          │
└─────────────────────────────────┘
```

---

## 📋 Checklist Completo MVP (12 Semanas)

### ✅ Semana 1-2: Fundación
- [ ] Setup Supabase + Schema DB
- [ ] Setup Vercel + Next.js
- [ ] Comprar dominio + Cloudflare
- [ ] Diseño básico Figma (5 páginas)
- [ ] Componentes UI base (Header, Footer, ETFCard)

### ✅ Semana 3-4: Datos
- [ ] Scraper iShares (50 ETFs)
- [ ] Scraper Vanguard (30 ETFs)
- [ ] Scraper Amundi (40 ETFs)
- [ ] Yahoo Finance integration
- [ ] Script ranking calculator
- [ ] Carga inicial: 120 ETFs en DB

### ✅ Semana 5-6: Frontend Core
- [ ] Página Home + Top 10
- [ ] Página Ranking completo
- [ ] Ficha individual ETF
- [ ] Directorio gestoras
- [ ] Newsletter signup form
- [ ] API routes (/ranking, /newsletter)

### ✅ Semana 7-8: Contenido
- [ ] Artículo "¿Qué es un ETF?"
- [ ] Artículo "TER explicado"
- [ ] Artículo "Score ETF Nexo"
- [ ] Página Sobre Nosotros
- [ ] SEO: meta tags, sitemap
- [ ] Integración Buttondown/Resend

### ✅ Semana 9-10: Legal & Testing
- [ ] Términos y condiciones
- [ ] Política de privacidad
- [ ] Disclaimer MiFID II
- [ ] Tests E2E (Playwright)
- [ ] Lighthouse audit >90
- [ ] Pruebas de carga API

### ✅ Semana 11-12: Pre-Launch
- [ ] Beta privada (50 usuarios)
- [ ] Ajustes UX según feedback
- [ ] Setup Discord community
- [ ] Pitch deck patrocinadores (10 slides)
- [ ] Landing page patrocinador fundador
- [ ] Plan de contenido 4 primeras semanas
- [ ] 🚀 **LANZAMIENTO PÚBLICO**

---

## 💰 Presupuesto Detallado Mes a Mes

### Mes 1-3 (Desarrollo)
| Concepto | Coste |
|----------|-------|
| Dominio etfnexo.com | €0.74/mes (€8.88/año) |
| Hostinger VPS Mini | €3.99/mes |
| Supabase Free | €0 |
| Vercel Free | €0 |
| Buttondown (0-100 subs) | €0 |
| **TOTAL** | **€4.73/mes** |

### Mes 4-6 (Post-Lanzamiento)
| Concepto | Coste |
|----------|-------|
| Dominio | €0.74/mes |
| Hostinger VPS Mini | €3.99/mes |
| Supabase Free | €0 |
| Vercel Free | €0 |
| Buttondown (100-500 subs) | €9/mes ($9) |
| **TOTAL** | **€13.73/mes** |

### Mes 7-12 (Crecimiento)
| Concepto | Coste |
|----------|-------|
| Dominio | €0.74/mes |
| Hostinger VPS Medium | €8.99/mes (upgrade) |
| Supabase Pro | €23/mes (si >500MB DB) |
| Vercel Free | €0 |
| Buttondown Pro (1K subs) | €9/mes |
| **TOTAL** | **€41.73/mes** |

**Coste total 12 meses**: ~€278

**Con ingresos proyectados mes 12**: €8,500/mes (1 Platinum + 2 Gold + 3 Silver)

**Margen neto**: 97% 🎉

---

## 🎯 KPIs y Métricas de Éxito

### Métricas Técnicas
| Métrica | Target MVP | Cómo Medir |
|---------|------------|------------|
| Uptime | >99% | UptimeRobot |
| Lighthouse Score | >90 | Chrome DevTools |
| API Response Time | <500ms | Vercel Analytics |
| Ranking actualizado | 100% semanal | Cron logs |
| Email delivery | >95% | Buttondown/Resend analytics |

### Métricas de Negocio
| Métrica | Mes 1 | Mes 3 | Mes 6 | Mes 12 |
|---------|-------|-------|-------|--------|
| Suscriptores newsletter | 50 | 200 | 500 | 2,000 |
| Usuarios únicos/mes | 300 | 1,500 | 5,000 | 15,000 |
| Miembros Discord | 20 | 100 | 250 | 500 |
| Patrocinadores | 0 | 1 | 2 | 5 |
| MRR (€) | 0 | 500 | 1,500 | 8,500 |

### Validación Modelo (Mes 6)
**Si tienes**:
- ✅ >500 suscriptores newsletter
- ✅ >1 patrocinador pagando
- ✅ Comunidad activa (Discord >250 miembros)
- ✅ >5K usuarios únicos/mes

**→ MODELO VALIDADO. Escalar a Fase 2**

**Si no**:
- Pivotar a modelo B2C (membresías individuales)
- O iterar producto (cambiar focus)
- O cerrar proyecto (pérdida: ~€84)

---

## 🚨 Errores Comunes a Evitar

### ❌ NO HACER
1. **No sobre-ingenierizar el MVP**
   - No construir comparador de ETFs en MVP
   - No desarrollar app móvil antes de validar web
   - No crear foros custom, usar Discord temporalmente

2. **No gastar en herramientas premium antes de validar**
   - No contratar Morningstar API (caro)
   - No usar AWS en lugar de VPS económico
   - No pagar Beehiiv Premium desde día 1

3. **No scrapear demasiado agresivamente**
   - Respetar robots.txt
   - Rate limiting: 1 request cada 3-5 segundos
   - User-Agent identificado con email de contacto

4. **No ignorar el legal**
   - Disclaimer MiFID II es OBLIGATORIO
   - GDPR para newsletter (checkbox explícito)
   - No dar recomendaciones de inversión personalizadas

### ✅ SÍ HACER
1. **Validar antes de construir**
   - Hablar con 10 inversores potenciales antes de codear
   - Pre-vender patrocinio fundador antes de lanzar
   - Beta privada con 50 usuarios reales

2. **Priorizar contenido sobre features**
   - 3 artículos Academia de calidad > 10 mediocres
   - ETF Destacado con análisis profundo > ranking seco
   - Newsletter conversacional > email corporativo

3. **Automatizar temprano**
   - Cron jobs desde semana 1
   - Cálculo ranking automatizado
   - Newsletter drafts auto-generados

4. **Medir todo**
   - Google Analytics / Plausible desde día 1
   - Email open rates
   - Discord engagement
   - Tiempo en página ranking

---

## 📞 Recursos y Contactos

### Comunidades para Lanzamiento
- Reddit: r/eupersonalfinance, r/FIREEU
- Twitter: #ETF, #InversiónPasiva
- LinkedIn: Grupos de inversión España

### Gestoras Objetivo (Patrocinadores)
1. **Tier 1 (difícil conseguir MVP)**: BlackRock, Vanguard
2. **Tier 2 (objetivo primario)**:
   - Amundi
   - Xtrackers (DWS)
   - HSBC Asset Management
3. **Tier 3 (muy probable)**:
   - WisdomTree
   - Invesco
   - VanEck
   - Global X

### Herramientas Recomendadas
- Diseño: Figma (gratis)
- Wireframes: Excalidraw (gratis)
- Email: Resend (3K/mes gratis)
- CRM: HubSpot Free
- Analytics: Plausible self-hosted o Google Analytics
- Monitoreo: UptimeRobot (gratis)

---

## 🎁 Plantillas y Templates

### Email Patrocinador Fundador

```
Asunto: ETF Nexo - Oportunidad de patrocinio fundador

Hola [Nombre],

Me llamo [Tu nombre] y estoy lanzando **ETF Nexo**, la primera comunidad
de inversores en ETFs enfocada al mercado hispanoparlante.

**El problema**: Los inversores en España y LATAM no tienen un ranking
independiente de ETFs en español, con análisis semanales y una comunidad
activa donde aprender.

**Nuestra solución**: Ranking semanal de 170+ ETFs, newsletter con análisis
profundo del ETF destacado, Academia para principiantes y comunidad Discord.

**Oportunidad para [Gestora]**:
- Acceso directo a audiencia cualificada (target: 5,000 usuarios mes 6)
- Perfil Premium en directorio de gestoras
- Mención destacada en newsletter semanal (target: 500 suscriptores)
- Naming rights de sección (ej: "Academia ETF Nexo by [Gestora]")

**Inversión**: €500/mes como **Patrocinador Fundador**
(50% descuento vs precio público €1,000/mes)

**Compromiso**: Contrato 6 meses, renovación opcional.

¿Podríamos agendar una call de 15 min esta semana para mostrarte el MVP?

Saludos,
[Tu nombre]
Fundador, ETF Nexo
hola@etfnexo.com
```

### Post Lanzamiento LinkedIn

```
🚀 Después de 3 meses de desarrollo, hoy lanzamos ETF Nexo:
el primer ranking y comunidad de ETFs en español.

¿Por qué existe ETF Nexo?

La mayoría de inversores hispanoparlantes no entiende qué es un TER,
cómo comparar dos ETFs similares, o qué diferencia hay entre réplica
física y sintética.

La información existe... pero está dispersa, en inglés, o en lenguaje
demasiado técnico.

ETF Nexo resuelve esto con:

📊 Ranking semanal de 170+ ETFs con Score transparente (0-100)
📚 Academia desde cero: "¿Qué es un ETF?" explicado sin jerga
💬 Comunidad Discord activa de inversores hispanoparlantes
📧 Newsletter todos los lunes con el ETF Destacado analizado a fondo

100% gratuito. Sin asesoramiento financiero.
Solo información y comunidad.

👉 https://etfnexo.com

¿Inviertes en ETFs? Únete a la comunidad.
¿Trabajas en una gestora de fondos? Hablemos de patrocinios.

#ETF #InversiónPasiva #FIRE #FinanzasPersonales
```

---

## 📚 Documentos Relacionados

- [PLAN_MVP_ECONOMICO.md](./PLAN_MVP_ECONOMICO.md) - Plan completo MVP
- [ARQUITECTURA_CODIGO.md](./ARQUITECTURA_CODIGO.md) - Código y arquitectura técnica
- [ETF_Nexo_PlanDeNegocios V1.0.pdf](./ETF_Nexo_PlanDeNegocios%20V1.0.pdf) - Plan de negocios original
- [Contenido Página Web.pdf](./Contenido%20Página%20Web.pdf) - Arquitectura del sitio
- [LayOut Página Web V1.0.pdf](./LayOut%20Página%20Web%20V1.0.pdf) - Diseños UI

---

## ✅ Siguiente Acción Inmediata

**Ahora mismo, los próximos 30 minutos**:

1. [ ] Crear cuenta Supabase
2. [ ] Crear cuenta Vercel
3. [ ] Comprobar disponibilidad dominio `etfnexo.com`
4. [ ] Crear carpeta local `etfnexo/` y subcarpetas:
```bash
mkdir -p etfnexo/{frontend,scrapers,database,scripts,docs}
```
5. [ ] Copiar estos 3 archivos markdown a `etfnexo/docs/`

**¿Listo?** → Continúa con **Día 1** del Quick Start arriba ☝️

---

**Última actualización**: Junio 2026
**Versión**: 1.0
**Contacto**: Cuando tengas dudas, vuelve a este documento y sigue el checklist paso a paso.

¡Éxito con ETF Nexo! 🚀
