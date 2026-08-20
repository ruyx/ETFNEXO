# Plan de Implementación: Sistema de Academia

## 📋 Resumen Ejecutivo

Duplicar completamente el sistema de noticias para crear una sección "Academia" con artículos educativos creados por agentes/expertos, manteniendo todas las funcionalidades: categorías, tags, FAQ, imágenes, autores, etc.

---

## 🎯 Objetivo

Crear un sistema paralelo de contenido educativo que comparta la misma arquitectura que noticias pero con:
- Contenido educativo/formativo en lugar de noticias
- Mismo sistema de agentes AI/expertos
- Mismas capacidades: FAQ, imágenes, categorías, tags
- URLs: `/academia` y `/academia/[slug]`
- Admin: `/admin/academia`

---

## 📊 Arquitectura Actual de Noticias

### Base de Datos
1. **news_articles** - Artículos principales
2. **news_categories** - Categorías (ETFs, Gestoras, Mercados, etc.)
3. **news_tags** - Tags flexibles
4. **news_article_tags** - Relación N:M artículos-tags
5. **news_related_etfs** - Relación artículos-ETFs
6. **ai_agents** - Autores/agentes (compartido)

### APIs
- `GET /api/v1/noticias` - Listado público
- `GET /api/v1/noticias/[slug]` - Detalle público
- `GET /api/admin/noticias` - Listado admin
- `POST /api/admin/noticias` - Crear
- `PUT/DELETE /api/admin/noticias/[id]` - Actualizar/Eliminar
- `POST /api/admin/noticias/[id]/publish` - Publicar

### Páginas Frontend
- `/noticias` - Listado público
- `/noticias/[slug]` - Detalle artículo
- `/autores/[slug]` - Perfil autor
- `/admin/noticias` - Dashboard admin
- `/admin/noticias/crear` - Crear noticia
- `/admin/noticias/[id]` - Editar noticia

### Componentes
- `NewsCard` - Card de noticia (3 variantes)
- Otros componentes de UI compartidos

---

## 🚀 Plan de Implementación (12 Fases)

### **FASE 1: Base de Datos - Tablas Principales** ✅

**Archivo**: `supabase/migrations/YYYYMMDD_create_academy_system.sql`

**Tareas**:
1. Crear tabla `academy_categories`
   - Estructura idéntica a `news_categories`
   - Categorías iniciales: "Conceptos Básicos", "Estrategias", "Análisis Técnico", "Gestión de Riesgos", "Fiscalidad"

2. Crear tabla `academy_tags`
   - Estructura idéntica a `news_tags`
   - Tags iniciales: "Principiantes", "Avanzado", "Tutorial", "Case Study"

3. Crear tabla `academy_articles`
   - Estructura similar a `news_articles`
   - Campos IDÉNTICOS:
     - title, slug, excerpt, content
     - category_id, author_id (referencia a ai_agents)
     - meta_title, meta_description
     - featured_image_url, featured_image_alt
     - faq (JSONB) - para preguntas frecuentes
     - status, published_at
     - views_count, shares_count
     - created_at, updated_at
   - Campos NUEVOS opcionales:
     - difficulty_level TEXT ('beginner', 'intermediate', 'advanced')
     - estimated_reading_time INTEGER (minutos)
     - prerequisites TEXT[] (array de slugs de artículos previos)

4. Crear tabla `academy_article_tags` (relación N:M)

5. Crear tabla `academy_related_etfs` (relación N:M con ETFs)

**Comandos SQL**:
```sql
-- academy_categories
CREATE TABLE academy_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  color_hex TEXT DEFAULT '#8B5CF6',
  icon_name TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- academy_tags
CREATE TABLE academy_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- academy_articles
CREATE TABLE academy_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Contenido
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,

  -- Metadata
  category_id UUID REFERENCES academy_categories(id) ON DELETE SET NULL,
  author_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL,

  -- SEO
  meta_title TEXT,
  meta_description TEXT,
  featured_image_url TEXT,
  featured_image_alt TEXT,

  -- FAQ (Preguntas Frecuentes)
  faq JSONB DEFAULT '[]'::jsonb,

  -- Publishing
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  published_at TIMESTAMPTZ,

  -- Analytics
  views_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,

  -- Academia-specific
  difficulty_level TEXT CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_reading_time INTEGER,
  prerequisites TEXT[],

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Resto de tablas relacionales...
```

