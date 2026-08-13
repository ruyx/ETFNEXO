# ✅ Checklist de Implementación - CMS Noticias

**Proyecto**: ETF Nexo CMS
**Inicio**: 2026-08-12
**Duración estimada**: 6-8 semanas

---

## 📅 FASE 1: Backend API (Semana 1)

### Migraciones de Base de Datos
- [ ] Aplicar `DATABASE_SCHEMA.sql` a Supabase
- [ ] Verificar que todas las tablas se crearon correctamente
- [ ] Probar triggers de `updated_at`
- [ ] Probar trigger de auto-revisiones
- [ ] Verificar RLS policies funcionan
- [ ] Insertar datos iniciales (categorías, tags)

### API Routes - CRUD Básico
- [ ] Crear `/api/v1/admin/noticias/list/route.ts`
  - [ ] Implementar paginación
  - [ ] Implementar filtros (status, category, search)
  - [ ] Implementar sorting
  - [ ] Probar con Postman

- [ ] Crear `/api/v1/admin/noticias/[id]/route.ts`
  - [ ] GET: Obtener noticia individual
  - [ ] PUT: Actualizar noticia
  - [ ] DELETE: Eliminar noticia
  - [ ] Probar con Postman

- [ ] Crear `/api/v1/admin/noticias/create/route.ts`
  - [ ] POST: Crear noticia
  - [ ] Auto-generar slug desde título
  - [ ] Validaciones con Zod
  - [ ] Probar con Postman

- [ ] Crear `/api/v1/admin/noticias/[id]/publish/route.ts`
  - [ ] PUT: Publicar noticia
  - [ ] Actualizar `published_at`
  - [ ] Crear revisión automática
  - [ ] Probar con Postman

- [ ] Crear `/api/v1/admin/noticias/[id]/draft/route.ts`
  - [ ] PUT: Despublicar noticia
  - [ ] Resetear `published_at`
  - [ ] Probar con Postman

### Upload de Imágenes
- [ ] Crear bucket `article-images` en Supabase Storage
- [ ] Configurar policies públicas de lectura
- [ ] Crear `/api/v1/admin/noticias/upload/route.ts`
  - [ ] Validar tipo de archivo (JPG, PNG, WebP)
  - [ ] Validar tamaño (máx 5MB)
  - [ ] Resize con Sharp (1200x630)
  - [ ] Comprimir imagen
  - [ ] Generar URL pública
  - [ ] Probar con Postman

### Middleware de Autenticación
- [ ] Crear `lib/auth/middleware.ts`
  - [ ] Verificar JWT de Supabase
  - [ ] Extraer user_id del token
  - [ ] Verificar rol del usuario
  - [ ] Aplicar rate limiting
  - [ ] Probar con Postman

### Testing de API
- [ ] Crear collection de Postman
- [ ] Probar todos los endpoints CRUD
- [ ] Probar autenticación (con/sin token)
- [ ] Probar validaciones (campos obligatorios)
- [ ] Probar límites (paginación, caracteres)

---

## 📅 FASE 2: Panel Admin - Lista (Semana 2)

### Setup Inicial Admin Panel
- [ ] Crear `/app/admin/layout.tsx`
  - [ ] Sidebar con navegación
  - [ ] Header con logout
  - [ ] Protected route (redirect si no auth)
  - [ ] Aplicar diseño Tailwind

- [ ] Crear `/app/admin/page.tsx`
  - [ ] Dashboard placeholder
  - [ ] Mensaje bienvenida
  - [ ] Links rápidos

- [ ] Crear `/app/admin/login/page.tsx`
  - [ ] Formulario login (email + password)
  - [ ] Integración con Supabase Auth
  - [ ] Redirect a /admin después de login
  - [ ] Mostrar errores de autenticación

### Lista de Noticias
- [ ] Crear `/app/admin/noticias/page.tsx`
  - [ ] Fetch de noticias desde API
  - [ ] Mostrar en tabla
  - [ ] Loading state (skeletons)
  - [ ] Empty state (sin noticias)

- [ ] Implementar filtros
  - [ ] Select estado (draft, published, all)
  - [ ] Select categoría
  - [ ] Input búsqueda (debounced)
  - [ ] Aplicar filtros a URL query params

