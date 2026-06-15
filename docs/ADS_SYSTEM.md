# Sistema de Publicidad - ETF Nexo

## 📋 Descripción General

Sistema completo de publicidad con tracking de impresiones y clics, diseñado específicamente para la audiencia de ETF Nexo (inversores sofisticados en ETFs).

## 🏗️ Arquitectura

### Base de Datos (PostgreSQL/Supabase)

```
advertisers (Anunciantes)
├── id (uuid)
├── name (texto)
├── email (texto)
├── website (texto)
├── status (enum: active, paused, inactive)
└── created_at (timestamp)

ads (Anuncios)
├── id (uuid)
├── advertiser_id (uuid → advertisers)
├── name (texto)
├── type (enum: image_banner, text_banner, script)
├── placement (enum: sidebar_top, sidebar_bottom, article_top, article_mid, article_bottom, feed_inline, header, footer)
├── status (enum: active, paused, inactive)
├── priority (integer 1-10)
├── max_impressions (integer, nullable)
├── max_clicks (integer, nullable)
├── start_date (date, nullable)
├── end_date (date, nullable)
│
├── Campos para image_banner:
│   ├── image_url (texto)
│   ├── image_alt (texto)
│   └── link_url (texto)
│
├── Campos para text_banner:
│   ├── title (texto)
│   ├── description (texto)
│   ├── cta_text (texto)
│   └── link_url (texto)
│
└── Campos para script:
    └── script_code (texto)

ad_impressions (Impresiones)
├── id (uuid)
├── ad_id (uuid → ads)
├── page_url (texto)
├── referrer (texto)
├── user_agent (texto)
├── ip_address (inet)
└── created_at (timestamp)

ad_clicks (Clics)
├── id (uuid)
├── ad_id (uuid → ads)
├── page_url (texto)
├── referrer (texto)
├── user_agent (texto)
├── ip_address (inet)
└── created_at (timestamp)
```

### API Endpoints

#### Públicos (Frontend)

```
GET /api/ads/active?placement={placement}&page_url={url}
  - Obtiene un ad activo para un placement específico
  - Lógica de selección: priority DESC, RANDOM()
  - Respeta max_impressions, max_clicks, start_date, end_date

POST /api/ads/impression
  Body: { ad_id, page_url }
  - Registra una impresión de anuncio

POST /api/ads/click
  Body: { ad_id, page_url }
  - Registra un clic en anuncio
```

#### Admin (Dashboard)

```
GET /api/admin/ads
  - Lista todos los ads con estadísticas

GET /api/admin/ads/{id}
  - Obtiene detalles de un ad específico

POST /api/admin/ads
  - Crea un nuevo ad

PATCH /api/admin/ads/{id}
  - Actualiza un ad existente

DELETE /api/admin/ads/{id}
  - Elimina un ad
```

### Componente Frontend

```tsx
<AdSlot placement="article_top" />
```

**Props:**
- `placement`: 'sidebar_top' | 'sidebar_bottom' | 'article_top' | 'article_mid' | 'article_bottom' | 'feed_inline' | 'header' | 'footer'
- `className`: (opcional) clases CSS adicionales

**Comportamiento:**
- Fetch automático del ad al montar
- Tracking automático de impresión
- Tracking automático de clics
- Renderiza según el tipo: image_banner, text_banner, script
- No muestra nada si no hay ad disponible

## 📍 Placements Implementados

### Homepage
- `feed_inline` - Después de la sección de rankings
- `feed_inline` - Después del 3er artículo en la grid de noticias

### Página de Noticia (article detail)
- `article_top` - Después del excerpt, antes del contenido
- `article_bottom` - Después del contenido, antes de tags/related

### ETFs Page
- (Pendiente de implementar)

## 🎨 Estilos

Los ads heredan el design system de la web:
- Variables CSS de `/app/styles/base/variables.css`
- Estilos en `/app/styles/components/ads.css`
- Consistencia con cards, botones y tipografía existentes

**Features de diseño:**
- Label "Publicidad" en esquina superior derecha
- Hover effects y transiciones
- Responsive design (mobile-first)
- Accesibilidad (keyboard navigation, ARIA roles)
- Loading states (shimmer effect)

## 📊 Cómo Insertar Ads Manualmente (Supabase Dashboard)

### 1. Crear Advertiser

Ir a Supabase → Table Editor → `advertisers` → Insert Row:

```json
{
  "name": "BlackRock",
  "email": "ads@blackrock.com",
  "website": "https://www.blackrock.com/es",
  "status": "active"
}
```

### 2. Crear Ad - Text Banner

Ir a Supabase → Table Editor → `ads` → Insert Row:

```json
{
  "advertiser_id": "uuid-del-advertiser-creado",
  "name": "Vanguard - Comisiones Bajas",
  "type": "text_banner",
  "placement": "sidebar_bottom",
  "status": "active",
  "priority": 9,
  "title": "Vanguard ETFs",
  "description": "Comisiones bajas, rendimientos sólidos. Invierte en fondos indexados con Vanguard.",
  "cta_text": "Descubre más",
  "link_url": "https://www.vanguard.es",
  "target": "_blank"
}
```

### 3. Crear Ad - Image Banner

```json
{
  "advertiser_id": "uuid-del-advertiser-creado",
  "name": "BlackRock iShares - Banner Principal",
  "type": "image_banner",
  "placement": "sidebar_top",
  "status": "active",
  "priority": 10,
  "image_url": "https://placehold.co/300x250/3B82F6/FFFFFF?text=BlackRock+iShares",
  "image_alt": "BlackRock iShares - Invierte con confianza",
  "link_url": "https://www.blackrock.com/es/productos/239726/",
  "target": "_blank"
}
```