**Criterio de Éxito**:
- ✅ Todas las tablas creadas sin errores
- ✅ Índices creados correctamente
- ✅ RLS habilitado
- ✅ Datos iniciales insertados

---

### **FASE 2: Base de Datos - Funciones y Triggers** ✅

**Archivo**: Mismo migration file de FASE 1

**Tareas**:
1. Crear función `update_academy_tag_usage_count()`
2. Crear triggers para actualizar contadores
3. Crear trigger `updated_at`
4. Crear función de búsqueda `search_academy_articles()`
5. Crear vista `academy_articles_with_metadata`
6. Configurar RLS (Row Level Security)

**Comandos SQL**:
```sql
-- Función actualizar usage_count de tags
CREATE OR REPLACE FUNCTION update_academy_tag_usage_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE academy_tags SET usage_count = usage_count + 1 WHERE id = NEW.tag_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE academy_tags SET usage_count = usage_count - 1 WHERE id = OLD.tag_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_academy_tag_usage_on_insert
AFTER INSERT ON academy_article_tags
FOR EACH ROW EXECUTE FUNCTION update_academy_tag_usage_count();

-- Vista completa
CREATE OR REPLACE VIEW academy_articles_with_metadata AS
SELECT
  a.*,
  c.name as category_name,
  c.slug as category_slug,
  ag.name as agent_name,
  ag.slug as agent_slug,
  ag.display_name as agent_display_name,
  ag.avatar_url as agent_avatar_url,
  COALESCE(json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
    FILTER (WHERE t.id IS NOT NULL), '[]'::json) as tags
FROM academy_articles a
LEFT JOIN academy_categories c ON a.category_id = c.id
LEFT JOIN ai_agents ag ON a.author_id = ag.id
LEFT JOIN academy_article_tags aat ON a.id = aat.article_id
LEFT JOIN academy_tags t ON aat.tag_id = t.id
GROUP BY a.id, c.id, ag.id;

-- RLS Policies
ALTER TABLE academy_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read published articles" ON academy_articles
  FOR SELECT USING (status = 'published');
```

**Criterio de Éxito**:
- ✅ Triggers funcionando correctamente
- ✅ Vista retorna datos correctamente
- ✅ Búsqueda full-text funciona
- ✅ RLS permite acceso público solo a publicados

---

### **FASE 3: API Pública - Listado y Detalle** ✅

**Archivos**:
- `app/api/v1/academia/route.ts`
- `app/api/v1/academia/[slug]/route.ts`

**Tareas**:
1. Duplicar `/api/v1/noticias/route.ts` → `/api/v1/academia/route.ts`
2. Duplicar `/api/v1/noticias/[slug]/route.ts` → `/api/v1/academia/[slug]/route.ts`
3. Cambiar todas las referencias:
   - `news_articles` → `academy_articles`
   - `news_categories` → `academy_categories`
   - `news_tags` → `academy_tags`

**Ejemplo - GET /api/v1/academia**:
```typescript
// app/api/v1/academia/route.ts
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = parseInt(searchParams.get('limit') || '12');
  const offset = parseInt(searchParams.get('offset') || '0');
  const category = searchParams.get('category');
  const difficulty = searchParams.get('difficulty'); // nuevo filtro

  const supabase = createClient();

  let query = supabase
    .from('academy_articles')
    .select('*, category:academy_categories(name, slug), author:ai_agents(name, slug, avatar_url)', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (category) {
    query = query.eq('category.slug', category);
  }

  if (difficulty) {
    query = query.eq('difficulty_level', difficulty);
  }

  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data, count, limit, offset });
}
```

**Endpoints a crear**:
- `GET /api/v1/academia?limit=12&offset=0&category=&difficulty=`
- `GET /api/v1/academia/[slug]` (con incremento de views)

**Criterio de Éxito**:
- ✅ API retorna artículos correctamente
- ✅ Filtros funcionan (categoría, dificultad)
- ✅ Paginación funciona
- ✅ Detalle incrementa views

---

### **FASE 4: API Admin - CRUD Completo** ✅

