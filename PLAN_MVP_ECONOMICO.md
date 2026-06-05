# 📊 ETF Nexo - Plan de MVP Económico
**Versión 1.0 - Junio 2026**
*Prioridad: Validación rápida con costes <€50/mes*

---

## 🎯 Objetivo del MVP

Validar el **modelo de negocio B2B** (patrocinios) y la **propuesta de valor** (ranking + comunidad) con:
- **Presupuesto mensual**: <€50/mes durante los primeros 6 meses
- **Tiempo de desarrollo**: 8-12 semanas
- **Métrica de éxito**: 500 suscriptores newsletter + 1 patrocinador fundador

---

## 💰 Arquitectura de Costes - Tier Gratuito Máximo

### Stack Tecnológico Optimizado

| Componente | Solución | Coste Mensual | Límites Free Tier |
|------------|----------|---------------|-------------------|
| **Frontend** | Vercel | €0 | 100GB bandwidth, dominio .vercel.app |
| **Base de Datos** | Supabase | €0 | 500MB DB, 2GB bandwidth, 50K usuarios activos/mes |
| **Hosting Scripts** | Hostinger VPS Mini | €3.99 | 1GB RAM, 20GB SSD (para scrapers Python) |
| **Newsletter** | Buttondown | €0 | Hasta 100 suscriptores (luego $9/mes) |
| **CDN/Cache** | Cloudflare | €0 | Unlimited bandwidth |
| **Analytics** | Plausible (self-hosted) | €0 | En Hostinger VPS |
| **CRM** | HubSpot Free | €0 | 1M contactos |
| **Dominio** | Namecheap | €8.88/año | .com first year |
| **Email transaccional** | Resend | €0 | 3K emails/mes |

**Total estimado Mes 1-6**: €4.74/mes (VPS) + €0.74/mes (dominio) = **€5.48/mes**

Cuando superes 100 suscriptores newsletter (meta mes 2-3), agregar:
- Buttondown Personal: $9/mes → **Total: €14/mes aprox.**

---

## 🏗️ Arquitectura Técnica MVP

### 1. Frontend (Vercel - Gratuito)

**Framework**: Next.js 14 (App Router) + TypeScript

**Razones**:
- Hosting gratuito en Vercel con CDN global
- SSG/ISR para páginas estáticas (ranking semanal)
- SEO optimizado out-of-the-box
- Edge Functions para features dinámicas

**Páginas Mínimas MVP**:
```
/                    → Home + Ranking Top 10
/ranking             → Ranking completo (Top 50)
/etf/[isin]          → Ficha individual del ETF
/gestoras            → Directorio de gestoras (5 iniciales)
/academia            → 3 artículos educativos básicos
/newsletter          → Landing de suscripción
/sobre-nosotros      → Quiénes somos + disclaimer legal
```

**NO incluir en MVP**:
- ❌ Comparador (Fase 2)
- ❌ Foros comunitarios (usar Discord gratuito temporalmente)
- ❌ Mi Cartera (Fase 2)
- ❌ App móvil

---

### 2. Base de Datos (Supabase - Gratuito)

**Schema PostgreSQL Mínimo**:

```sql
-- Gestoras
CREATE TABLE fund_managers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  website TEXT,
  logo_url TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ETFs
CREATE TABLE etfs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  isin TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  ticker TEXT,
  fund_manager_id UUID REFERENCES fund_managers(id),

  -- Datos financieros
  nav_price DECIMAL(10,4),
  nav_date DATE,
  ter DECIMAL(5,4),
  aum_millions DECIMAL(12,2),

  -- Rendimientos (% decimales)
  return_1w DECIMAL(8,4),
  return_1m DECIMAL(8,4),
  return_ytd DECIMAL(8,4),
  return_1y DECIMAL(8,4),
  return_3y DECIMAL(8,4),

  -- Características
  index_name TEXT,
  replication_method TEXT,
  distribution_policy TEXT, -- 'Accumulating' o 'Distributing'
  domicile TEXT,
  currency TEXT,

  -- Metadata
  kid_url TEXT,
  data_updated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ranking semanal (caché calculado)
CREATE TABLE weekly_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number INT NOT NULL, -- Semana del año
  year INT NOT NULL,
  etf_id UUID REFERENCES etfs(id),
  rank INT NOT NULL,
  score INT NOT NULL, -- 0-100

  -- Componentes del score (para transparencia)
  score_performance INT,
  score_cost INT,
  score_liquidity INT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(week_number, year, etf_id)
);

-- Newsletter subscribers
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT, -- 'home', 'academia', 'ranking'
  active BOOLEAN DEFAULT true
);

-- ETF Destacado de la Semana (editorial)
CREATE TABLE featured_etf (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_number INT NOT NULL,
  year INT NOT NULL,
  etf_id UUID REFERENCES etfs(id),
  editorial_summary TEXT,
  why_featured TEXT,
  published_at TIMESTAMPTZ,
  UNIQUE(week_number, year)
);

-- Índices
CREATE INDEX idx_etfs_isin ON etfs(isin);
CREATE INDEX idx_weekly_rankings_week ON weekly_rankings(week_number, year);
CREATE INDEX idx_newsletter_email ON newsletter_subscribers(email);
```

**Límites Supabase Free**:
- ✅ 500MB → Suficiente para ~2,000 ETFs con 2 años de histórico
- ✅ 50K usuarios activos/mes → MVP bien dentro de límite
- ⚠️ 2GB bandwidth/mes → Optimizar queries con caché en Vercel

**Estrategia de optimización**:
- Ranking semanal pre-calculado (1 query semanal)
- Caché de 7 días en Vercel para páginas `/ranking`
- Lazy load de fichas individuales

---

### 3. Backend & Scrapers (Hostinger VPS Mini - €3.99/mes)

**VPS Specs**:
- 1GB RAM
- 20GB SSD
- 1 vCPU

**Stack**:
- Python 3.11
- FastAPI (API endpoints opcionales)
- Playwright (para scrapers)
- Cron jobs

**Scrapers Mínimos MVP (5 gestoras)**:

```python
# scrapers/schedule.py
SCRAPERS_SCHEDULE = {
    'ishares': {
        'frequency': 'weekly',  # Viernes 22:00
        'priority': 1,
        'etfs_count': 50  # Solo top 50 de iShares
    },
    'vanguard': {
        'frequency': 'weekly',
        'priority': 2,
        'etfs_count': 30
    },
    'amundi': {
        'frequency': 'weekly',
        'priority': 2,
        'etfs_count': 40
    },
    'xtrackers': {
        'frequency': 'weekly',
        'priority': 3,
        'etfs_count': 30
    },
    'invesco': {
        'frequency': 'weekly',
        'priority': 3,
        'etfs_count': 20
    }
}
# Total: 170 ETFs en MVP
```

**Estrategia de scraping económica**:
- ✅ **1 scraping semanal** (viernes 22:00) en lugar de diario
- ✅ Limitar a **170 ETFs** (los más populares de cada gestora)
- ✅ NAV price desde **Yahoo Finance API gratuita** en lugar de webs de gestoras
- ✅ KIDs: solo URLs, no descargar PDFs (link directo a gestora)

**Cron jobs**:
```bash
# /etc/crontab
0 22 * * 5 /usr/bin/python3 /opt/etfnexo/scrapers/run_all.py >> /var/log/scrapers.log
0 6 * * 1 /usr/bin/python3 /opt/etfnexo/ranking/calculate_weekly.py >> /var/log/ranking.log
```

**Optimización RAM (1GB)**:
- Scrapers secuenciales (no paralelos)
- Playwright headless con `--disable-dev-shm-usage`
- Sin Airflow (demasiado pesado, usar cron)

---

### 4. Newsletter (Buttondown - €0 luego $9/mes)

**Por qué Buttondown**:
- Free hasta 100 suscriptores
- Markdown nativo (perfecto para contenido técnico)
- API sencilla
- Analytics incluidas
- €9/mes por 1,000 suscriptores (vs €30-50 de Beehiiv)

**Alternativa si presupuesto 0**:
- Usar Supabase + Resend (free 3K emails/mes)
- Template HTML custom
- Tracking manual en Supabase

