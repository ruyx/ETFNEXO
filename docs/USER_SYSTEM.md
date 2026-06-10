# Sistema de Usuarios - ETF Nexo

**Versión:** 1.0
**Fecha:** 2026-06-10
**Autor:** Sistema ETF Nexo

## Descripción General

Sistema completo de autenticación y gestión de usuarios integrado con Supabase Auth, incluyendo:
- Autenticación con email/password y OAuth (Google)
- Perfiles de usuario
- Sistema de valoraciones (ratings) y reviews de ETFs
- Watchlists personalizadas
- Row Level Security (RLS) para protección de datos

## Arquitectura

### Stack Tecnológico

- **Frontend:** Next.js 14 (App Router) + React 18
- **Backend:** Supabase Auth + PostgreSQL
- **Autenticación:** Supabase Auth (email, OAuth)
- **Base de Datos:** PostgreSQL 15 con RLS
- **Estilos:** CSS Modules
- **Estado:** React Hooks + Supabase Realtime

### Flujo de Autenticación

```
1. Usuario accede a /login o /signup
2. Introduce credenciales o usa Google OAuth
3. Supabase Auth valida y crea sesión
4. Middleware refresca sesión en cada request
5. RLS policies controlan acceso a datos
6. Trigger automático crea perfil en auth.users
```

## Base de Datos

### Tablas Principales

#### 1. `user_profiles`

Extiende `auth.users` con información adicional del usuario.

```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE,
  full_name VARCHAR(100),
  avatar_url TEXT,
  bio TEXT,
  preferred_currency VARCHAR(3) DEFAULT 'EUR',
  preferred_language VARCHAR(5) DEFAULT 'es',
  email_notifications BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Campos:**
- `id`: UUID del usuario (FK a auth.users)
- `username`: Nombre de usuario público (único, autogenerado desde email)
- `full_name`: Nombre completo del usuario
- `avatar_url`: URL de imagen de perfil
- `bio`: Biografía del usuario
- `preferred_currency`: Moneda preferida (EUR, USD, GBP)
- `preferred_language`: Idioma preferido (es, en)
- `email_notifications`: Preferencia de notificaciones por email
- `marketing_emails`: Preferencia de emails de marketing

**Índices:**
- `idx_user_profiles_username` en username

#### 2. `user_ratings`

Valoraciones y reviews de ETFs por usuarios.

```sql
CREATE TABLE user_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  etf_id UUID NOT NULL REFERENCES etfs(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_title VARCHAR(200),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, etf_id)
);
```

**Campos:**
- `rating`: Valoración de 1 a 5 estrellas (obligatorio)
- `review_title`: Título del review (opcional, max 200 chars)
- `review_text`: Texto del review (opcional, max 1000 chars)

**Restricciones:**
- Un usuario solo puede valorar un ETF una vez
- Rating debe estar entre 1 y 5

**Índices:**
- `idx_user_ratings_user` en user_id
- `idx_user_ratings_etf` en etf_id
- `idx_user_ratings_rating` en rating
- `idx_user_ratings_created` en created_at DESC

#### 3. `user_watchlists`

ETFs favoritos/seguidos por usuarios.

```sql
CREATE TABLE user_watchlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  etf_id UUID NOT NULL REFERENCES etfs(id) ON DELETE CASCADE,
  notes TEXT,
  added_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, etf_id)
);
```

**Campos:**
- `notes`: Notas privadas del usuario sobre el ETF (opcional)
- `added_at`: Timestamp de cuando se añadió el ETF

**Restricciones:**
- Un ETF solo puede estar una vez en la watchlist de un usuario

**Índices:**
- `idx_user_watchlists_user` en user_id
- `idx_user_watchlists_etf` en etf_id
- `idx_user_watchlists_added` en added_at DESC

### Vistas

#### `etf_ratings_summary`

Resumen agregado de ratings por ETF (usado para Community Score).

```sql
CREATE VIEW etf_ratings_summary AS
SELECT
  etf_id,
  COUNT(*) as total_ratings,
  AVG(rating) as average_rating,
  COUNT(*) FILTER (WHERE rating = 5) as five_stars,
  COUNT(*) FILTER (WHERE rating = 4) as four_stars,
  COUNT(*) FILTER (WHERE rating = 3) as three_stars,
  COUNT(*) FILTER (WHERE rating = 2) as two_stars,
  COUNT(*) FILTER (WHERE rating = 1) as one_star,
  MAX(created_at) as last_rating_at