### 4. Crear Ad con Límites y Fechas

```json
{
  "advertiser_id": "uuid-del-advertiser-creado",
  "name": "Interactive Brokers - Campaña Q4",
  "type": "text_banner",
  "placement": "article_top",
  "status": "active",
  "priority": 8,
  "max_impressions": 10000,
  "max_clicks": 500,
  "start_date": "2026-06-15",
  "end_date": "2026-12-31",
  "title": "Trading de ETFs sin comisiones",
  "description": "Accede a más de 7,000 ETFs sin comisiones de trading.",
  "cta_text": "Abrir cuenta",
  "link_url": "https://www.interactivebrokers.com",
  "target": "_blank"
}
```

## 🎯 Ejemplos de Advertisers Objetivo

Basados en el target de ETF Nexo (inversores en ETFs):

1. **Gestoras de ETFs**
   - BlackRock (iShares)
   - Vanguard
   - State Street (SPDR)
   - Amundi
   - Invesco

2. **Brokers**
   - Interactive Brokers
   - DeGiro
   - Trading 212
   - Scalable Capital
   - XTB

3. **Proveedores de Datos**
   - MSCI
   - FTSE Russell
   - Bloomberg
   - Morningstar

4. **Plataformas Financieras**
   - Roboadvisors (Indexa Capital, inbestMe)
   - Trading platforms
   - Research tools

## 📈 Monitoreo y Analytics

### Ver Estadísticas de un Ad

```sql
-- Impresiones totales
SELECT COUNT(*)
FROM ad_impressions
WHERE ad_id = 'uuid-del-ad';

-- Clics totales
SELECT COUNT(*)
FROM ad_clicks
WHERE ad_id = 'uuid-del-ad';

-- CTR (Click-Through Rate)
SELECT
  a.name,
  COUNT(DISTINCT i.id) as impressions,
  COUNT(DISTINCT c.id) as clicks,
  ROUND(
    (COUNT(DISTINCT c.id)::numeric / NULLIF(COUNT(DISTINCT i.id), 0)) * 100,
    2
  ) as ctr_percentage
FROM ads a
LEFT JOIN ad_impressions i ON a.id = i.ad_id
LEFT JOIN ad_clicks c ON a.id = c.ad_id
WHERE a.id = 'uuid-del-ad'
GROUP BY a.id, a.name;

-- Performance por placement
SELECT
  a.placement,
  COUNT(DISTINCT i.id) as impressions,
  COUNT(DISTINCT c.id) as clicks
FROM ads a
LEFT JOIN ad_impressions i ON a.id = i.ad_id
LEFT JOIN ad_clicks c ON a.id = c.ad_id
GROUP BY a.placement
ORDER BY impressions DESC;
```

### Dashboard de Ads (Futuro)

Pendiente de implementar:
- Panel de admin en `/admin/ads`
- Gráficos de impresiones/clics por día
- CTR por ad, placement, advertiser
- Top performing ads
- Revenue tracking (si se implementa billing)

## 🔒 Seguridad y Privacidad

- **RLS (Row Level Security)**: Habilitado en todas las tablas
- **IP tracking**: Solo para analytics, no se expone públicamente
- **GDPR**: Los datos de tracking son anónimos (no vinculados a usuarios)
- **Script ads**: Usar con precaución, validar código de terceros

## 🚀 Próximos Pasos

1. **Admin Dashboard**: UI para gestionar ads sin Supabase Dashboard
2. **Targeting avanzado**: Por categoría de artículo, URL patterns, geolocalización
3. **A/B Testing**: Variantes de ads para optimizar CTR
4. **Frequency capping**: Limitar impresiones por usuario
5. **Revenue tracking**: Vincular con sistema de billing
6. **Reporting automatizado**: Emails semanales a advertisers

## 📝 Notas Técnicas

- El componente `AdSlot` es **client-side** ('use client')
- El fetch de ads incluye `page_url` para analytics
- El tracking de impresiones se hace **automáticamente al renderizar**
- El tracking de clics se hace **antes de navegar** (sin bloqueo)
- Los ads se seleccionan por `priority DESC, RANDOM()`
- Si no hay ad disponible, el componente **no renderiza nada** (UX limpia)

## 🐛 Troubleshooting

### El ad no se muestra
1. Verificar que el `status` del ad sea `active`
2. Verificar que el `status` del advertiser sea `active`
3. Verificar que el `placement` coincida con el usado en `<AdSlot>`
4. Verificar que no haya excedido `max_impressions` o `max_clicks`
5. Verificar que esté dentro del rango de `start_date` y `end_date`
6. Check browser console para errores de fetch

### El tracking no funciona
1. Verificar que las tablas `ad_impressions` y `ad_clicks` existan
2. Verificar permisos RLS (deben permitir INSERT para anon/authenticated)
3. Check Network tab en browser devtools
4. Verificar que `/api/ads/impression` y `/api/ads/click` respondan 201

### Problemas de diseño
1. Verificar que `/app/styles/components/ads.css` esté cargado
2. Verificar que las variables CSS existan en `variables.css`
3. Usar browser devtools para inspeccionar clases aplicadas
4. Verificar responsive breakpoints en mobile

---

**Última actualización**: 2026-06-15
**Versión**: 1.0
**Autor**: ETF Nexo Team