**Estructura Newsletter MVP**:
```markdown
# ETF Nexo Digest - Semana {N}

## 🏆 ETF Destacado: [Nombre ETF]
[2 párrafos contexto + por qué está destacado]

## 📊 Top 5 Ranking Semanal
1. [ETF] - +X.X% | TER X.XX% | Score: XX
...

## 📚 Del Blog
[Link a 1 artículo Academia]

---
*Patrocinado por [Gestora]* [si aplica]
```

**Envío**: Lunes 9:00 AM (después de calcular ranking 6:00 AM)

---

### 5. Comunidad (Discord - Gratuito - Temporal)

**Para MVP, evitar desarrollo de foros custom**:
- Crear Discord Server gratuito
- 5 canales:
  - #presentaciones
  - #ranking-semanal (bot auto-post)
  - #etf-destacado (discusión)
  - #consultas-generales
  - #academia-recursos

**Ventajas**:
- €0 coste
- App móvil nativa
- Notificaciones push
- Moderación sencilla

**Transición a Fase 2**:
- Migrar a Discourse o bbPress (self-hosted en Hostinger VPS Medium)

---

## 📅 Roadmap de Desarrollo (12 semanas)

### Semanas 1-2: Fundación
- [ ] Setup Vercel + Next.js project
- [ ] Setup Supabase + schema inicial
- [ ] Comprar dominio `etfnexo.com`
- [ ] Configurar Cloudflare DNS
- [ ] Diseño Figma → HTML/CSS (5 páginas core)

### Semanas 3-4: Backend & Datos
- [ ] Scraper iShares (50 ETFs)
- [ ] Scraper Vanguard (30 ETFs)
- [ ] Scraper Amundi (40 ETFs)
- [ ] Yahoo Finance API integration (NAV prices)
- [ ] Script cálculo ranking semanal
- [ ] Carga inicial DB: 120 ETFs

### Semanas 5-6: Frontend Core
- [ ] Página Home + Ranking Top 10
- [ ] Página Ranking completo (filtros básicos)
- [ ] Ficha individual ETF
- [ ] Directorio gestoras (3 iniciales)
- [ ] Newsletter signup form

### Semanas 7-8: Academia & Content
- [ ] 3 artículos Academia:
  - "¿Qué es un ETF?"
  - "TER: El coste que nadie te explica"
  - "Cómo leer el Score ETF Nexo"
- [ ] SEO: meta tags, sitemap, robots.txt
- [ ] Integración Buttondown API

### Semanas 9-10: Testing & Legal
- [ ] Términos y condiciones
- [ ] Política de privacidad (GDPR)
- [ ] Disclaimer financiero (MiFID II)
- [ ] Testing E2E (Playwright)
- [ ] Lighthouse audit (>90 score)

### Semanas 11-12: Pre-Launch
- [ ] Beta privada (50 usuarios)
- [ ] Ajustes UX según feedback
- [ ] Setup Discord community
- [ ] Setup HubSpot CRM (patrocinadores pipeline)
- [ ] Landing page patrocinador fundador
- [ ] **Lanzamiento público** 🚀

---

## 📊 Modelo de Datos - ETFs Priorizados MVP

### Criterio de Selección (170 ETFs total)

**Por cada gestora, seleccionar**:
1. **Top 10 por AUM** (los más grandes)
2. **Top 5 por rendimiento 1Y** (best performers)
3. **5 ETFs temáticos populares** (IA, renovables, tech, etc.)

**Distribución MVP**:
```
iShares (BlackRock): 50 ETFs
├─ Top 10 AUM: IWDA, CSPX, EQQQ, VWCE...
├─ Best performers: Sector tech, healthcare
└─ Temáticos: RBOT (robotics), INRG (clean energy)

Vanguard: 30 ETFs
├─ VWCE, VUSA, VEUR...
└─ Bond ETFs principales

Amundi: 40 ETFs
├─ ETFs UCITS principales
└─ Gama ESG

Xtrackers: 30 ETFs
Invesco: 20 ETFs
```