FROM user_ratings
GROUP BY etf_id;
```

**Uso:** Obtener estadísticas de ratings de un ETF sin hacer agregaciones manuales.

**Ejemplo:**
```sql
SELECT * FROM etf_ratings_summary WHERE etf_id = '...';
-- {
--   total_ratings: 127,
--   average_rating: 4.3,
--   five_stars: 72,
--   four_stars: 35,
--   ...
-- }
```

## Seguridad (RLS Policies)

### `user_profiles`

| Acción | Policy | Regla |
|--------|--------|-------|
| SELECT | Profiles viewable by authenticated | `auth.uid()` IS NOT NULL |
| INSERT | Users create own profile | `auth.uid() = id` |
| UPDATE | Users update own profile | `auth.uid() = id` |
| DELETE | Users delete own profile | `auth.uid() = id` |

### `user_ratings`

| Acción | Policy | Regla |
|--------|--------|-------|
| SELECT | Ratings viewable by everyone | `true` (público) |
| INSERT | Authenticated users create | `auth.uid() = user_id` |
| UPDATE | Users update own ratings | `auth.uid() = user_id` |
| DELETE | Users delete own ratings | `auth.uid() = user_id` |

### `user_watchlists`

| Acción | Policy | Regla |
|--------|--------|-------|
| SELECT | Users view own watchlist | `auth.uid() = user_id` |
| INSERT | Users add to own watchlist | `auth.uid() = user_id` |
| UPDATE | Users update own watchlist | `auth.uid() = user_id` |
| DELETE | Users delete from own watchlist | `auth.uid() = user_id` |

## Triggers y Funciones

### 1. `handle_new_user()`

Crea automáticamente un perfil cuando se registra un nuevo usuario.

```sql
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
```

**Comportamiento:**
- Extrae `full_name` y `avatar_url` de `raw_user_meta_data`
- Genera `username` temporal basado en email (antes de @)
- Inserta registro en `user_profiles`

### 2. `update_etf_average_rating()`

Actualiza el campo `average_rating` del ETF automáticamente.

```sql
CREATE TRIGGER trigger_update_etf_rating
AFTER INSERT OR UPDATE OR DELETE ON user_ratings
FOR EACH ROW
EXECUTE FUNCTION update_etf_average_rating();
```

**Comportamiento:**
- Calcula promedio de ratings del ETF
- Actualiza `etfs.average_rating` (DECIMAL(3,2))
- Se ejecuta en INSERT, UPDATE y DELETE

## Rutas y Páginas

### Páginas de Autenticación

#### `/login` - Inicio de Sesión

**Features:**
- Login con email/password
- Login con Google OAuth
- Redirección a página solicitada después del login
- Enlace a recuperación de contraseña
- Enlace a registro

**Componentes:**
- `app/login/page.tsx` - Página principal
- `app/login/login.css` - Estilos compartidos con signup

**Flujo:**
```
1. Usuario introduce email/password
2. Llamada a supabase.auth.signInWithPassword()
3. Si éxito: redirect a redirectTo o /
4. Si error: mostrar mensaje de error
```

#### `/signup` - Registro

**Features:**
- Registro con email/password (requiere confirmación)
- Registro con Google OAuth
- Validación de contraseña (mínimo 6 caracteres)
- Mensaje de confirmación después del registro

**Flujo:**
```
1. Usuario introduce datos (nombre, email, password)
2. Llamada a supabase.auth.signUp()
3. Supabase envía email de confirmación
4. Mostrar mensaje de éxito
5. Usuario confirma email y puede hacer login
```

#### `/auth/callback` - OAuth Callback

**Propósito:** Manejar redirects de OAuth y confirmaciones de email.

**Implementación:**
```typescript
// app/auth/callback/route.ts
export async function GET(request: NextRequest) {
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/'

  if (code) {
    await supabase.auth.exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL(redirectTo, request.url))
}
```

### Páginas Protegidas

#### `/perfil` - Perfil de Usuario

**Requiere autenticación:** Sí (redirect a /login si no autenticado)

**Features:**
- Muestra información del perfil (avatar, nombre, email)
- Estadísticas (total de valoraciones, ETFs seguidos)
- Lista de valoraciones del usuario con enlaces a ETFs
- Lista de ETFs en watchlist con stats
- Botón de cerrar sesión

**Datos mostrados:**
- Valoraciones con título, texto y fecha
- ETFs en watchlist con TER, Retorno 1Y, Rating

**Server Component:** Sí (usa `createClient()` de server)

#### `/dashboard` - Panel de Usuario (futuro)

**Requiere autenticación:** Sí

**Futuras features:**
- Portfolio tracking
- Alertas personalizadas
- Recomendaciones basadas en watchlist

### Middleware

**Archivo:** `middleware.ts`

**Propósito:**
- Refrescar sesión de Supabase en cada request
- Proteger rutas autenticadas
- Redirigir usuarios logueados desde /login y /signup

**Rutas protegidas:**
```typescript
const protectedPaths = ['/dashboard', '/perfil', '/watchlist']
```

**Rutas de auth (no accesibles si ya logueado):**
```typescript
const authPaths = ['/login', '/signup']
```

**Configuración:**
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

## Componentes

### `ETFRating` Component

**Ubicación:** `components/ETFRating.tsx`

**Props:**
```typescript
interface ETFRatingProps {
  etfId: string              // UUID del ETF
  etfIsin: string            // ISIN para redirects
  initialAverageRating?: number | null
  initialRatingCount?: number
}
```

**Features:**
1. **Rating interactivo:**
   - 5 estrellas clickeables
   - Hover preview
   - Login redirect si no autenticado

2. **Review form:**
   - Título opcional (max 200 chars)
   - Texto opcional (max 1000 chars)
   - Botones Cancelar/Enviar

3. **Watchlist toggle:**
   - Botón "Seguir" / "En Mi Lista"
   - Actualización instantánea

4. **User rating display:**
   - Muestra rating existente del usuario
   - Botón "Editar" para modificar

**Uso:**
```tsx
import ETFRating from '@/components/ETFRating'

