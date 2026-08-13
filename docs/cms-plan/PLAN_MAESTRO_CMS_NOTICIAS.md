# 📰 Plan Maestro - CMS de Noticias ETF Nexo

**Fecha**: 2026-08-12
**Objetivo**: Sistema CMS completo para gestión de noticias con soporte para redactores humanos y redactores IA

---

## 🎯 Objetivos del Proyecto

### Corto Plazo (Semanas 1-3)
1. ✅ **CMS funcional para redactores humanos** - Panel admin para crear/editar/publicar noticias
2. ✅ **API REST completa** - Endpoints para CRUD de noticias (humanos + IA)
3. ✅ **Sistema de autenticación** - Login seguro solo para redactores autorizados

### Mediano Plazo (Semanas 4-6)
4. ✅ **Integración redactores IA** - API endpoints listos para consumo automático
5. ✅ **Sistema de revisión** - Workflow de aprobación para contenido IA
6. ✅ **Editor WYSIWYG** - Editor visual tipo Medium/Notion

### Largo Plazo (Semanas 7-8)
7. ✅ **SEO avanzado** - Meta tags automáticas, sugerencias, preview
8. ✅ **Analytics dashboard** - Métricas de noticias más leídas, engagement
9. ✅ **Programación de publicaciones** - Publicar en fecha/hora específica

---

## 🏗️ Arquitectura del Sistema

### Stack Tecnológico
- **Frontend Admin**: Next.js 14 + TailwindCSS (misma base que el proyecto)
- **Backend API**: Next.js API Routes (ya existente, extender)
- **Base de Datos**: Supabase PostgreSQL (ya configurado)
- **Autenticación**: Supabase Auth con Row Level Security (RLS)
- **Editor**: TipTap (WYSIWYG Markdown editor)
- **Storage**: Supabase Storage para imágenes

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND PÚBLICO                          │
│  (Ya existe - app/noticias/[slug]/page.tsx)                 │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    API REST (Backend)                        │
│  /api/v1/admin/noticias                                     │
│    - POST   /create      (Crear noticia)                    │
│    - GET    /list        (Listar todas)                     │
│    - GET    /:id         (Ver una)                          │
│    - PUT    /:id         (Actualizar)                       │
│    - DELETE /:id         (Borrar)                           │
│    - PUT    /:id/publish (Publicar)                         │
│    - PUT    /:id/draft   (Despublicar)                      │
│    - POST   /upload      (Subir imagen)                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│              PANEL ADMIN (Nuevo - /admin)                    │
│                                                              │
│  /admin/noticias                                            │
│    - Lista de noticias (tabla con filtros)                  │
│    - Crear nueva noticia (formulario + editor)              │
│    - Editar noticia (formulario + editor)                   │
│    - Previsualización en vivo                               │
│    - Gestión de categorías y tags                           │
│    - Gestión de ETFs relacionados                           │
│    - Upload de imágenes                                     │
│                                                              │
│  /admin/analytics                                           │
│    - Dashboard de métricas (views, shares, etc.)            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│         REDACTORES IA (Futuros - API consumers)             │
│                                                              │
│  Agent 1: Analista de ETFs                                  │
│    - Genera análisis técnicos de ETFs                       │
│    - Consume: POST /api/v1/admin/noticias/create            │
│                                                              │
│  Agent 2: Resumen Semanal                                   │
│    - Genera resúmenes de mercado                            │
│    - Consume: POST /api/v1/admin/noticias/create            │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Estructura de Datos

### Tabla: `news_articles` (Ya existente)

Campos principales que usaremos:

```sql
-- Contenido
title TEXT NOT NULL                  -- Título del artículo
slug TEXT UNIQUE NOT NULL             -- URL slug (auto-generado)
excerpt TEXT                          -- Resumen corto (150-200 chars)
content TEXT NOT NULL                 -- Contenido HTML/Markdown

-- Metadata
category_id UUID                      -- Categoría (ETFs, Gestoras, etc.)
author_name TEXT                      -- Nombre del redactor
author_email TEXT                     -- Email del redactor

-- SEO
meta_title TEXT                       -- Meta título (60 chars)
meta_description TEXT                 -- Meta descripción (160 chars)
featured_image_url TEXT               -- URL imagen destacada
featured_image_alt TEXT               -- Alt text imagen

-- Source tracking
source_name TEXT                      -- 'Redacción ETF Nexo' o 'IA Agent 1'
source_url TEXT                       -- NULL para noticias propias

-- Publishing
status TEXT                           -- 'draft', 'published', 'archived'
published_at TIMESTAMPTZ              -- Fecha publicación

-- Analytics
views_count INTEGER DEFAULT 0         -- Vistas
shares_count INTEGER DEFAULT 0        -- Compartidos
```

### Nuevas Tablas a Crear

```sql
-- TABLA: article_revisions (Historial de cambios)
CREATE TABLE article_revisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
  content_snapshot JSONB NOT NULL,      -- Snapshot completo del artículo
  editor_email TEXT,                     -- Quién hizo el cambio
  change_type TEXT,                      -- 'created', 'updated', 'published'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA: ai_generated_content (Tracking de contenido IA)
CREATE TABLE ai_generated_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
  ai_agent_name TEXT NOT NULL,           -- 'Agent 1: Analista ETFs'
  ai_model TEXT,                          -- 'claude-sonnet-4' o 'gpt-4'
  generation_prompt TEXT,                 -- Prompt usado
  confidence_score FLOAT,                 -- 0-1 confianza del agente
  needs_review BOOLEAN DEFAULT true,      -- Requiere revisión humana
  reviewed_by TEXT,                       -- Email del revisor
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TABLA: scheduled_publications (Publicaciones programadas)
CREATE TABLE scheduled_publications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID REFERENCES news_articles(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🎨 Diseño del Panel Admin

### Pantalla 1: Lista de Noticias (`/admin/noticias`)

```
┌────────────────────────────────────────────────────────────────┐
│ ETF Nexo Admin                                    [Logout]     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  📰 Noticias                                [+ Nueva Noticia] │
│                                                                │
│  Filtros:                                                      │
│  [Todas ▼] [Categoría ▼] [Estado ▼] [🔍 Buscar...]          │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Título                    │ Estado    │ Vistas │ Fecha   │ │
│  ├──────────────────────────────────────────────────────────┤ │
│  │ ✏️ Los mejores ETFs 2026  │ 🟢 Publicado │ 1,234  │ Hoy   │ │
│  │ ✏️ Análisis iShares MSCI  │ 🟡 Borrador  │ 0      │ Ayer  │ │
│  │ ✏️ Guía para principiantes│ 🟢 Publicado │ 456    │ 10/08 │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  Mostrando 1-10 de 86 noticias                    [1][2][3]  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Pantalla 2: Crear/Editar Noticia (`/admin/noticias/nueva`)

