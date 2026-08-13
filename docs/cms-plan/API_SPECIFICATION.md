# 🔌 API Specification - CMS Noticias ETF Nexo

**Versión**: 1.0
**Base URL**: `https://etfnexo.vercel.app/api/v1`

---

## 🔐 Autenticación

Todos los endpoints del CMS requieren autenticación con JWT de Supabase.

```http
Authorization: Bearer <SUPABASE_JWT_TOKEN>
```

### Obtener Token

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'redactor@etfnexo.com',
  password: 'secure_password'
});

const token = data.session?.access_token;
```

---

## 📝 Endpoints - Redactores Humanos

### 1. Listar Noticias

```http
GET /admin/noticias/list
```

**Query Parameters:**
- `status` (optional): `draft` | `published` | `archived`
- `category_id` (optional): UUID de categoría
- `search` (optional): Búsqueda full-text
- `limit` (optional): Número de resultados (default: 25)
- `offset` (optional): Offset para paginación (default: 0)
- `sort_by` (optional): `created_at` | `published_at` | `views_count` (default: `created_at`)
- `sort_order` (optional): `asc` | `desc` (default: `desc`)

**Response:**
```json
{
  "data": [
    {
      "id": "uuid-1234",
      "title": "Los mejores ETFs de 2026",
      "slug": "mejores-etfs-2026",
      "excerpt": "Análisis de los ETFs más prometedores...",
      "status": "published",
      "published_at": "2026-08-12T10:00:00Z",
      "views_count": 1234,
      "category": {
        "id": "cat-uuid",
        "name": "ETFs",
        "slug": "etfs"
      },
      "author_name": "Juan Pérez",
      "featured_image_url": "https://...",
      "created_at": "2026-08-10T15:30:00Z",
      "updated_at": "2026-08-12T09:00:00Z"
    }
  ],
  "count": 86,
  "limit": 25,
  "offset": 0
}
```

---

### 2. Obtener Noticia Individual

```http
GET /admin/noticias/:id
```

**Response:**
```json
{
  "id": "uuid-1234",
  "title": "Los mejores ETFs de 2026",
  "slug": "mejores-etfs-2026",
  "excerpt": "Análisis de los ETFs más prometedores para este año...",
  "content": "<h2>Introducción</h2><p>Los ETFs de energía...</p>",
  "status": "published",
  "published_at": "2026-08-12T10:00:00Z",
  "category_id": "cat-uuid",
  "category": {
    "id": "cat-uuid",
    "name": "ETFs",
    "slug": "etfs",
    "color_hex": "#3B82F6"
  },
  "author_name": "Juan Pérez",
  "author_email": "juan@etfnexo.com",
  "meta_title": "Los mejores ETFs de 2026 | ETF Nexo",
  "meta_description": "Descubre los ETFs más prometedores...",
  "featured_image_url": "https://...",
  "featured_image_alt": "Gráfico de rendimiento ETFs",
  "tags": [
    { "id": "tag-1", "name": "ETFs", "slug": "etfs" },
    { "id": "tag-2", "name": "2026", "slug": "2026" }
  ],
  "related_etfs": [
    {
      "isin": "IE00B4L5Y983",
      "ticker": "IWDA",
      "name": "iShares Core MSCI World"
    }
  ],
  "views_count": 1234,
  "shares_count": 45,
  "created_at": "2026-08-10T15:30:00Z",
  "updated_at": "2026-08-12T09:00:00Z"
}
```

---

### 3. Crear Noticia

```http
POST /admin/noticias/create
```

**Request Body:**
```json
{
  "title": "Análisis del iShares MSCI World",
  "excerpt": "Profundizamos en uno de los ETFs más populares...",
  "content": "<h2>Introducción</h2><p>El iShares MSCI World...</p>",
  "category_id": "cat-uuid",
  "featured_image_url": "https://...",
  "featured_image_alt": "Logo iShares",
  "meta_title": "Análisis del iShares MSCI World | ETF Nexo",
  "meta_description": "Análisis completo del ETF iShares MSCI World...",
  "tags": ["etf-uuid-1", "etf-uuid-2"],
  "related_etfs": ["IE00B4L5Y983"],
  "status": "draft"
}
```

**Response:**
```json
{
  "id": "new-uuid",
  "title": "Análisis del iShares MSCI World",
  "slug": "analisis-ishares-msci-world",
  "status": "draft",
  "created_at": "2026-08-12T12:00:00Z"
}
```

**Validaciones:**
- `title`: Obligatorio, 5-150 caracteres
- `excerpt`: Obligatorio, 50-300 caracteres
- `content`: Obligatorio, mínimo 500 caracteres
- `category_id`: Obligatorio, debe existir
- `slug`: Auto-generado desde título (único)

---

### 4. Actualizar Noticia

```http
PUT /admin/noticias/:id
```

**Request Body:** (Mismo schema que POST, todos los campos opcionales)

**Response:**
```json
{
  "id": "uuid-1234",
  "updated_at": "2026-08-12T12:30:00Z",
  "message": "Artículo actualizado exitosamente"
}
```

---

### 5. Publicar Noticia

```http
PUT /admin/noticias/:id/publish
```

**Request Body:**
```json
{
  "scheduled_for": "2026-08-15T10:00:00Z"  // Opcional
}
```

**Response:**
```json
{
  "id": "uuid-1234",
  "status": "published",
  "published_at": "2026-08-12T12:45:00Z",
  "message": "Artículo publicado exitosamente"
}
```

---

### 6. Despublicar Noticia (Borrador)

```http
PUT /admin/noticias/:id/draft
```

**Response:**
```json
{
  "id": "uuid-1234",
  "status": "draft",
  "published_at": null,
  "message": "Artículo despublicado"
}
```

---

### 7. Eliminar Noticia

```http
DELETE /admin/noticias/:id
```

**Response:**
```json
{
  "message": "Artículo eliminado exitosamente"
}
```

---

### 8. Subir Imagen

```http
POST /admin/noticias/upload
Content-Type: multipart/form-data
```

**Request:**
```
file: <imagen.jpg>
alt_text: "Descripción de la imagen"
```

**Response:**
```json
{
  "url": "https://utvioubcqkwwzvufhups.supabase.co/storage/v1/object/public/article-images/uuid-123.jpg",
  "alt_text": "Descripción de la imagen",
  "width": 1200,
  "height": 630,
  "size_bytes": 245678
}
```

**Validaciones:**
- Formatos permitidos: JPG, PNG, WebP
- Tamaño máximo: 5MB
- Resize automático a 1200x630 (OG image)

---

## 🤖 Endpoints - Redactores IA

### 1. Enviar Artículo Generado por IA

```http
POST /ai-writers/submit
```

**Request Headers:**
```http
Authorization: Bearer <API_KEY_REDACTOR_IA>
Content-Type: application/json
```

**Request Body:**
```json
{
  "ai_agent_name": "Agent 1: Analista de ETFs",
  "ai_model": "claude-sonnet-4.5",
  "title": "Análisis técnico: iShares MSCI Emerging Markets",
  "excerpt": "El ETF iShares MSCI EM ha mostrado una recuperación...",
  "content": "<h2>Análisis de Rendimiento</h2><p>En el último trimestre...</p>",
  "category_slug": "etfs",
  "featured_image_url": "https://...",
  "tags": ["emergentes", "ishares", "análisis-técnico"],
  "related_etf_tickers": ["EIMI", "IEMG"],
  "generation_prompt": "Analiza el rendimiento del ETF iShares MSCI EM...",
  "confidence_score": 0.92,
  "metadata": {
    "data_sources": ["Yahoo Finance", "iShares.com"],
    "generation_date": "2026-08-12T10:00:00Z"
  }
}
```

**Response:**
```json
{
  "article_id": "new-uuid",
  "status": "pending_review",
  "review_url": "https://etfnexo.vercel.app/admin/noticias?filter=ai_pending",
  "message": "Artículo recibido y en cola de revisión",
  "created_at": "2026-08-12T12:00:00Z"
}
```

**Validaciones:**
- `ai_agent_name`: Obligatorio
- `ai_model`: Obligatorio
- `title`: 10-150 caracteres
- `excerpt`: 100-300 caracteres
- `content`: Mínimo 1000 caracteres
- `confidence_score`: Float 0-1

---

### 2. Consultar Estado de Revisión

```http
GET /ai-writers/status/:article_id
```

**Response:**
```json
{
  "article_id": "uuid-1234",
  "status": "pending_review",
  "needs_review": true,
  "reviewed_by": null,
  "reviewed_at": null,
  "created_at": "2026-08-12T12:00:00Z"
}
```

**Posibles estados:**
- `pending_review`: En cola de revisión
- `approved`: Aprobado y publicado
- `edited`: Editado por humano antes de publicar
- `rejected`: Rechazado (no publicado)

---

## 📊 Endpoints - Analytics

### 1. Dashboard de Métricas

```http
GET /admin/analytics/dashboard
```

**Query Parameters:**
- `period` (optional): `7d` | `30d` | `90d` | `all` (default: `30d`)

**Response:**
```json
{
  "period": "30d",
  "summary": {
    "total_articles": 86,
    "total_views": 45678,
    "total_shares": 1234,
    "avg_views_per_article": 531
  },
  "top_articles": [
    {
      "id": "uuid-1",
      "title": "Los mejores ETFs de 2026",
      "views_count": 5432,
      "published_at": "2026-08-01T10:00:00Z"
    }
  ],
  "views_by_day": [
    { "date": "2026-08-01", "views": 1234 },
    { "date": "2026-08-02", "views": 1456 }
  ],
  "top_categories": [
    { "category": "ETFs", "articles_count": 45, "total_views": 23456 },
    { "category": "Gestoras", "articles_count": 20, "total_views": 12345 }
  ]
}
```

---

## 🔄 Endpoints - Utilidades

### 1. Listar Categorías

```http
GET /admin/categories
```

**Response:**
```json
{
  "data": [
    {
      "id": "cat-uuid-1",
      "name": "ETFs",
      "slug": "etfs",
      "color_hex": "#3B82F6",
      "display_order": 1
    }
  ]
}
```

---

### 2. Listar Tags

```http
GET /admin/tags?search=renovable
```

**Response:**
```json
{
  "data": [
    {
      "id": "tag-uuid-1",
      "name": "Energía Renovable",
      "slug": "energia-renovable",
      "usage_count": 15
    }
  ]
}
```

---

### 3. Buscar ETFs (Autocomplete)

```http
GET /admin/etfs/search?q=ishares
```

**Response:**
```json
{
  "data": [
    {
      "id": "etf-uuid-1",
      "isin": "IE00B4L5Y983",
      "ticker": "IWDA",
      "name": "iShares Core MSCI World"
    }
  ]
}
```

---

## ⚠️ Manejo de Errores

### Códigos de Estado HTTP
- `200 OK`: Éxito
- `201 Created`: Recurso creado
- `400 Bad Request`: Datos inválidos
- `401 Unauthorized`: No autenticado
- `403 Forbidden`: Sin permisos
- `404 Not Found`: Recurso no encontrado
- `422 Unprocessable Entity`: Validación fallida
- `500 Internal Server Error`: Error del servidor

### Formato de Error
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El título debe tener entre 5 y 150 caracteres",
    "details": {
      "field": "title",
      "value": "Hi",
      "constraint": "minLength: 5"
    }
  }
}
```

---

## 🔒 Rate Limiting

### Límites por Endpoint

**Redactores Humanos:**
- GET endpoints: 60 req/min
- POST/PUT/DELETE: 20 req/min

**Redactores IA:**
- POST /ai-writers/submit: 10 req/min
- GET /ai-writers/status: 30 req/min

### Headers de Rate Limit
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1723456789
```

---

## 📚 Recursos Adicionales

- **Postman Collection**: [Descargar](./postman_collection.json)
- **OpenAPI Spec**: [Descargar](./openapi.yaml)
- **Ejemplos de código**: [Ver carpeta `/examples`](./examples/)

---

**Última actualización**: 2026-08-12
**Versión API**: 1.0