<ETFRating
  etfId={data.etf.id}
  etfIsin={data.etf.isin}
  initialAverageRating={data.ratings.average}
  initialRatingCount={data.ratings.count}
/>
```

## Integración con ETFNexo Score

### Community Score Component

El **Community Score** (20% del ETFNexo Score) se calcula a partir de `average_rating`:

**Fórmula:**
```typescript
community_score = ((average_rating - 1) / 4) × 100
```

**Ejemplo:**
- average_rating = 4.5 → community_score = 87.5
- average_rating = 3.0 → community_score = 50.0
- average_rating = 5.0 → community_score = 100.0
- average_rating = 1.0 → community_score = 0.0

**Actualización:**
- Automática vía trigger `update_etf_average_rating()`
- Se recalcula al INSERT/UPDATE/DELETE de ratings
- Community Score se recalcula automáticamente en `/api/v1/rankings`

## API Endpoints (Futuro)

### GET `/api/v1/users/me`
Obtener perfil del usuario actual.

**Response:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "user123",
  "full_name": "Juan Pérez",
  "avatar_url": "https://...",
  "stats": {
    "total_ratings": 15,
    "total_watchlist": 7,
    "average_rating_given": 4.2
  }
}
```

### GET `/api/v1/users/me/ratings`
Obtener todas las valoraciones del usuario.

### POST `/api/v1/users/me/ratings`
Crear/actualizar valoración de un ETF.

**Body:**
```json
{
  "etf_id": "uuid",
  "rating": 5,
  "review_title": "Excelente ETF",
  "review_text": "Muy buena relación riesgo-retorno..."
}
```

### GET `/api/v1/users/me/watchlist`
Obtener watchlist del usuario.

### POST `/api/v1/users/me/watchlist`
Añadir ETF a watchlist.

**Body:**
```json
{
  "etf_id": "uuid",
  "notes": "Para inversión a largo plazo"
}
```

## Configuración de Supabase Auth

### Variables de Entorno

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://utvioubcqkwwzvufhups.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Configuración en Supabase Dashboard

**Authentication > Providers:**

1. **Email:**
   - Enable Email provider: ✅
   - Confirm email: ✅ (recomendado)
   - Secure email change: ✅

2. **Google OAuth:**
   - Enable Google provider: ✅
   - Client ID: (de Google Cloud Console)
   - Client Secret: (de Google Cloud Console)
   - Redirect URLs:
     - `http://localhost:3000/auth/callback` (dev)
     - `https://etfnexo.vercel.app/auth/callback` (prod)

**URL Configuration:**

- Site URL: `https://etfnexo.vercel.app`
- Redirect URLs:
  - `http://localhost:3000/**`
  - `https://etfnexo.vercel.app/**`

## Testing

### Pruebas Manuales

**1. Registro de usuario:**
```
1. Ir a /signup
2. Introducir nombre, email, password
3. Verificar email de confirmación
4. Confirmar email
5. Login en /login
6. Verificar perfil creado en /perfil
```

