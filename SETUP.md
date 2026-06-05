# ETF Nexo - Setup Guide

## ✅ Setup Status

### Completed

- ✅ **Dependencies installed** (426 packages with pnpm)
- ✅ **Design system created** from brand manual PDF
- ✅ **Project structure** complete (Next.js 14 App Router)
- ✅ **Supabase clients** configured (browser + server)
- ✅ **TypeScript types** generated from database schema
- ✅ **Database migration** created (6 tables + RLS policies)
- ✅ **Config files** created (tailwind, tsconfig, postcss, etc.)
- ✅ **Next.js dev server** tested and working ✨

### Pending (Network Required)

- ⏸️ **Database migration** needs to be applied to remote Supabase
  - **Reason**: IPv6 network connectivity issue from WSL
  - **Solution**: Run `./scripts/setup-database.sh` when network is available

## 🚀 Quick Start

### 1. Start Development Server

```bash
cd /home/suario/ruy
pnpm dev
```

The app will be available at:
- **http://localhost:5000** (or 3001, 3002, 3003 if ports are busy)

### 2. Apply Database Migration (When Network Available)

```bash
./scripts/setup-database.sh
```

This will:
- Connect to Supabase PostgreSQL database
- Create 6 tables: `fund_managers`, `etfs`, `etf_price_history`, `weekly_rankings`, `newsletter_subscribers`, `affiliate_clicks`
- Apply RLS policies for public read access
- Seed 8 fund managers (iShares, Vanguard, Amundi, etc.)

## 📁 Project Structure

```
ruy/
├── app/                      # Next.js 14 App Router
│   ├── globals.css          # Global styles + Tailwind utilities
│   ├── layout.tsx           # Root layout with Archivo font
│   └── page.tsx             # Landing page with hero + brand values
├── components/              # React components (to be created)
│   ├── etf/                # ETF-specific components
│   ├── layout/             # Header, Footer, Navigation
│   └── ui/                 # Reusable UI components
├── lib/
│   └── supabase/
│       ├── client.ts       # Browser client (use in 'use client')
│       └── server.ts       # Server client (use in Server Components)
├── types/
│   └── database.types.ts   # TypeScript types for all tables
├── supabase/
│   ├── config.toml         # Supabase configuration
│   └── migrations/
│       └── 20260603000001_create_initial_schema.sql
├── scripts/
│   └── setup-database.sh   # Database setup script
├── design-system/
│   └── MASTER.md           # Complete design system documentation
├── .env.local              # Environment variables (Supabase credentials)
├── package.json            # Dependencies and scripts
├── next.config.mjs         # Next.js configuration
├── tailwind.config.ts      # Tailwind with brand colors
└── README.md               # Project documentation
```

## 🎨 Design System

The project uses the **ETF Nexo Brand Manual V1.0** design system:

### Colors

```typescript
// Primary Colors
--color-primary-blue: #235D87   // Blue (trust, stability)
--color-primary-teal: #5DABB8   // Teal (innovation, growth)
--color-primary-orange: #F95602 // Orange (energy, action)
--color-neutral-50: #FAF9F6     // Cream background

// Full scales available: 50-900 for blue, teal, orange, neutral
```

### Typography

```typescript
--font-heading: 'Archivo', sans-serif  // Bold for headings
--font-body: 'Archivo', sans-serif     // Regular for body text
```

### Utility Classes

```css
/* Headings */
.heading-1  /* 3.5rem bold */
.heading-2  /* 2.5rem bold */
.heading-3  /* 2rem bold */

/* Buttons */
.btn-primary    /* Orange CTA */
.btn-secondary  /* Blue outline */
.btn-ghost      /* Transparent */

/* Cards */
.card           /* White card with hover */
.glass-card     /* Glassmorphism effect */

/* Gradients */
.bg-gradient-primary    /* Blue → Teal */
.bg-gradient-secondary  /* Teal → Orange */
```

See full documentation: [`design-system/MASTER.md`](./design-system/MASTER.md)

## 🗄️ Database Schema

### Tables

1. **`fund_managers`** - ETF providers (iShares, Vanguard, etc.)
2. **`etfs`** - Main ETF catalog with dynamic data
3. **`etf_price_history`** - Daily price history for charts
4. **`weekly_rankings`** - Calculated rankings with scores
5. **`newsletter_subscribers`** - Newsletter email list
6. **`affiliate_clicks`** - Broker click tracking

### RLS Policies

- **Public read access** on all tables
- **Public insert access** on `newsletter_subscribers` and `affiliate_clicks`
- **Service role write access** for all other operations

## 📊 Data Strategy

### Yahoo Finance (80% of data)