- [ ] Implementar paginación
  - [ ] Botones Anterior/Siguiente
  - [ ] Select de items por página (10, 25, 50)
  - [ ] Mostrar "Mostrando X-Y de Z"

- [ ] Implementar sorting
  - [ ] Click en header de columna
  - [ ] Icono de dirección (asc/desc)
  - [ ] Persistir en URL query params

### Acciones en Tabla
- [ ] Botón "Editar" (Link a `/admin/noticias/[id]/editar`)
- [ ] Botón "Publicar/Despublicar" (toggle directo)
  - [ ] Confirmación modal
  - [ ] Actualizar lista después de acción
- [ ] Botón "Borrar" (con confirmación)
  - [ ] Modal de confirmación
  - [ ] Actualizar lista después de borrar
- [ ] Botón "Preview" (abrir en nueva pestaña)

### Diseño Visual
- [ ] Aplicar estilos de ETF Nexo (colores, tipografía)
- [ ] Iconos con Lucide React
- [ ] Badges de estado (draft: amarillo, published: verde)
- [ ] Hover effects en filas
- [ ] Responsive design (mobile-friendly)

---

## 📅 FASE 3: Editor de Noticias (Semana 2-3)

### Instalación de Dependencias
- [ ] Instalar TipTap: `pnpm add @tiptap/react @tiptap/starter-kit`
- [ ] Instalar extensiones: `@tiptap/extension-image @tiptap/extension-link`
- [ ] Instalar React Hook Form: `pnpm add react-hook-form`
- [ ] Instalar Zod: `pnpm add zod @hookform/resolvers`

### Formulario de Creación
- [ ] Crear `/app/admin/noticias/nueva/page.tsx`
  - [ ] Setup de React Hook Form
  - [ ] Validación con Zod schema
  - [ ] Submit handler (POST a API)
  - [ ] Success/error notifications

- [ ] Input Título
  - [ ] Required
  - [ ] 5-150 caracteres
  - [ ] Auto-generar slug (mostrar debajo)

- [ ] Textarea Resumen (Excerpt)
  - [ ] Required
  - [ ] 50-300 caracteres
  - [ ] Contador de caracteres

- [ ] Select Categoría
  - [ ] Fetch categorías desde API
  - [ ] Required

- [ ] Input Autor
  - [ ] Auto-rellenar desde perfil
  - [ ] Editable

- [ ] Editor TipTap
  - [ ] Toolbar con formatos (Bold, Italic, H1, H2, H3)
  - [ ] Botón insertar link
  - [ ] Botón insertar imagen
  - [ ] Validación mínimo 500 caracteres

- [ ] Upload Imagen Destacada
  - [ ] Botón "Subir imagen"
  - [ ] Preview de imagen
  - [ ] Botón "Cambiar" y "Eliminar"
  - [ ] Input alternativo: URL manual

- [ ] Multi-select Tags
  - [ ] Autocomplete de tags existentes
  - [ ] Botón "Crear tag nuevo"
  - [ ] Pills removibles

- [ ] Autocomplete ETFs Relacionados
  - [ ] Buscar por ticker o nombre
  - [ ] Seleccionar múltiples
  - [ ] Pills removibles

### Formulario de Edición
- [ ] Crear `/app/admin/noticias/[id]/editar/page.tsx`
  - [ ] Fetch artículo existente
  - [ ] Pre-rellenar todos los campos
  - [ ] Submit handler (PUT a API)
  - [ ] Mismo diseño que crear

### Auto-guardado
- [ ] Implementar debounced auto-save (cada 30s)
- [ ] Guardar en `localStorage` como backup
- [ ] Indicador "Guardando..." / "Guardado"
- [ ] Recuperar borrador si se cierra sin guardar

### Previsualización
- [ ] Botón "👁️ Preview"
- [ ] Abrir modal o sidebar
- [ ] Renderizar con mismo componente que frontend público
- [ ] Actualizar en tiempo real

### Botones de Acción
- [ ] Botón "← Volver" (sin guardar)
- [ ] Botón "💾 Guardar Borrador"
- [ ] Botón "🚀 Publicar"
- [ ] Confirmaciones si hay cambios sin guardar

---

## 📅 FASE 4: SEO y Mejoras (Semana 3)