**Campos mínimos por ETF (MVP)**:
```typescript
interface ETF {
  isin: string
  name: string
  ticker: string
  fundManager: string

  // Financiero
  navPrice: number
  navDate: Date
  ter: number
  aum: number

  // Rendimientos
  return1W: number
  return1M: number
  returnYTD: number
  return1Y: number

  // Características
  indexName: string
  replicationMethod: 'Physical' | 'Synthetic'
  distributionPolicy: 'Accumulating' | 'Distributing'

  // Score
  score: number // 0-100
  rank: number

  // Links
  kidUrl: string
  managerUrl: string
}
```

---

## 🎨 Diseño UI/UX - Reglas Minimalistas MVP

### Paleta de Colores
```css
:root {
  --color-primary: #2563eb; /* Blue 600 - confianza financiera */
  --color-success: #10b981; /* Green 500 - rendimiento positivo */
  --color-danger: #ef4444;  /* Red 500 - rendimiento negativo */
  --color-neutral-0: #ffffff;
  --color-neutral-50: #f9fafb;
  --color-neutral-900: #111827;

  --color-score-high: #10b981; /* Score >80 */
  --color-score-medium: #f59e0b; /* Score 60-80 */
  --color-score-low: #6b7280; /* Score <60 */
}
```

### Componentes Core
1. **ETF Card** (ranking list item)
2. **Score Badge** (visual del 0-100)
3. **Gestora Logo** (brand recognition)
4. **Newsletter CTA** (sticky bottom bar)
5. **Data Table** (ranking completo)

### Herramientas
- **Tailwind CSS** (utility-first, sin CSS custom)
- **Headless UI** (componentes accesibles)
- **Heroicons** (iconografía)
- **Recharts** (gráficos rendimiento)

---

## 🔐 Estrategia de Autenticación (Fase 1.5 - Post-MVP)

**MVP: Sin autenticación**
- Todo contenido público
- Newsletter signup solo requiere email

**Fase 1.5 (mes 4-6): Membresías Premium**
- Supabase Auth (gratis)
- Magic link (passwordless)
- Niveles:
  - Free (actual)
  - Premium €9.99/mes:
    - Alertas email cambios ranking
    - Exportar ranking CSV
    - Acceso webinars grabados

---

## 📈 Métricas de Éxito MVP (Primeros 6 meses)

### KPIs Técnicos
- ✅ **Uptime >99%** (Vercel + Supabase muy fiables)
- ✅ **Lighthouse Score >90** (performance)
- ✅ **Ranking actualizado semanalmente** sin fallos
- ✅ **Email delivery rate >95%**

### KPIs de Negocio
| Métrica | Mes 1 | Mes 3 | Mes 6 |
|---------|-------|-------|-------|
| Suscriptores newsletter | 50 | 200 | 500 |
| Usuarios únicos/mes | 300 | 1,500 | 5,000 |
| Miembros Discord | 20 | 100 | 250 |
| Patrocinadores | 0 | 1 | 2 |
| Ingresos mensuales | €0 | €500 | €1,500 |

### Validación del Modelo
**Si al mes 6 tienes**:
- ✅ 500+ suscriptores newsletter
- ✅ 1 patrocinador fundador (€500-1,000/mes)
- ✅ Comunidad activa (Discord >250 miembros)

**→ Modelo validado. Escalar a Fase 2**

**Si no**:
- Pivotar a modelo B2C puro (membresías individuales)
- O cerrar proyecto (coste total 6 meses: €84)

---

## 🚀 Plan de Escalado - Fase 2 (Mes 7-12)

**Cuando los costes gratuitos no sean suficientes**:

### Trigger 1: >100 suscriptores newsletter
- Migrar a Buttondown $9/mes
- **Coste adicional**: +€8/mes

### Trigger 2: >500MB DB o >2GB bandwidth
- Supabase Pro: $25/mes (8GB DB, 50GB bandwidth)
- **Coste adicional**: +€23/mes

### Trigger 3: >10K visitas/mes
- Hostinger VPS Medium: €8.99/mes (2GB RAM)
- **Coste adicional**: +€5/mes

### Trigger 4: Foros custom + features avanzadas
- Migrar de Discord a Discourse (self-hosted)
- Comparador de ETFs
- Mi Cartera
- **Desarrollo**: 8-10 semanas