```
┌────────────────────────────────────────────────────────────────┐
│ ← Volver a Noticias                       [👁️ Preview] [💾 Guardar Borrador] [🚀 Publicar]
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Título *                                                      │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Los mejores ETFs de energía renovable para 2026          ││
│  └────────────────────────────────────────────────────────────┘│
│  URL: /noticias/mejores-etfs-energia-renovable-2026           │
│                                                                │
│  Resumen (Excerpt) *                                           │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ Análisis de los ETFs más prometedores del sector...      ││
│  └────────────────────────────────────────────────────────────┘│
│  150/200 caracteres                                            │
│                                                                │
│  Imagen Destacada                                              │
│  ┌──────────────┐                                              │
│  │  [📤 Upload] │  O ingresa URL: [________________]          │
│  └──────────────┘                                              │
│                                                                │
│  Categoría *         Autor                                     │
│  [ETFs ▼]           [Juan Pérez              ]                │
│                                                                │
│  ┌────────────────────────────────────────────────────────────┐│
│  │ EDITOR WYSIWYG (TipTap)                                   ││
│  │                                                            ││
│  │ [B] [I] [U] [H1] [H2] [Lista] [Link] [Imagen]            ││
│  │ ────────────────────────────────────────────────────────  ││
│  │                                                            ││
│  │ ## Introducción                                            ││
│  │                                                            ││
│  │ Los ETFs de energía renovable han experimentado un        ││
│  │ crecimiento sostenido en los últimos años...              ││
│  │                                                            ││
│  └────────────────────────────────────────────────────────────┘│
│                                                                │
│  Tags                                                          │
│  [ETFs] [Energía Renovable] [2026] [+ Agregar tag]           │
│                                                                │
│  ETFs Relacionados                                             │
│  [🔍 Buscar ETF por ticker/ISIN...]                           │
│  • iShares Clean Energy (ICLN)        [x]                     │
│  • Invesco Solar ETF (TAN)            [x]                     │
│                                                                │
│  ────────────────────────────────────────────────────────────  │
│                                                                │
│  SEO Avanzado (Opcional)                                       │
│  Meta Título                                                   │
│  [Los mejores ETFs de energía renovable 2026 | ETF Nexo]     │
│  55/60 caracteres                                              │
│                                                                │
│  Meta Descripción                                              │
│  [Descubre los ETFs más prometedores del sector renovable...]│
│  140/160 caracteres                                            │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Autenticación y Permisos

### Roles de Usuario

1. **Admin**: Acceso completo (crear, editar, publicar, borrar)
2. **Redactor**: Crear y editar (requiere aprobación para publicar)
3. **Revisor IA**: Solo revisar contenido generado por IA

### Implementación con Supabase Auth

```typescript
// Tipos de usuarios en Supabase
enum UserRole {
  ADMIN = 'admin',
  REDACTOR = 'redactor',
  REVISOR_IA = 'revisor_ia'
}

// RLS Policy - Solo usuarios autenticados pueden escribir
CREATE POLICY "Authenticated users can insert articles"
ON news_articles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.email() IS NOT NULL
);