**Archivos**:
- `app/api/admin/academia/route.ts` (GET, POST)
- `app/api/admin/academia/[id]/route.ts` (GET, PUT, DELETE)
- `app/api/admin/academia/[id]/publish/route.ts` (POST)

**Tareas**:
1. Duplicar toda la estructura de `/api/admin/noticias/*`
2. Adaptar queries a tablas `academy_*`
3. Mantener validaciones y permisos idénticos

**Ejemplo - POST /api/admin/academia**:
```typescript
// app/api/admin/academia/route.ts
import { createAdminClient } from '@/lib/supabase/admin';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createAdminClient();
  const body = await request.json();

  const { data, error } = await supabase
    .from('academy_articles')
    .insert({
      title: body.title,
      slug: body.slug,
      content: body.content,
      excerpt: body.excerpt,
      category_id: body.category_id,
      author_id: body.author_id,
      faq: body.faq || [],
      difficulty_level: body.difficulty_level,
      estimated_reading_time: body.estimated_reading_time,
      featured_image_url: body.featured_image_url,
      status: 'draft'
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
```

**Endpoints a crear**:
- `GET /api/admin/academia` - Listado con paginación
- `POST /api/admin/academia` - Crear artículo
- `GET /api/admin/academia/[id]` - Obtener artículo
- `PUT /api/admin/academia/[id]` - Actualizar
- `DELETE /api/admin/academia/[id]` - Eliminar
- `POST /api/admin/academia/[id]/publish` - Publicar

**Criterio de Éxito**:
- ✅ CRUD completo funcional
- ✅ Validaciones en servidor
- ✅ Permisos admin verificados

---

### **FASE 5: Componentes Reutilizables** ✅

**Archivos**:
- `components/AcademyCard.tsx` (nuevo, basado en NewsCard)
- `components/DifficultyBadge.tsx` (nuevo)
- `components/ReadingTimeBadge.tsx` (nuevo)

**Tareas**:
1. Crear `AcademyCard` duplicando `NewsCard`
2. Agregar badges de dificultad y tiempo de lectura
3. Mantener las 3 variantes: default, featured, card

**Ejemplo - AcademyCard.tsx**:
```typescript
import Link from 'next/link'
import { Calendar, Clock, TrendingUp } from 'lucide-react'

export interface AcademyArticle {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  featured_image_url: string | null
  published_at: string
  author_name: string | null
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | null
  estimated_reading_time: number | null
}

interface AcademyCardProps {
  article: AcademyArticle
  variant?: 'default' | 'featured' | 'card'
}

export default function AcademyCard({ article, variant = 'default' }: AcademyCardProps) {
  const getDifficultyColor = (level: string | null) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // ... resto del componente similar a NewsCard
}
```

**Criterio de Éxito**:
- ✅ AcademyCard funciona con 3 variantes
- ✅ Badges de dificultad y tiempo visible
- ✅ Responsive y accesible

---

### **FASE 6: Página Pública - Listado Academia** ✅

**Archivo**: `app/academia/page.tsx`

**Tareas**:
1. Duplicar `/app/noticias/page.tsx` → `/app/academia/page.tsx`
2. Cambiar:
   - API endpoint: `/api/v1/noticias` → `/api/v1/academia`
   - Componente: `NewsCard` → `AcademyCard`
   - Textos: "Noticias" → "Academia"
3. Agregar filtros de dificultad

**Ejemplo - page.tsx**:
```typescript
'use client';

import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import AcademyCard, { AcademyArticle } from '@/components/AcademyCard';

export default function AcademiaPage() {
  const [articles, setArticles] = useState<AcademyArticle[]>([]);
  const [difficulty, setDifficulty] = useState<string>('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (difficulty) params.set('difficulty', difficulty);

    fetch(`/api/v1/academia?${params.toString()}`)
      .then(res => res.json())
      .then(data => setArticles(data.data || []));
  }, [difficulty]);

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900 text-white py-16 px-6">
          <div className="container max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Academia ETF Nexo
            </h1>
            <p className="text-xl text-purple-100">
              Aprende sobre ETFs con artículos educativos creados por expertos
            </p>
          </div>
        </section>

        {/* Filtros */}
        <section className="py-8 px-6 border-b">
          <div className="container max-w-7xl flex gap-4">
            <button onClick={() => setDifficulty('')}>Todos</button>
            <button onClick={() => setDifficulty('beginner')}>Principiante</button>
            <button onClick={() => setDifficulty('intermediate')}>Intermedio</button>
            <button onClick={() => setDifficulty('advanced')}>Avanzado</button>
          </div>
        </section>

        {/* Grid */}
        <section className="py-16 px-6">
          <div className="container max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map(article => (
              <AcademyCard key={article.id} article={article} variant="card" />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
```