- ✅ Daily NAV prices
- ✅ Historical data (10+ years)
- ✅ Returns (1W, 1M, YTD, 1Y, 3Y, 5Y)
- ✅ Volatility (standard deviation)
- ✅ Volume (for liquidity score)

### Web Scraping (20% of data)

- ⚠️ TER (Total Expense Ratio) - monthly
- ⚠️ AUM (Assets Under Management) - monthly
- ⚠️ Holdings (Fase 2)

## 🧪 Available Scripts

```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
pnpm type-check   # TypeScript type checking

# Database
./scripts/setup-database.sh  # Apply migrations (requires network)
```

## 🔧 Environment Variables

The following variables are already configured in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://utvioubcqkwwzvufhups.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI...
DATABASE_PASSWORD=GX7fzQvZSMszrjpk
```

⚠️ **Never commit `.env.local` to git** (already in .gitignore)

## 🛠️ Advanced Tools Installed

### 1. Claude-Mem

Persistent memory between sessions.

```bash
# Start worker
npx claude-mem start

# UI at http://localhost:37777
```

### 2. UI/UX Pro Max

Auto-activates on UI requests. Generates complete design systems with 67 UI styles.

### 3. ECC Skills

62 skills installed:
- `frontend-patterns` - React, Next.js, Tailwind best practices
- `python-patterns` - Python for scrapers
- `supabase-cli-database` - Database management

### 4. LightRAG

Documented for Fase 2 (chatbot with knowledge graphs).

See: [`.claude/skills/GUIA_MAESTRA_HERRAMIENTAS_AVANZADAS.md`](./.claude/skills/GUIA_MAESTRA_HERRAMIENTAS_AVANZADAS.md)

## 📝 Next Steps

### MVP (Weeks 1-8)

1. **Components** (Week 1-2)
   - [ ] `ETFCard` - Display ETF with score ring
   - [ ] `ScoreRing` - Circular score visualization
   - [ ] `PriceChart` - Historical price chart (Recharts)
   - [ ] `Header` - Navigation + logo
   - [ ] `Footer` - Links + newsletter signup

2. **Pages** (Week 3-4)
   - [ ] Landing page (hero + brand values + newsletter)
   - [ ] Rankings page (`/rankings`)
   - [ ] ETF detail page (`/etfs/[isin]`)

3. **Data Pipeline** (Week 5-6)
   - [ ] Python scraper for Yahoo Finance
   - [ ] TER scraper (monthly)
   - [ ] Ranking calculation script
   - [ ] Cron jobs on VPS

4. **Newsletter** (Week 7)
   - [ ] Buttondown integration
   - [ ] Newsletter template
   - [ ] Subscription form

5. **Deploy** (Week 8)
   - [ ] Vercel deployment
   - [ ] VPS setup (Hostinger Mini)
   - [ ] Domain configuration

### Fase 2 (Post-MVP)

- [ ] ETF comparison tool
- [ ] Academia ETF (blog)
- [ ] LightRAG chatbot
- [ ] Portfolio tracking
- [ ] Community (Discord)

## 🤝 Brand Values

1. **💡 Conocimiento Democratizado** - Clear, accessible information for all
2. **👥 Comunidad** - Connect investors to learn together
3. **♿ Accesibilidad** - Intuitive, easy-to-use platform
4. **📈 Crecimiento** - Tools for smart investing

## 📚 Documentation

- [Design System](./design-system/MASTER.md)
- [README](./README.md)
- [Database Schema](./supabase/migrations/20260603000001_create_initial_schema.sql)
- [Stack Documentation](./.claude/skills/STACK.md)
- [Advanced Tools Guide](./.claude/skills/GUIA_MAESTRA_HERRAMIENTAS_AVANZADAS.md)

## ⚠️ Troubleshooting

### Dev server won't start

```bash
# Check if port is in use
lsof -ti:3000 | xargs kill -9

# Try a different port
PORT=3001 pnpm dev
```

### Database connection fails

```bash
# Check credentials
cat .env.local | grep SUPABASE

# Test connection
PGPASSWORD="GX7fzQvZSMszrjpk" psql \
  -h db.utvioubcqkwwzvufhups.supabase.co \
  -U postgres \
  -d postgres \
  -c "SELECT version();"
```

### Build errors

```bash
# Clear cache
rm -rf .next node_modules
pnpm install
pnpm dev
```

## 🎉 Ready to Build!

The ETF Nexo MVP foundation is complete. Start the dev server with `pnpm dev` and begin building components!

---

**Project**: ETF Nexo MVP  
**Version**: 0.1.0  
**Date**: Junio 2026  
**Stack**: Next.js 14 + Supabase + Tailwind CSS  