### SEO Avanzado
- [ ] Sección expandible "SEO Avanzado"
  - [ ] Input Meta Título (con contador 60 chars)
  - [ ] Textarea Meta Descripción (con contador 160 chars)
  - [ ] Auto-generar desde título/excerpt si vacíos

- [ ] Preview de Google Search Results
  - [ ] Componente visual tipo Google
  - [ ] Actualizar en tiempo real

- [ ] Sugerencias de mejora
  - [ ] Avisar si título muy corto/largo
  - [ ] Avisar si falta imagen destacada
  - [ ] Avisar si contenido < 500 palabras

### Optimización de Imágenes
- [ ] Crear bucket `article-images` en Supabase
- [ ] Implementar resize automático (Sharp)
  - [ ] 1200x630 para OG image
  - [ ] 800x450 para thumbnails
- [ ] Compresión automática (calidad 85%)
- [ ] Generar URL pública

### Validaciones Avanzadas
- [ ] Título: 5-150 caracteres (REQUIRED)
- [ ] Excerpt: 50-300 caracteres (REQUIRED)
- [ ] Contenido: Mínimo 500 caracteres (WARNING)
- [ ] Categoría: Obligatoria (REQUIRED)
- [ ] Imagen destacada: Recomendada (WARNING)
- [ ] Tags: Mínimo 1 (WARNING)

### UX Improvements
- [ ] Loading spinners en botones de acción
- [ ] Toasts de notificación (éxito/error)
- [ ] Confirmación antes de salir con cambios
- [ ] Atajos de teclado (Cmd+S para guardar)

---

## 📅 FASE 5: Redactores IA (Semana 4)

### API para Redactores IA
- [ ] Crear `/api/v1/ai-writers/submit/route.ts`
  - [ ] POST: Recibir artículo generado por IA
  - [ ] Validar campos requeridos
  - [ ] Crear artículo con `status: 'pending_review'`
  - [ ] Guardar metadata en `ai_generated_content`
  - [ ] Retornar article_id

- [ ] Crear `/api/v1/ai-writers/status/[id]/route.ts`
  - [ ] GET: Consultar estado de revisión
  - [ ] Retornar needs_review, reviewed_by, etc.

### Autenticación para Redactores IA
- [ ] Crear sistema de API Keys
  - [ ] Tabla `ai_writer_api_keys`
  - [ ] Generar API key único por agente
  - [ ] Validar API key en endpoint

### Workflow de Revisión
- [ ] Crear `/app/admin/noticias/revisar-ia/page.tsx`
  - [ ] Filtro especial: `needs_review = true`
  - [ ] Badge "🤖 Generado por IA"
  - [ ] Mostrar confidence_score
  - [ ] Mostrar generation_prompt

- [ ] Botones de acción en revisión
  - [ ] "✅ Aprobar y publicar" (publish directo)
  - [ ] "✏️ Editar antes de publicar" (va a editor)
  - [ ] "❌ Rechazar" (no publicar, marcar como rechazado)

### Tracking y Analytics IA
- [ ] Dashboard de contenido IA
  - [ ] Total artículos generados por IA
  - [ ] Tasa de aprobación
  - [ ] Artículos por agente
  - [ ] Confidence score promedio

### Documentación
- [ ] Crear `docs/AI_WRITERS_GUIDE.md`
  - [ ] Cómo obtener API key
  - [ ] Ejemplos de requests con curl
  - [ ] Schema JSON completo
  - [ ] Mejores prácticas
  - [ ] Troubleshooting

---

## 📅 FASE 6: Analytics (Semana 5)

### Dashboard de Métricas
- [ ] Crear `/app/admin/analytics/page.tsx`
  - [ ] Fetch de datos de analytics
  - [ ] Gráficos con Recharts
  - [ ] Cards de métricas clave

### Métricas Clave
- [ ] Card: Total de artículos
- [ ] Card: Total de vistas (este mes)
- [ ] Card: Artículos publicados (últimos 7 días)
- [ ] Card: Vistas promedio por artículo

### Gráficos
- [ ] Gráfico de línea: Vistas por día (últimos 30 días)
- [ ] Gráfico de barras: Top 10 artículos más vistos
- [ ] Gráfico de pie: Artículos por categoría

### Tabla Top Artículos
- [ ] Top 10 artículos más vistos
  - [ ] Título
  - [ ] Vistas
  - [ ] Fecha publicación
  - [ ] Link a artículo