**Criterio de Éxito**:
- ✅ Página carga artículos correctamente
- ✅ Filtros funcionan
- ✅ Infinite scroll (si aplica)
- ✅ SEO optimizado

---

### **FASE 7: Página Pública - Detalle Artículo** ✅

**Archivo**: `app/academia/[slug]/page.tsx`

**Tareas**:
1. Duplicar `/app/noticias/[slug]/page.tsx` → `/app/academia/[slug]/page.tsx`
2. Adaptar fetch a `/api/v1/academia/[slug]`
3. Mostrar badges de dificultad y tiempo
4. Mostrar sección FAQ si existe
5. Mostrar "Artículos relacionados" (misma categoría o prerequisitos)

**Ejemplo - page.tsx**:
```typescript
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/components/Header';
import { createAdminClient } from '@/lib/supabase/admin';

interface PageProps {
  params: { slug: string };
}

async function getArticle(slug: string) {
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from('academy_articles')
    .select(`
      *,
      category:academy_categories(name, slug),
      author:ai_agents(name, slug, display_name, avatar_url)
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (error || !data) return null;
  return data;
}

export default async function AcademiaArticlePage({ params }: PageProps) {
  const article = await getArticle(params.slug);
  if (!article) notFound();

  return (
    <>
      <Header />
      <main className="py-16 px-6">
        <article className="container max-w-4xl">
          {/* Header */}
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{article.title}</h1>

            <div className="flex gap-4 items-center">
              {article.difficulty_level && (
                <span className="px-3 py-1 rounded-full text-sm">
                  {article.difficulty_level}
                </span>
              )}
              {article.estimated_reading_time && (
                <span className="text-sm text-slate-600">
                  ⏱️ {article.estimated_reading_time} min lectura
                </span>
              )}
            </div>
          </header>

          {/* Content */}
          <div className="prose lg:prose-xl" dangerouslySetInnerHTML={{ __html: article.content }} />

          {/* FAQ */}
          {article.faq && article.faq.length > 0 && (
            <section className="mt-12 border-t pt-8">
              <h2 className="text-2xl font-bold mb-6">Preguntas Frecuentes</h2>
              {article.faq.map((item: any, index: number) => (
                <div key={index} className="mb-6">
                  <h3 className="text-lg font-semibold mb-2">{item.question}</h3>
                  <div className="text-slate-700" dangerouslySetInnerHTML={{ __html: item.answer }} />
                </div>
              ))}
            </section>
          )}
        </article>
      </main>
    </>
  );
}
```

**Criterio de Éxito**:
- ✅ Detalle muestra todo el contenido
- ✅ FAQ renderiza correctamente
- ✅ Badges visibles
- ✅ SEO metadata correcta

---

### **FASE 8: Admin - Dashboard Academia** ✅

**Archivo**: `app/admin/academia/page.tsx`

**Tareas**:
1. Duplicar `/app/admin/noticias/page.tsx` → `/app/admin/academia/page.tsx`
2. Cambiar API: `/api/admin/noticias` → `/api/admin/academia`
3. Agregar columna de dificultad en tabla

**Ejemplo - Dashboard**:
```typescript
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminAcademiaPage() {
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    fetch('/api/admin/academia')
      .then(res => res.json())
      .then(data => setArticles(data.data || []));
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Artículos de Academia</h1>
        <Link href="/admin/academia/crear" className="btn-primary">
          Crear Artículo
        </Link>
      </div>

      <table className="w-full">
        <thead>
          <tr>
            <th>Título</th>
            <th>Categoría</th>
            <th>Dificultad</th>
            <th>Estado</th>
            <th>Autor</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {articles.map((article: any) => (
            <tr key={article.id}>
              <td>{article.title}</td>
              <td>{article.category?.name}</td>
              <td>
                <span className={`badge ${getDifficultyClass(article.difficulty_level)}`}>
                  {article.difficulty_level || 'N/A'}
                </span>
              </td>
              <td>{article.status}</td>
              <td>{article.author?.display_name}</td>
              <td>{new Date(article.created_at).toLocaleDateString()}</td>
              <td>
                <Link href={`/admin/academia/${article.id}`}>Editar</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

**Criterio de Éxito**:
- ✅ Dashboard lista artículos
- ✅ Búsqueda y filtros funcionan
- ✅ Paginación funcional

---

### **FASE 9: Admin - Crear/Editar Artículo** ✅

**Archivos**:
- `app/admin/academia/crear/page.tsx`
- `app/admin/academia/[id]/page.tsx`

**Tareas**:
1. Duplicar formularios de noticias
2. Agregar campos:
   - Selector de dificultad
   - Input de tiempo de lectura
   - Editor de FAQ (array de Q&A)
   - Selector de artículos prerequisitos
3. Integrar editor WYSIWYG (react-quill o similar)

**Ejemplo - Crear Artículo**:
```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function CrearAcademiaPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    difficulty_level: 'beginner',
    estimated_reading_time: 5,
    faq: [] as Array<{ question: string; answer: string }>
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch('/api/admin/academia', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (res.ok) {
      const data = await res.json();
      router.push(`/admin/academia/${data.id}`);
    }
  };

  const addFAQ = () => {
    setFormData(prev => ({
      ...prev,
      faq: [...prev.faq, { question: '', answer: '' }]
    }));
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Crear Artículo de Academia</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
        <div>
          <label>Título</label>
          <input
            type="text"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        {/* Dificultad */}
        <div>
          <label>Dificultad</label>
          <select
            value={formData.difficulty_level}
            onChange={e => setFormData({ ...formData, difficulty_level: e.target.value })}
          >
            <option value="beginner">Principiante</option>
            <option value="intermediate">Intermedio</option>
            <option value="advanced">Avanzado</option>
          </select>
        </div>

        {/* Tiempo de Lectura */}
        <div>
          <label>Tiempo de lectura (minutos)</label>
          <input
            type="number"
            value={formData.estimated_reading_time}
            onChange={e => setFormData({ ...formData, estimated_reading_time: parseInt(e.target.value) })}
            min="1"
          />
        </div>

        {/* Contenido */}
        <div>
          <label>Contenido</label>
          <ReactQuill
            value={formData.content}
            onChange={content => setFormData({ ...formData, content })}
          />
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-xl font-bold mb-4">Preguntas Frecuentes</h2>
          {formData.faq.map((item, index) => (
            <div key={index} className="border p-4 mb-4">
              <input
                type="text"
                placeholder="Pregunta"
                value={item.question}
                onChange={e => {
                  const newFaq = [...formData.faq];
                  newFaq[index].question = e.target.value;
                  setFormData({ ...formData, faq: newFaq });
                }}
              />
              <textarea
                placeholder="Respuesta"
                value={item.answer}
                onChange={e => {
                  const newFaq = [...formData.faq];
                  newFaq[index].answer = e.target.value;
                  setFormData({ ...formData, faq: newFaq });
                }}
              />
            </div>
          ))}
          <button type="button" onClick={addFAQ}>
            Agregar Pregunta
          </button>
        </div>

        <button type="submit" className="btn-primary">
          Crear Artículo
        </button>
      </form>
    </div>
  );
}
```

**Criterio de Éxito**:
- ✅ Formulario crea artículos
- ✅ Validación frontend y backend
- ✅ Editor WYSIWYG funcional
- ✅ FAQ editable

---

### **FASE 10: Página de Autores - Integración Academia** ✅

**Archivo**: `app/autores/[slug]/page.tsx` (modificar existente)

**Tareas**:
1. Modificar para mostrar TANTO noticias COMO artículos de academia del autor
2. Agregar tabs o secciones separadas
3. Usar componentes correspondientes (NewsCard vs AcademyCard)

**Ejemplo - Modificación**:
```typescript
async function getAuthorContent(agentId: string) {
  const supabase = createAdminClient();

  // Noticias
  const { data: news } = await supabase
    .from('news_articles')
    .select('*')
    .eq('author_id', agentId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(6);

  // Academia
  const { data: academy } = await supabase
    .from('academy_articles')
    .select('*')
    .eq('author_id', agentId)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(6);

  return { news, academy };
}

// En el componente:
<section>
  <h2>Noticias Recientes</h2>
  <div className="grid grid-cols-3 gap-6">
    {content.news.map(article => (
      <NewsCard key={article.id} article={article} variant="card" />
    ))}
  </div>
</section>

<section>
  <h2>Artículos de Academia</h2>
  <div className="grid grid-cols-3 gap-6">
    {content.academy.map(article => (
      <AcademyCard key={article.id} article={article} variant="card" />
    ))}
  </div>
</section>
```

**Criterio de Éxito**:
- ✅ Autores muestran ambos tipos de contenido
- ✅ Separación clara entre noticias y academia

---

### **FASE 11: Navegación y Menú** ✅

**Archivos**:
- `components/Header.tsx`
- `app/layout.tsx`

**Tareas**:
1. Agregar enlace "Academia" en header principal
2. Actualizar footer si aplica
3. Agregar breadcrumbs en páginas de academia

**Ejemplo - Header**:
```typescript
// components/Header.tsx
export default function Header() {
  return (
    <header>
      <nav>
        <Link href="/">Inicio</Link>
        <Link href="/noticias">Noticias</Link>
        <Link href="/academia">Academia</Link> {/* NUEVO */}
        <Link href="/etfs">ETFs</Link>
      </nav>
    </header>
  );
}
```

**Criterio de Éxito**:
- ✅ Navegación visible en toda la app
- ✅ Links funcionan correctamente

---

### **FASE 12: Testing y Deploy** ✅

**Tareas**:
1. **Testing Local**:
   - Crear artículo de prueba en admin
   - Verificar que aparece en `/academia`
   - Verificar detalle en `/academia/[slug]`
   - Verificar FAQ se muestra correctamente
   - Probar filtros de dificultad

2. **Migración a Producción**:
   - Ejecutar migration en Supabase producción
   - Insertar categorías y tags iniciales
   - Crear 2-3 artículos de prueba

3. **SEO**:
   - Verificar metadata en todas las páginas
   - Agregar sitemap entries para `/academia`
   - Configurar OpenGraph para compartir

4. **Deploy**:
   - Git commit con mensaje descriptivo
   - Push a GitHub
   - Verificar deploy en Vercel
   - Smoke test en producción

**Comandos**:
```bash
# Crear migration
cd supabase
supabase migration new create_academy_system

# Aplicar localmente (desarrollo)
supabase db push

# Aplicar en producción
supabase db push --linked

# Deploy
git add .
git commit -m "feat: Sistema completo de Academia

- Base de datos: academy_articles, academy_categories, academy_tags
- APIs públicas y admin completas
- Páginas frontend: /academia, /academia/[slug]
- Admin dashboard: /admin/academia
- Componente AcademyCard con variantes
- Integración con sistema de agentes existente
- FAQ y campos específicos de academia

🤖 Generated with Claude Code"

git push origin main
```

**Criterio de Éxito**:
- ✅ Sistema funciona end-to-end
- ✅ Sin errores en producción
- ✅ SEO configurado
- ✅ Documentación actualizada

---

## 📈 Resumen de Archivos a Crear/Modificar

### **Base de Datos** (1 archivo)
- ✅ `supabase/migrations/YYYYMMDD_create_academy_system.sql`

### **APIs** (6 archivos nuevos)
- ✅ `app/api/v1/academia/route.ts`
- ✅ `app/api/v1/academia/[slug]/route.ts`
- ✅ `app/api/admin/academia/route.ts`
- ✅ `app/api/admin/academia/[id]/route.ts`
- ✅ `app/api/admin/academia/[id]/publish/route.ts`

### **Componentes** (3 archivos nuevos)
- ✅ `components/AcademyCard.tsx`
- ✅ `components/DifficultyBadge.tsx`
- ✅ `components/ReadingTimeBadge.tsx`

### **Páginas Públicas** (2 archivos nuevos)
- ✅ `app/academia/page.tsx`
- ✅ `app/academia/[slug]/page.tsx`

### **Admin** (3 archivos nuevos)
- ✅ `app/admin/academia/page.tsx`
- ✅ `app/admin/academia/crear/page.tsx`
- ✅ `app/admin/academia/[id]/page.tsx`

### **Modificaciones** (2 archivos)
- ✅ `app/autores/[slug]/page.tsx` (agregar academia)
- ✅ `components/Header.tsx` (agregar enlace)

**Total**: 17 archivos (15 nuevos + 2 modificados)

---

## 🎯 Orden de Implementación Recomendado

1. **Día 1**: FASE 1-2 (Base de datos)
2. **Día 2**: FASE 3-4 (APIs)
3. **Día 3**: FASE 5-6 (Componentes y listado público)
4. **Día 4**: FASE 7 (Detalle artículo)
5. **Día 5**: FASE 8-9 (Admin dashboard y formularios)
6. **Día 6**: FASE 10-12 (Integración, navegación, testing, deploy)

**Estimación Total**: 6 días de trabajo

---

## ✅ Checklist Final

### Base de Datos
- [ ] Tablas creadas (academy_articles, academy_categories, academy_tags, etc.)
- [ ] Índices configurados
- [ ] RLS habilitado
- [ ] Triggers funcionando
- [ ] Vistas creadas
- [ ] Datos iniciales insertados

### APIs
- [ ] GET /api/v1/academia (listado público)
- [ ] GET /api/v1/academia/[slug] (detalle público)
- [ ] GET /api/admin/academia (listado admin)
- [ ] POST /api/admin/academia (crear)
- [ ] GET /api/admin/academia/[id] (obtener)
- [ ] PUT /api/admin/academia/[id] (actualizar)
- [ ] DELETE /api/admin/academia/[id] (eliminar)
- [ ] POST /api/admin/academia/[id]/publish (publicar)

### Frontend Público
- [ ] /academia (listado)
- [ ] /academia/[slug] (detalle)
- [ ] Filtros de dificultad
- [ ] FAQ visible en detalle
- [ ] Componente AcademyCard funcional

### Admin
- [ ] /admin/academia (dashboard)
- [ ] /admin/academia/crear (formulario crear)
- [ ] /admin/academia/[id] (formulario editar)
- [ ] Editor WYSIWYG
- [ ] Editor FAQ

### Integración
- [ ] Header con enlace Academia
- [ ] Autores muestran artículos de academia
- [ ] SEO configurado
- [ ] Sitemap actualizado

### Testing
- [ ] Funciona en local
- [ ] Funciona en producción
- [ ] No hay errores en consola
- [ ] Performance aceptable

---

## 🚀 Próximos Pasos (Post-Implementación)

1. **Contenido Inicial**:
   - Crear 10-15 artículos de ejemplo
   - Distribuir en diferentes categorías y dificultades
   - Asignar a diferentes agentes

2. **SEO**:
   - Configurar meta tags específicos
   - Generar sitemap.xml
   - Configurar structured data (Article schema)

3. **Analytics**:
   - Configurar tracking de vistas
   - Implementar "Artículos más leídos"
   - Dashboard de estadísticas

4. **Features Adicionales** (Futuro):
   - Sistema de comentarios
   - Rating de artículos
   - Progreso de lectura (track qué artículos leyó el usuario)
   - Certificados al completar rutas de aprendizaje
   - Quizzes al final de artículos

---

## 📝 Notas Importantes

1. **Reutilización de Código**: El 80% del código es duplicación adaptada del sistema de noticias.

2. **Sistema de Agentes Compartido**: Los mismos agentes (SantIAgo, EstefanIA) pueden escribir tanto noticias como artículos de academia.

3. **Campos Específicos de Academia**:
   - `difficulty_level`: Permite filtrar por nivel
   - `estimated_reading_time`: Ayuda a usuarios a planificar
   - `prerequisites`: Permite crear rutas de aprendizaje

4. **FAQ**: Campo JSONB flexible permite agregar preguntas frecuentes sin cambios de schema.

5. **Escalabilidad**: La arquitectura permite agregar más secciones en el futuro (ej: "Análisis", "Opinión") siguiendo el mismo patrón.

---

**Fin del Plan de Implementación** 🎉