// RLS Policy - Solo admins pueden publicar
CREATE POLICY "Only admins can publish"
ON news_articles
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (status = 'published');
```

---

## 📋 Plan de Trabajo por Fases

### **FASE 1: Backend API** (Semana 1)
**Duración estimada**: 3-4 días

#### Tareas:
- [ ] **1.1** Crear migraciones Supabase para nuevas tablas
  - `article_revisions`
  - `ai_generated_content`
  - `scheduled_publications`
  - `user_profiles` (roles de usuarios)

- [ ] **1.2** Implementar API Routes en Next.js
  ```
  app/api/v1/admin/noticias/
    ├── create/route.ts        (POST - Crear noticia)
    ├── list/route.ts          (GET - Listar con filtros)
    ├── [id]/route.ts          (GET/PUT/DELETE - CRUD individual)
    ├── [id]/publish/route.ts  (PUT - Publicar)
    ├── upload/route.ts        (POST - Upload imagen)
  ```

- [ ] **1.3** Middleware de autenticación
  - Verificar JWT de Supabase
  - Validar roles (admin, redactor, revisor)
  - Rate limiting para prevenir abuso

- [ ] **1.4** Testing de API con Postman/Thunder Client
  - Crear collection de endpoints
  - Probar CRUD completo
  - Validar autenticación

**Entregable**: API funcional y documentada

---

### **FASE 2: Panel Admin - Lista de Noticias** (Semana 2)
**Duración estimada**: 3-4 días

#### Tareas:
- [ ] **2.1** Crear layout del admin panel
  ```
  app/admin/
    ├── layout.tsx           (Layout con sidebar + header)
    ├── page.tsx            (Dashboard principal)
    └── noticias/
        ├── page.tsx        (Lista de noticias)
  ```

- [ ] **2.2** Implementar componente de tabla de noticias
  - Columnas: Título, Estado, Vistas, Fecha, Acciones
  - Filtros: Estado, Categoría, Búsqueda
  - Paginación (10, 25, 50 por página)
  - Sorting por columnas

- [ ] **2.3** Sistema de autenticación frontend
  - Proteger ruta `/admin` con middleware
  - Redirect a `/login` si no autenticado
  - Logout funcionando

- [ ] **2.4** Acciones rápidas en tabla
  - Botón "Editar" (va a /admin/noticias/[id]/editar)
  - Botón "Publicar/Despublicar" (toggle directo)
  - Botón "Borrar" (con confirmación)
  - Botón "Preview" (abre en nueva pestaña)

**Entregable**: Lista de noticias funcional con acciones básicas

---

### **FASE 3: Panel Admin - Editor de Noticias** (Semana 2-3)
**Duración estimada**: 4-5 días

#### Tareas:
- [ ] **3.1** Instalar y configurar TipTap Editor
  ```bash
  pnpm add @tiptap/react @tiptap/starter-kit @tiptap/extension-image
  pnpm add @tiptap/extension-link @tiptap/extension-heading
  ```

- [ ] **3.2** Crear formulario de creación/edición
  ```
  app/admin/noticias/
    ├── nueva/page.tsx          (Formulario crear)
    └── [id]/editar/page.tsx    (Formulario editar)
  ```

- [ ] **3.3** Componentes del formulario
  - Input Título (con auto-generación de slug)
  - Textarea Resumen (con contador de caracteres)
  - Select Categoría (desde `news_categories`)
  - Input Autor (autocompletado desde perfil)
  - Editor TipTap (WYSIWYG completo)
  - Upload de imagen destacada
  - Multi-select Tags
  - Autocomplete ETFs relacionados

- [ ] **3.4** Sistema de auto-guardado
  - Guardar borrador cada 30 segundos
  - Indicador de "Guardando..." / "Guardado"
  - Recuperar borrador si se cierra sin guardar

- [ ] **3.5** Previsualización en vivo
  - Modal/Sidebar con preview del artículo
  - Usar mismo componente que frontend público
  - Actualizar en tiempo real mientras editas

**Entregable**: Editor completo y funcional

---

### **FASE 4: SEO y Mejoras** (Semana 3)
**Duración estimada**: 2-3 días

#### Tareas:
- [ ] **4.1** SEO Automático
  - Auto-generar meta título desde título (límite 60 chars)
  - Auto-generar meta descripción desde excerpt (límite 160 chars)
  - Sugerencias de mejora (títulos llamativos, keywords)
  - Preview de Google Search Results

- [ ] **4.2** Upload de imágenes a Supabase Storage
  - Crear bucket `article-images`
  - Resize automático (1200x630 para OG image)
  - Compresión con Sharp
  - Generar URL pública automáticamente

- [ ] **4.3** Validaciones del formulario
  - Título obligatorio (5-100 chars)
  - Excerpt obligatorio (50-200 chars)
  - Categoría obligatoria
  - Imagen destacada recomendada (warning si falta)
  - Al menos 500 palabras en contenido (warning si menos)

**Entregable**: Editor con SEO optimizado

---

### **FASE 5: Integración Redactores IA** (Semana 4)
**Duración estimada**: 3-4 días

#### Tareas:
- [ ] **5.1** API específica para redactores IA
  ```
  app/api/v1/ai-writers/
    ├── submit/route.ts         (POST - Enviar artículo IA)
    ├── status/[id]/route.ts    (GET - Estado de revisión)
  ```

- [ ] **5.2** Workflow de revisión de contenido IA
  - Artículos IA entran como `status: 'pending_review'`
  - Dashboard especial en `/admin/noticias?filter=ai_pending`
  - Botones: "Aprobar y publicar" / "Editar antes de publicar" / "Rechazar"

- [ ] **5.3** Sistema de tracking de IA
  - Guardar metadata en `ai_generated_content`
  - Mostrar badge "🤖 Generado por IA" en lista admin
  - Analytics separados para contenido IA vs humano

- [ ] **5.4** Documentación para redactores IA
  - Crear `docs/AI_WRITERS_API.md`
  - Ejemplos de peticiones con curl
  - Schema JSON de respuesta
  - Errores comunes y soluciones

**Entregable**: API lista para redactores IA + workflow de revisión

---

### **FASE 6: Analytics y Dashboard** (Semana 5)
**Duración estimada**: 3 días

#### Tareas:
- [ ] **6.1** Dashboard de métricas
  ```
  app/admin/analytics/page.tsx
  ```

- [ ] **6.2** Métricas a mostrar
  - Noticias más leídas (top 10)
  - Noticias recientes (últimas 7 días)
  - Total de vistas este mes vs mes anterior
  - Categorías más populares
  - Gráfico de vistas diarias (línea de tiempo)

- [ ] **6.3** Incrementar contador de vistas
  - Crear API `/api/v1/noticias/[slug]/view`
  - Llamar desde página pública `app/noticias/[slug]/page.tsx`
  - Prevenir múltiples conteos (cookie/sessionStorage)

**Entregable**: Dashboard con métricas básicas

---

### **FASE 7: Features Avanzadas** (Semana 6)
**Duración estimada**: 3-4 días

#### Tareas:
- [ ] **7.1** Publicaciones programadas
  - Input fecha/hora en formulario
  - Guardar en `scheduled_publications`
  - Cron job (Edge Function) que publica automáticamente

- [ ] **7.2** Historial de revisiones
  - Mostrar cambios anteriores en sidebar
  - Comparar versiones (diff)
  - Restaurar versión anterior

- [ ] **7.3** Búsqueda avanzada en admin
  - Full-text search con PostgreSQL
  - Filtros combinados (categoría + estado + fecha)
  - Búsqueda por tags

- [ ] **7.4** Exportar/Importar noticias
  - Exportar a CSV/JSON
  - Importar desde CSV (bulk upload)

**Entregable**: CMS completo con features avanzadas

---

## 🚀 Tecnologías y Librerías

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TailwindCSS** (diseño)
- **TipTap** (editor WYSIWYG)
- **React Hook Form** (formularios)
- **Zod** (validación)
- **Recharts** (gráficos analytics)

### Backend
- **Next.js API Routes**
- **Supabase Client** (queries)
- **Supabase Storage** (imágenes)
- **Sharp** (procesamiento imágenes)

### Database
- **PostgreSQL** (Supabase)
- **Supabase Auth** (autenticación)
- **Row Level Security** (permisos)

---

## 📝 Notas Importantes

### Reutilización del Diseño Actual
- ✅ Usar la plantilla de `app/noticias/[slug]/page.tsx` como base
- ✅ Mantener mismos estilos CSS del frontend público
- ✅ El editor debe generar HTML compatible con `formatArticleContent()`

### Compatibilidad con Contenido Existente
- ✅ Las 86 noticias actuales (scrapeadas) siguen funcionando
- ✅ El CMS solo agrega nuevo contenido, no modifica scraping
- ✅ Diferenciar visualmente: "🌐 Externa" vs "📝 Redacción" en lista admin

### Seguridad
- ✅ API protegida con Supabase JWT
- ✅ RLS policies en todas las tablas
- ✅ Validación input server-side (Zod)
- ✅ Sanitización de HTML (DOMPurify)
- ✅ Rate limiting en endpoints críticos

---

## ✅ Criterios de Éxito

### MVP Funcional (Final Fase 3)
- [x] Redactores pueden crear noticias completas
- [x] Redactores pueden editar noticias existentes
- [x] Sistema de borradores funcional
- [x] Publicar/despublicar noticias
- [x] Upload de imágenes
- [x] Preview de artículos

### Listo para Redactores IA (Final Fase 5)
- [x] API documentada para consumo externo
- [x] Workflow de revisión implementado
- [x] Tracking de contenido IA vs humano

### Producto Completo (Final Fase 7)
- [x] Analytics funcionando
- [x] Publicaciones programadas
- [x] Historial de revisiones
- [x] Sistema de roles completo

---

## 🎯 Próximos Pasos

1. **Ahora**: Revisar este plan y confirmar arquitectura
2. **Mañana**: Comenzar Fase 1 (Backend API)
3. **Semana 1**: Completar API + autenticación
4. **Semana 2-3**: Panel Admin completo
5. **Semana 4**: Integración redactores IA

---

**Última actualización**: 2026-08-12
**Autor**: Claude Code
**Estado**: Borrador para revisión