**2. Google OAuth:**
```
1. Ir a /login
2. Click en "Continuar con Google"
3. Seleccionar cuenta de Google
4. Verificar redirect a homepage
5. Verificar perfil en /perfil
```

**3. Rating de ETF:**
```
1. Login como usuario
2. Ir a /etfs/IE00B4L5Y983 (o cualquier ISIN)
3. Añadir componente <ETFRating />
4. Click en estrella (ej: 4 estrellas)
5. Rellenar review form
6. Enviar valoración
7. Verificar aparece en BD y en /perfil
```

**4. Watchlist:**
```
1. Login como usuario
2. Ir a página de ETF
3. Click en "Seguir"
4. Verificar botón cambia a "En Mi Lista"
5. Ir a /perfil
6. Verificar ETF aparece en "Mis ETFs Seguidos"
```

### Queries de Verificación

**Verificar perfil creado:**
```sql
SELECT * FROM user_profiles WHERE id = '<user-uuid>';
```

**Verificar ratings:**
```sql
SELECT
  r.*,
  e.name as etf_name,
  e.average_rating
FROM user_ratings r
JOIN etfs e ON r.etf_id = e.id
WHERE r.user_id = '<user-uuid>';
```

**Verificar watchlist:**
```sql
SELECT
  w.*,
  e.name as etf_name
FROM user_watchlists w
JOIN etfs e ON w.etf_id = e.id
WHERE w.user_id = '<user-uuid>';
```

**Verificar Community Score actualizado:**
```sql
SELECT isin, name, average_rating FROM etfs WHERE average_rating IS NOT NULL;
```

## Troubleshooting

### Error: "User not authenticated"

**Causa:** Sesión expirada o no válida.

**Solución:**
```typescript
// Verificar sesión
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)

// Refrescar sesión
const { data: { user } } = await supabase.auth.getUser()
```

### Error: "Permission denied for schema auth"

**Causa:** RLS policies mal configuradas.

**Solución:**
```sql
-- Verificar policies
SELECT * FROM pg_policies WHERE tablename IN ('user_profiles', 'user_ratings', 'user_watchlists');

-- Re-aplicar migration
\i supabase/migrations/20260610000002_create_user_system.sql
```

### Error: "Foreign key violation on user_id"

**Causa:** Intentando insertar con user_id inexistente.

**Solución:**
```typescript
// Siempre obtener user_id de auth
const { data: { user } } = await supabase.auth.getUser()
if (!user) throw new Error('Not authenticated')

// Usar user.id para inserts
await supabase.from('user_ratings').insert({
  user_id: user.id, // ✅ Correcto
  etf_id: '...',
  rating: 5
})
```

## Mejoras Futuras

### v1.1 (Q3 2026)
- [ ] Edición de perfil (avatar, username, bio)
- [ ] Notas privadas en watchlist
- [ ] Exportar watchlist a CSV
- [ ] Notificaciones push (nuevos ETFs, cambios en watchlist)

### v1.2 (Q4 2026)
- [ ] Sistema de badges (reviewer experto, early adopter)
- [ ] Follow users (seguir a otros usuarios)
- [ ] Feeds personalizados
- [ ] Comparar watchlists entre usuarios

### v2.0 (2027)
- [ ] Portfolio tracking completo
- [ ] Alertas de precio/performance
- [ ] Recomendaciones AI basadas en watchlist
- [ ] Integración con brokers (Degiro, IBKR)

## Archivos del Sistema

```
supabase/migrations/
  └── 20260610000002_create_user_system.sql

middleware.ts

app/
  ├── login/
  │   ├── page.tsx
  │   └── login.css
  ├── signup/
  │   └── page.tsx
  ├── perfil/
  │   ├── page.tsx
  │   └── perfil.css
  └── auth/
      └── callback/
          └── route.ts

components/
  ├── ETFRating.tsx
  └── ETFRating.css

lib/supabase/
  ├── client.ts    # Browser client
  ├── server.ts    # Server client
  └── admin.ts     # Admin client (service_role)

docs/
  └── USER_SYSTEM.md
```

## Soporte

- **Documentación:** `/docs/USER_SYSTEM.md`
- **Migraciones:** `supabase/migrations/20260610000002_create_user_system.sql`
- **Supabase Dashboard:** https://supabase.com/dashboard/project/utvioubcqkwwzvufhups

---

**Última actualización:** 2026-06-10
**Versión:** 1.0.0
**Estado:** ✅ PRODUCTION READY