### Contador de Vistas
- [ ] Crear `/api/v1/noticias/[slug]/view/route.ts`
  - [ ] POST: Incrementar views_count
  - [ ] Prevenir múltiples conteos (sessionStorage)
  - [ ] Rate limiting

- [ ] Integrar en página pública
  - [ ] Llamar API en `useEffect`
  - [ ] Solo contar en client-side

---

## 📅 FASE 7: Features Avanzadas (Semana 6)

### Publicaciones Programadas
- [ ] Input fecha/hora en formulario
  - [ ] DatePicker component
  - [ ] TimePicker component
  - [ ] Validar fecha futura

- [ ] Guardar en `scheduled_publications`
- [ ] Crear Edge Function para publicar automáticamente
  - [ ] Cron job cada 5 minutos
  - [ ] Buscar `scheduled_for <= NOW()`
  - [ ] Actualizar `status = 'published'`

### Historial de Revisiones
- [ ] Sidebar en editor
  - [ ] Lista de revisiones (fecha + editor)
  - [ ] Botón "Ver" para cada revisión

- [ ] Modal de comparación
  - [ ] Diff visual de cambios
  - [ ] Botón "Restaurar esta versión"

### Búsqueda Avanzada
- [ ] Full-text search con PostgreSQL
  - [ ] Buscar en título, excerpt, content
  - [ ] Usar tsvector de español
  - [ ] Ranking de resultados

- [ ] Filtros combinados
  - [ ] Estado + Categoría + Fecha
  - [ ] Tags
  - [ ] Autor

### Exportar/Importar
- [ ] Exportar a CSV
  - [ ] Botón en lista de noticias
  - [ ] Incluir todos los campos
  - [ ] Descargar archivo

- [ ] Importar desde CSV
  - [ ] Upload de archivo CSV
  - [ ] Validar estructura
  - [ ] Bulk insert

---

## 🧪 Testing y QA

### Testing Manual
- [ ] Probar CRUD completo de noticias
- [ ] Probar autenticación (login/logout)
- [ ] Probar roles (admin vs redactor)
- [ ] Probar upload de imágenes
- [ ] Probar auto-guardado
- [ ] Probar previsualización
- [ ] Probar publicar/despublicar
- [ ] Probar filtros y búsqueda
- [ ] Probar paginación
- [ ] Probar en mobile

### Testing de Integración
- [ ] API retorna datos correctos
- [ ] RLS policies funcionan
- [ ] Triggers se ejecutan
- [ ] Auto-revisiones se crean
- [ ] Imágenes se suben correctamente
- [ ] Slugs únicos se generan

### Performance
- [ ] Lazy loading de imágenes
- [ ] Debouncing en búsqueda
- [ ] Optimistic updates en tabla
- [ ] Cache de categorías/tags
- [ ] Índices en queries lentas

---

## 🚀 Deploy a Producción

### Preparación
- [ ] Aplicar migraciones a producción
- [ ] Verificar variables de entorno
- [ ] Crear usuario admin inicial
- [ ] Crear API keys para redactores IA

### Deploy
- [ ] Merge a `main`
- [ ] Verificar build en Vercel
- [ ] Probar en producción
- [ ] Monitorear errores (Sentry)

### Documentación
- [ ] Crear guía de usuario para redactores
- [ ] Crear guía de API para redactores IA
- [ ] Actualizar README.md

---

## 📊 Métricas de Éxito

### MVP (Final Fase 3)
- [ ] ✅ Al menos 1 redactor puede crear noticias
- [ ] ✅ Publicar/despublicar funciona
- [ ] ✅ Upload de imágenes funciona
- [ ] ✅ Preview funciona

### Listo para IA (Final Fase 5)
- [ ] ✅ API de redactores IA documentada
- [ ] ✅ Workflow de revisión funciona
- [ ] ✅ Al menos 1 artículo IA aprobado

### Producto Completo (Final Fase 7)
- [ ] ✅ Analytics dashboard funcional
- [ ] ✅ 10+ noticias propias publicadas
- [ ] ✅ Sistema de roles completo
- [ ] ✅ Redactores IA integrados

---

**Estado**: Pendiente de inicio
**Última actualización**: 2026-08-12