**Proyección Costes Mes 12**:
- Supabase Pro: €23/mes
- Hostinger VPS Medium: €9/mes
- Buttondown 1K subs: €9/mes
- Dominio: €1/mes
- **Total**: **€42/mes**

**Con ingresos proyectados**:
- 1 Platinum + 2 Gold + 3 Silver = €8,500/mes (según plan negocios)
- **Margen operativo**: €8,458/mes (99.5%)

---

## 🎯 Diferenciadores Clave MVP

### 1. Score ETF Nexo Transparente
**Fórmula pública** (vs. cajas negras de competidores):
```python
def calculate_score(etf):
    # Rendimiento ajustado al riesgo (35%)
    sharpe = (etf.return1Y - 0.02) / etf.volatility1Y
    score_performance = normalize(sharpe, min=-1, max=2) * 35

    # Coste TER (25%)
    score_cost = (1 - min(etf.ter, 0.01) / 0.01) * 25

    # Liquidez AUM (20%)
    score_liquidity = normalize(log(etf.aum), min=log(10), max=log(10000)) * 20

    # Valoración comunidad (20%) - MVP: sustituir por top holding quality
    score_quality = calculate_holdings_quality(etf) * 20

    return round(sum([score_performance, score_cost, score_liquidity, score_quality]))
```

### 2. ETF Destacado Semanal (Editorial)
**No solo datos, sino contexto**:
- Por qué este ETF esta semana (macro context)
- Comparativa con alternativas
- Para qué perfil de inversor

### 3. Academia de 0 a 100
**Contenido para absolutos principiantes**:
- "¿Qué es un ETF?" con analogías simples
- "TER explicado como si tuvieras 10 años"
- Evitar jerga financiera

### 4. Comunidad en Español
**Discord activo + newsletter conversacional**:
- Responder dudas en el foro
- Destacar preguntas de la comunidad en newsletter

---

## 🛡️ Compliance & Legal MVP

### Disclaimer Obligatorio (MiFID II)

Incluir en **footer de todas las páginas**:

> ETF Nexo es una plataforma de información financiera y educación. No somos asesores financieros regulados ni prestamos servicios de inversión. El contenido publicado tiene carácter exclusivamente informativo y no constituye recomendación de inversión personalizada. Invertir conlleva riesgos, incluida la pérdida total del capital. Consulte con un asesor financiero antes de tomar decisiones de inversión.

### GDPR - Newsletter
```html
<form>
  <input type="email" required />
  <label>
    <input type="checkbox" required />
    Acepto recibir el newsletter semanal.
    Puedes darte de baja en cualquier momento.
  </label>
  <button>Suscribirme</button>
</form>
```

### Cookies
**MVP: Sin cookies de tracking**
- Analytics con Plausible (self-hosted, no cookies)
- Buttondown no requiere cookie consent
- **No necesitas banner de cookies** si solo usas cookies técnicas

---

## 📝 Checklist Pre-Lanzamiento

### Técnico
- [ ] SSL certificado (Cloudflare gratis)
- [ ] Dominio apuntando a Vercel
- [ ] DB con 170 ETFs cargados
- [ ] Ranking semanal calculado (primera edición)
- [ ] Newsletter template funcionando
- [ ] Scraper corriendo en cron
- [ ] Backup DB configurado (Supabase auto-backup)
- [ ] Monitoring: Uptime Robot (gratis)

### Legal
- [ ] Términos y condiciones publicados
- [ ] Política de privacidad GDPR
- [ ] Disclaimer MiFID II visible
- [ ] Email de contacto: hola@etfnexo.com
- [ ] Registro de dominio con WHOIS privacy

### Contenido
- [ ] 3 artículos Academia publicados
- [ ] Página "Sobre Nosotros"
- [ ] Página "Cómo calculamos el score"
- [ ] Primera edición newsletter redactada
- [ ] Discord server configurado

### Marketing
- [ ] Landing page para patrocinador fundador
- [ ] Pitch deck (10 slides)
- [ ] Email outreach a 3 gestoras objetivo
- [ ] Post de lanzamiento LinkedIn
- [ ] Compartir en comunidades Reddit: r/eupersonalfinance

