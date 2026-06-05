# ETF Nexo - Quick Start Cheatsheet

## 🚀 Start Development

```bash
cd /home/suario/ruy
pnpm dev
```

Open: **http://localhost:5000** (configurado para evitar conflicto con puerto 3000)

## 🗄️ Setup Database (When Network Available)

```bash
./scripts/setup-database.sh
```

## ✅ Verify Setup

```bash
./scripts/verify-setup.sh
```

## 📝 Common Commands

```bash
# Development
pnpm dev          # Start dev server
pnpm build        # Build for production
pnpm start        # Start production server

# Code Quality
pnpm lint         # Run ESLint
pnpm type-check   # TypeScript check
```

## 🎨 Design System Quick Reference

### Colors

```tsx
// Primary
className="text-primary-blue"     // #235D87
className="bg-primary-teal"       // #5DABB8  
className="text-primary-orange"   // #F95602

// Backgrounds
className="bg-neutral-50"         // Cream #FAF9F6
className="bg-neutral-900"        // Dark text
```

### Typography

```tsx
className="heading-1"      // Large heading (3.5rem)
className="heading-2"      // Medium heading (2.5rem)
className="body-large"     // Large body (1.125rem)
className="body-base"      // Base body (1rem)
```

### Components

```tsx
className="btn-primary"    // Orange CTA button
className="btn-secondary"  // Blue outline button
className="card"           // White card with shadow
className="glass-card"     // Glassmorphism card
```

### Gradients

```tsx
className="bg-gradient-primary"    // Blue → Teal
className="bg-gradient-secondary"  // Teal → Orange
```

## 🔑 Supabase Usage

### Browser/Client Components

```tsx
'use client'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase
  .from('etfs')
  .select('*')
  .limit(10)
```

### Server Components

```tsx
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data, error } = await supabase
  .from('fund_managers')
  .select('*')
```

## 🛠️ Advanced Tools

### Claude-Mem

```bash
# Start worker (if not running)
npx claude-mem start

# UI
http://localhost:37777
```

### UI/UX Pro Max

Auto-activates on UI/design requests. Just ask!

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| `README.md` | Project overview |
| `SETUP.md` | Complete setup guide |
| `design-system/MASTER.md` | Design system reference |
| `.claude/skills/GUIA_MAESTRA_HERRAMIENTAS_AVANZADAS.md` | Advanced tools |

## 🐛 Troubleshooting

### Port already in use

```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 pnpm dev
```

### Database connection fails

```bash
# Check credentials
cat .env.local | grep SUPABASE

# Test connection
PGPASSWORD="GX7fzQvZSMszrjpk" psql \
  -h db.utvioubcqkwwzvufhups.supabase.co \
  -U postgres -d postgres -c "SELECT version();"
```

### Clear cache

```bash
rm -rf .next node_modules
pnpm install
```

## 📊 Database Schema

| Table | Purpose |
|-------|---------|
| `fund_managers` | ETF providers (iShares, Vanguard, etc.) |
| `etfs` | Main ETF catalog with metrics |
| `etf_price_history` | Daily price data for charts |
| `weekly_rankings` | Calculated rankings with scores |
| `newsletter_subscribers` | Email list |
| `affiliate_clicks` | Click tracking |

## 🎯 Next Steps

1. Apply database migration (`./scripts/setup-database.sh`)
2. Start building components (ETFCard, ScoreRing, PriceChart)
3. Create rankings page (`/rankings`)
4. Build ETF detail page (`/etfs/[isin]`)
5. Develop data pipeline (Python + Yahoo Finance)

---

**Quick Reference**: Keep this file open while developing!
