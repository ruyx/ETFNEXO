# Sistema FAQ para Entrevistas - Documentación Técnica

**Fecha**: 2026-08-28
**Feature**: Resumen Exprés (FAQ) para Entrevistas
**Objetivo**: Replicar el sistema FAQ de Noticias y Academia en la sección de Entrevistas

---

## 📋 Resumen

Se implementó un sistema completo de Preguntas Frecuentes (FAQ) para la sección de Entrevistas, replicando exactamente la funcionalidad que ya existía en Noticias y Academia. El sistema incluye:

- ✅ Editor de FAQ con ReactQuill en el admin
- ✅ Persistencia en base de datos (JSONB)
- ✅ Burbuja flotante en la vista pública
- ✅ Modal con Schema.org para SEO
- ✅ Reutilización del componente ArticleFAQ

---

## 🗂️ Archivos Modificados

### 1. **Base de Datos**

#### `/supabase/migrations/20260828_add_faq_to_interviews.sql`
- **Añadido**: Columna `faq` (JSONB) a la tabla `interviews`
- **Eliminado**: Columna `excerpt` (no necesaria, reemplazada por FAQ)
- **Actualizado**: Vista `interviews_with_metadata` con el campo `faq`

```sql
-- Estructura
ALTER TABLE interviews ADD COLUMN IF NOT EXISTS faq JSONB DEFAULT '[]'::jsonb;
ALTER TABLE interviews DROP COLUMN IF EXISTS excerpt;

-- Vista actualizada
CREATE VIEW interviews_with_metadata AS
SELECT
  i.id,
  i.title,
  i.slug,
  i.description,
  i.faq,                    -- ← NUEVO CAMPO
  i.youtube_video_id,
  i.category_id,
  -- ... demás campos
FROM interviews i
LEFT JOIN interview_categories c ON i.category_id = c.id;
```

**Formato de datos en `faq`:**
```json
[
  {
    "question": "¿Qué es un ETF?",
    "answer": "<p>Un ETF es un fondo cotizado...</p>"
  },
  {
    "question": "¿Cómo invertir en ETFs?",
    "answer": "<p>Para invertir en ETFs...</p>"
  }
]
```

---

### 2. **Backend - API**

#### `/app/api/admin/entrevistas/[id]/route.ts`

**Cambios en POST (crear entrevista):**
```typescript
const { data, error } = await supabase
  .from('interviews')
  .insert([{
    title: body.title,
    slug: body.slug,
    description: body.description,
    youtube_video_id: body.youtube_video_id,
    category_id: body.category_id,
    status: body.status || 'draft',
    published_at: body.status === 'published' ? new Date().toISOString() : null,
    faq: body.faq || [],              // ← NUEVO: Guardar FAQ
    meta_title: body.meta_title,
    meta_description: body.meta_description
  }])
```

**Cambios en PUT (actualizar entrevista):**
```typescript
const updateData: any = {
  title: body.title,
  slug: body.slug,
  description: body.description,
  youtube_video_id: body.youtube_video_id,
  category_id: body.category_id,
  status: body.status,
  faq: body.faq || [],                // ← NUEVO: Actualizar FAQ
  meta_title: body.meta_title,
  meta_description: body.meta_description,
  updated_at: new Date().toISOString()
};
```

**❌ Eliminado** (columnas que no existen):
- `video_provider`
- `custom_iframe_code`

---

### 3. **Frontend - Admin**

#### `/components/admin/InterviewForm.tsx`

**Imports añadidos:**
```typescript
import { useState, useEffect, FormEvent, useMemo } from 'react';
import { Plus, Trash2, HelpCircle } from 'lucide-react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface FAQ {
  question: string;
  answer: string;
}
```

**Estado:**
```typescript
const [faqs, setFaqs] = useState<FAQ[]>(initialData?.faq || []);
```

**Handlers:**
```typescript
const addFaq = () => {
  setFaqs(prev => [...prev, { question: '', answer: '' }]);
};

const updateFaqQuestion = (index: number, question: string) => {
  setFaqs(prev => prev.map((faq, i) => i === index ? { ...faq, question } : faq));
};

const updateFaqAnswer = (index: number, answer: string) => {
  setFaqs(prev => prev.map((faq, i) => i === index ? { ...faq, answer } : faq));
};

const removeFaq = (index: number) => {
  setFaqs(prev => prev.filter((_, i) => i !== index));
};
```

**Configuración ReactQuill:**
```typescript
const quillModules = useMemo(() => ({
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'align': [] }],
    ['link', 'blockquote', 'code-block'],
    ['clean']
  ],
}), []);

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'align', 'link', 'blockquote', 'code-block'
];
```

**Submit actualizado:**
```typescript
const interviewData = {
  title,
  slug,
  description,
  faq: faqs.filter(faq => faq.question.trim() && faq.answer.trim()), // ← Filtrar vacíos
  youtube_video_id: youtubeVideoId,
  category_id: categoryId,
  status,
  meta_title: metaTitle,
  meta_description: metaDescription
};
```

**UI Section completa** (ver archivo para código completo):
- Header con botón "Agregar Pregunta"
- Lista de FAQs con numeración
- Input para pregunta
- ReactQuill para respuesta
- Botón eliminar por FAQ

---

### 4. **Frontend - Vista Pública**

