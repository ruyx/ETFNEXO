# Sistema de Publicidad (Ads) - ETF Nexo

## 📋 Descripción

Sistema completo de gestión de anuncios con tracking de impresiones y clics para monetizar el sitio ETF Nexo.

## 🗄️ Estructura de Base de Datos

### Tablas Principales

1. **advertisers** - Gestión de anunciantes
   - Información de contacto
   - Estado (active, inactive, suspended)

2. **ads** - Anuncios
   - Tipos: `image_banner`, `text_banner`, `script`
   - Ubicaciones: sidebar_top, sidebar_bottom, article_top, article_mid, article_bottom, feed_inline, header, footer
   - Control de límites (max_impressions, max_clicks)
   - Programación temporal (start_date, end_date)
   - Segmentación por páginas/categorías

3. **ad_impressions** - Registro de impresiones
   - Tracking de cuándo se muestra un anuncio
   - Información de contexto (URL, referrer, user-agent, IP)

4. **ad_clicks** - Registro de clics
   - Tracking de cuándo se hace clic en un anuncio
   - Relacionado con la impresión que lo generó

### Vista

- **ad_stats** - Estadísticas agregadas por anuncio (impresiones, clics, CTR)

### Funciones Automáticas

- Auto-incremento de contadores (impressions_count, clicks_count)
- Auto-pausado cuando se alcanzan límites
- Actualización automática de `updated_at`

## 🚀 Aplicar Migración

### Opción 1: Supabase CLI (Recomendado)

```bash
# Si no tienes Supabase CLI instalado:
npm install -g supabase

# Aplicar migración
supabase db push
```

### Opción 2: Manual (Supabase Dashboard)

1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Ve a "SQL Editor"
4. Copia y pega el contenido de `20260615_ads_system.sql`
5. Ejecuta la migración

### Opción 3: Script node (usado en desarrollo)

```bash
npx tsx scripts/apply-ads-migration.ts
```

## 📊 Tipos de Anuncios

### 1. Image Banner
Banner de imagen estático con enlace

```typescript
{
  type: 'image_banner',
  image_url: 'https://...',
  image_alt: 'Descripción',
  link_url: 'https://...',
  size: '300x250'
}
```

### 2. Text Banner
Anuncio basado en texto

```typescript
{
  type: 'text_banner',
  title: 'Título del anuncio',
  description: 'Descripción más larga...',
  cta_text: 'Más información',
  link_url: 'https://...'
}
```

### 3. Script
Scripts de terceros (Google AdSense, etc)

```typescript
{
  type: 'script',
  script_code: '<script async src="..."></script>'
}
```

## 📍 Ubicaciones (Placements)

- `sidebar_top` - Parte superior de la sidebar
- `sidebar_bottom` - Parte inferior de la sidebar
- `article_top` - Antes del contenido del artículo
- `article_mid` - En medio del artículo
- `article_bottom` - Después del artículo
- `feed_inline` - Entre noticias en el feed
- `header` - Banner en header
- `footer` - Banner en footer

## 🔒 Políticas de Seguridad (RLS)

- **Público**: Puede ver anuncios activos y registrar impresiones/clics
- **Admins**: Control total sobre advertisers, ads y visualización de estadísticas

## 📈 Métricas

La vista `ad_stats` proporciona:
- Total de impresiones
- Total de clics
- CTR (Click-Through Rate) en porcentaje
- Progreso hacia límites (si están configurados)

## 🎯 Ejemplo de Uso

### Crear un Anunciante

```sql
INSERT INTO advertisers (name, email, website, status)
VALUES ('Acme Corp', 'contact@acme.com', 'https://acme.com', 'active');
```

### Crear un Anuncio

```sql
INSERT INTO ads (
  advertiser_id,
  name,
  type,
  image_url,
  link_url,
  placement,
  size,
  priority,
  status
) VALUES (
  '<advertiser_id>',
  'Banner Sidebar Superior',
  'image_banner',
  'https://acme.com/banner.jpg',
  'https://acme.com/landing',
  'sidebar_top',
  '300x250',
  10,
  'active'
);
```

### Ver Estadísticas

```sql
SELECT * FROM ad_stats WHERE status = 'active';
```

## 🔄 Flujo de Tracking

1. **Impresión**: Cuando el componente AdSlot monta, registra una impresión
2. **Clic**: Cuando el usuario hace clic, registra el clic antes de redirigir
3. **Auto-actualización**: Los triggers actualizan los contadores automáticamente
4. **Auto-pausado**: Si se alcanza max_impressions o max_clicks, el anuncio pasa a 'ended'

## ⚠️ Consideraciones

1. **Performance**: Las tablas de impresiones/clics pueden crecer rápidamente
   - Considera implementar particionado por fecha
   - Implementa archivado de datos antiguos

2. **Privacy**: El sistema guarda IPs y user-agents
   - Asegúrate de cumplir con GDPR/LOPD
   - Considera anonimizar IPs después de X días

3. **Fraud Prevention**: Implementa límites de rate-limiting
   - No permitir múltiples clics desde la misma IP en corto tiempo
   - Detectar patrones sospechosos

## 🚧 TODOs Futuros

- [ ] Implementar A/B testing de anuncios
- [ ] Dashboard de estadísticas en tiempo real
- [ ] Reportes exportables (PDF, CSV)
- [ ] Sistema de facturación automática
- [ ] Integración con Google Analytics
- [ ] Bloqueo geográfico (mostrar anuncios solo en ciertas regiones)
