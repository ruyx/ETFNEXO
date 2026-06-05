# ETF Nexo - Documentación del Proyecto

Plataforma de información y análisis de ETFs en español.

## Documentos Disponibles

### [Sistema de Noticias Automatizado](./NEWS_SYSTEM.md)
Sistema completo de publicación automática de noticias desde Google News y otras fuentes RSS.

**Estado:** ✅ **Producción - Funcionando**

**Características:**
- Scraping automático de Google News RSS
- 257 noticias importadas
- 20 noticias publicadas
- Edge Function en Supabase
- API endpoints completos
- Integración con frontend

## Estructura del Proyecto

```
├── app/                    # Next.js App Router
│   ├── api/v1/            # API Routes
│   │   ├── noticias/      # News endpoints
│   │   ├── etfs/          # ETF endpoints
│   │   ├── rankings/      # Rankings endpoints
│   │   └── gestoras/      # Fund managers endpoints
│   ├── page.tsx           # Homepage con noticias
│   ├── etfs/             # ETF detail pages
│   ├── gestoras/         # Fund managers pages
│   └── rankings/         # Rankings pages
├── components/            # React components
├── lib/                  # Utilities y helpers
├── supabase/
│   ├── migrations/       # Database migrations
│   └── functions/        # Edge Functions
│       └── fetch-news/   # News scraper
├── types/                # TypeScript types
└── docs/                 # Documentation
```

## Stack Tecnológico

- **Framework:** Next.js 14 (App Router)
- **Base de Datos:** Supabase (PostgreSQL)
- **Backend:** Supabase Edge Functions (Deno)
- **Frontend:** React + TypeScript
- **Deployment:** Vercel
- **Styling:** CSS Modules + Tailwind (próximamente)

## Enlaces Importantes

- **Producción:** https://etfnexo.vercel.app
- **Supabase Dashboard:** https://supabase.com/dashboard/project/utvioubcqkwwzvufhups
- **Vercel Dashboard:** https://vercel.com/etfnexo-s-projects/etfnexo

## Comandos Útiles

### Desarrollo
```bash
pnpm dev          # Servidor de desarrollo
pnpm build        # Build de producción
pnpm start        # Servidor de producción
```

### Base de Datos
```bash
supabase db push --linked                      # Aplicar migraciones
supabase gen types typescript --linked         # Generar tipos
supabase functions deploy fetch-news           # Desplegar Edge Function
```

### Deployment
```bash
vercel --prod     # Desplegar a producción
```

## Variables de Entorno

Copiar `.env.example` a `.env.local` y configurar:

```env
NEXT_PUBLIC_SUPABASE_URL=https://...supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

## Estado del Proyecto

### ✅ Completado
- [x] Sistema de noticias automatizado
- [x] Base de datos de ETFs (1000+ ETFs)
- [x] Rankings de ETFs
- [x] Páginas de gestoras
- [x] API endpoints completos
- [x] Frontend responsive
- [x] Deployment a producción

### 🚧 En Progreso
- [ ] Panel de administración para noticias
- [ ] Sistema de búsqueda avanzada
- [ ] Comparador de ETFs
- [ ] Calculadora de inversiones

### 📋 Pendiente
- [ ] Newsletter automático
- [ ] Notificaciones por email
- [ ] Sistema de favoritos (login)
- [ ] Gráficos interactivos
- [ ] Dark mode
- [ ] PWA (Progressive Web App)

## Contribuir

1. Crear rama feature: `git checkout -b feature/mi-feature`
2. Commit cambios: `git commit -m 'Add: mi feature'`
3. Push: `git push origin feature/mi-feature`
4. Crear Pull Request

## Soporte

Para dudas o problemas:
- Revisar [Documentación](./docs/)
- Revisar issues en GitHub
- Contactar al equipo de desarrollo

---

**Última actualización:** 2026-06-05