#### `/app/entrevistas/[slug]/page.tsx`

**Import añadido:**
```typescript
import ArticleFAQ from '@/components/ArticleFAQ';
```

**Componente añadido** (antes del `</main>`):
```typescript
{/* FAQ Floating Bubble */}
<ArticleFAQ faqs={interview.faq || []} articleTitle={interview.title} />
```

**Comportamiento:**
- Burbuja flotante aparece solo si hay FAQs (`interview.faq?.length > 0`)
- Al hacer click, abre modal con todas las preguntas y respuestas
- Incluye Schema.org FAQPage para SEO
- Soporte para URL hash `#resumen`

---

## 🔧 Componente Reutilizado

### `/components/ArticleFAQ.tsx` (sin cambios)

Este componente ya existía y se usa en:
- ✅ Noticias (`/noticias/[slug]/page.tsx`)
- ✅ Academia (`/academia/[slug]/page.tsx`)
- ✅ Entrevistas (`/entrevistas/[slug]/page.tsx`) **← NUEVO**

**Props:**
```typescript
interface ArticleFAQProps {
  faqs: Array<{ question: string; answer: string }>;
  articleTitle: string;
}
```

**Features:**
- Burbuja flotante bottom-right
- Modal responsive
- Schema.org estructurado
- Sanitización de HTML
- Animaciones suaves

---

## 🐛 Errores Corregidos

### Error 1: Columnas inexistentes en la vista
**Problema:** `ERROR: 42703: column i.video_provider does not exist`

**Causa:** La vista `interviews_with_metadata` intentaba seleccionar columnas que no existían en la tabla.

**Solución:** Eliminadas referencias a `video_provider` y `custom_iframe_code` de la vista.

---

### Error 2: No se puede eliminar columna excerpt
**Problema:** `ERROR: 2BP01: cannot drop column excerpt because view depends on it`

**Causa:** Intentar eliminar columna mientras la vista la referencia.

**Solución:** Reordenar pasos de migración:
1. DROP VIEW
2. ADD COLUMN faq
3. DROP COLUMN excerpt
4. CREATE VIEW (con faq)

---

### Error 3: 500 Internal Server Error al guardar
**Problema:** API intentaba guardar `video_provider` y `custom_iframe_code`

**Causa:** Campos enviados desde el frontend pero columnas no existen en DB.

**Solución:** Eliminados de ambos endpoints (POST y PUT).

---

### Error 4: ReactQuill no visible en el admin
**Problema:** Editor no aparecía en el formulario.

**Causa:** Orden de imports incorrecto y falta de CSS.

**Solución:**
```typescript
// Orden correcto
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';  // ← CSS antes del dynamic import

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
```

---

### Error 5: FAQs no persistían después de guardar
**Problema:** Se guardaban pero no aparecían al recargar.

**Causa:** API guardaba `key_points` en lugar de `faq`.

**Solución:** Cambiar campo en POST/PUT:
```typescript
faq: body.faq || []  // Antes: key_points: body.key_points || []
```

---

## ✅ Testing Checklist

- [x] Crear entrevista con FAQs → Se guarda correctamente
- [x] Actualizar entrevista con FAQs → Se actualiza sin error 500
- [x] FAQs persisten después de recargar → Sí, se guardan en DB
- [x] Burbuja flotante aparece en `/entrevistas/[slug]` → Sí, con ArticleFAQ
- [x] Modal se abre correctamente → Sí, muestra todas las FAQs
- [x] ReactQuill renderiza HTML correctamente → Sí, contenido enriquecido
- [x] Schema.org se genera → Sí, FAQPage para SEO

---

## 📊 Impacto SEO

El sistema FAQ incluye Schema.org structured data:

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "¿Qué es un ETF?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Un ETF es un fondo cotizado..."
      }
    }
  ]
}
```

**Beneficios:**
- 🔍 Rich snippets en Google
- 🤖 Indexación por IA (ChatGPT, Perplexity)
- 📈 Mayor CTR en resultados de búsqueda
- ⚡ Featured snippets potenciales

---

## 🚀 Deployment

### Aplicar migración en producción:

```bash
# 1. Conectar a Supabase
supabase link --project-ref <project-id>

# 2. Aplicar migración
supabase db push

# 3. Verificar vista
supabase db execute --query "SELECT * FROM interviews_with_metadata LIMIT 1;"
```

### Verificar en producción:

1. Crear/editar entrevista con FAQs
2. Verificar que se guarda sin errores
3. Visitar `/entrevistas/[slug]` y verificar burbuja flotante
4. Abrir modal y verificar contenido
5. Inspeccionar Schema.org en el HTML

---

## 📝 Notas Finales

- **No se crearon nuevos componentes** → Reutilización total de ArticleFAQ
- **Arquitectura consistente** → Mismo patrón en noticias, academia y entrevistas
- **Sin breaking changes** → Entrevistas existentes funcionan sin FAQs (array vacío por defecto)
- **Migración reversible** → Se puede restaurar `excerpt` si fuera necesario (hay backup en migraciones anteriores)

---

## 🔗 Referencias

- Componente base: `/components/ArticleFAQ.tsx`
- Implementación noticias: `/components/admin/ArticleForm.tsx`
- Implementación academia: `/components/admin/AcademiaForm.tsx`
- Schema.org FAQPage: https://schema.org/FAQPage
