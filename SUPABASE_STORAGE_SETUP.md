# Configuración de Supabase Storage para Banners

## ⚠️ IMPORTANTE: Configuración requerida

**Este paso es OBLIGATORIO antes de usar la función de subida de imágenes.**

### 🚀 Instalación rápida

Ejecuta el script de migración en Supabase Dashboard > SQL Editor:

```sql
-- Ver archivo: supabase/migrations/20260916_setup_storage_banners.sql
```

O usa Supabase CLI:
```bash
supabase db push
```

## Bucket necesario: `public`

El sistema de publicidad usa el bucket `public` de Supabase Storage para almacenar imágenes de banners.

### Estructura de directorios

```
public/
├── avatars/          # Avatares de usuarios y agentes
└── media/            # Imágenes de publicidad y medios (NUEVO)
```

**Nota importante:** El directorio se llama `media/` en lugar de `banners/` para evitar que los bloqueadores de anuncios bloqueen las URLs.

### Configuración del bucket

1. **Nombre**: `public`
2. **Public**: Sí (permitir acceso público a las imágenes)
3. **File size limit**: 50 MB (permite banners hasta 5MB)
4. **Allowed MIME types**: 
   - image/jpeg
   - image/png
   - image/webp
   - image/gif

### Políticas de acceso (RLS)

El bucket `public` debe tener estas políticas:

#### SELECT (lectura pública)
```sql
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'public');
```

#### INSERT (subida autenticada)
```sql
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'public');
```

#### DELETE (solo propietario)
```sql
CREATE POLICY "Users can delete own files"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'public' AND auth.uid() = owner);
```

### Verificar configuración

Ejecuta en Supabase Dashboard > SQL Editor:

```sql
-- Ver buckets existentes
SELECT * FROM storage.buckets WHERE name = 'public';

-- Ver políticas de acceso
SELECT * FROM storage.policies WHERE bucket_id = 'public';
```

### Si necesitas crear el bucket

```sql
-- Crear bucket public si no existe
INSERT INTO storage.buckets (id, name, public)
VALUES ('public', 'public', true)
ON CONFLICT (id) DO NOTHING;
```

## Uso en la aplicación

### Componente BannerImageUpload

```tsx
<BannerImageUpload
  currentImageUrl={formData.image_url || null}
  onImageChange={(url) => setFormData({ ...formData, image_url: url })}
  campaignName={formData.name}
/>
```

### Estructura de archivos subidos

Los archivos se guardan con este formato:
```
media/{campaign-name-sanitized}-{timestamp}.{ext}

Ejemplo:
media/banner-sidebar-principal-1704123456789.jpg
```

### Validaciones

- **Tipos permitidos**: JPG, PNG, WebP, GIF
- **Tamaño máximo**: 5 MB
- **Nombre**: Se sanitiza y se agrega timestamp para evitar colisiones

## URLs generadas

Las imágenes subidas generan URLs públicas del tipo:

```
https://[project-ref].supabase.co/storage/v1/object/public/public/media/[filename]
```

Estas URLs se guardan en el campo `image_url` de la tabla `ads`.