---

## 🎁 Bonus: Automatizaciones Low-Code

### 1. Auto-Post Ranking a Discord (Webhook)
```python
# ranking/post_discord.py
import requests

def post_to_discord(ranking_top5):
    webhook_url = "https://discord.com/api/webhooks/..."
    message = f"""
    **📊 Ranking Semanal ETF Nexo - Top 5**

    1. {ranking_top5[0]['name']} - Score: {ranking_top5[0]['score']}
    2. {ranking_top5[1]['name']} - Score: {ranking_top5[1]['score']}
    ...

    Ver ranking completo: https://etfnexo.com/ranking
    """
    requests.post(webhook_url, json={"content": message})
```

### 2. Auto-Email cuando ETF cambia >10 posiciones
```python
# alerts/rank_changes.py
def detect_big_movers():
    # Comparar ranking semana actual vs anterior
    big_movers = get_etfs_moved_more_than(10)

    for etf in big_movers:
        send_email(
            to="equipo@etfnexo.com",
            subject=f"🚨 {etf.name} subió {etf.rank_change} posiciones",
            body="Revisar para posible ETF destacado próxima semana"
        )
```

### 3. Auto-Generate Newsletter Draft
```python
# newsletter/auto_draft.py
def generate_newsletter_draft():
    featured_etf = get_featured_etf_of_week()
    top5 = get_ranking_top5()

    markdown = f"""
# ETF Nexo Digest - Semana {current_week}

## 🏆 ETF Destacado: {featured_etf.name}

{featured_etf.editorial_summary}

Por qué está destacado: {featured_etf.why_featured}

## 📊 Top 5 Ranking

{"".join([f"{i+1}. {etf.name} - {etf.return1Y}% | Score: {etf.score}\n" for i, etf in enumerate(top5)])}

[Ver ranking completo →](https://etfnexo.com/ranking)
    """

    # Guardar en Supabase o enviar a Buttondown API
    save_draft(markdown)
```

---

## 🎯 Resumen Ejecutivo

### MVP en Números
- **Coste total 6 meses**: €84 (<€15/mes promedio)
- **Tiempo desarrollo**: 12 semanas
- **ETFs en ranking**: 170 (5 gestoras)
- **Features**: Ranking + Academia + Newsletter + Discord
- **Target mes 6**: 500 suscriptores + 1 patrocinador

### Stack Final MVP
```
Frontend: Next.js 14 + TypeScript + Tailwind
Backend: Python 3.11 + FastAPI (minimal)
Database: Supabase (PostgreSQL)
Scrapers: Playwright + Cron
Newsletter: Buttondown → Resend (si presupuesto 0)
Hosting: Vercel (frontend) + Hostinger VPS Mini (scrapers)
Comunidad: Discord (temporal)
Analytics: Plausible self-hosted
CRM: HubSpot Free
```

### Siguientes Pasos
1. **Semana 1**: Setup infraestructura (Vercel + Supabase + Dominio)
2. **Semana 2-4**: Scrapers + Carga inicial 170 ETFs
3. **Semana 5-8**: Frontend core + Newsletter
4. **Semana 9-12**: Content + Legal + Beta testing
5. **Semana 13**: 🚀 **Lanzamiento público**

---

## 📚 Recursos y Referencias

### Documentación Técnica
- [Supabase Docs](https://supabase.com/docs)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Playwright Python](https://playwright.dev/python/)
- [Yahoo Finance API](https://github.com/ranaroussi/yfinance)

### Competidores a Estudiar
- justETF.com (datos, sin comunidad)
- ETFdb.com (USA market)
- r/EuropeFIRE (comunidad Reddit)

### Fuentes de Datos Públicas
- iShares: https://www.ishares.com/es/productos
- Vanguard: https://www.vanguard.es/professional/producto
- Yahoo Finance: ETF data API
- KIID/KID: PDFs oficiales gestoras (obligatorio por UCITS)

---

**Última actualización**: Junio 2026
**Versión**: 1.0
**Autor**: Plan ETF Nexo MVP
**Contacto**: hola@etfnexo.com (cuando esté activo)
