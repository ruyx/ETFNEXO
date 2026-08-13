# 🔐 Simplificación de Autenticación - Usar Sistema Existente

**Decisión**: Usar el sistema de usuarios de Supabase Auth existente
**Beneficios**: Menos código, más rápido, más seguro

---

## 🎯 Cambios al Plan Original

### ❌ NO CREAR (Ya existe en Supabase)
- ~~Tabla `user_profiles`~~ → Usar `auth.users` directamente
- ~~Sistema de autenticación custom~~ → Usar Supabase Auth
- ~~Login page custom~~ → Usar Supabase UI o simple email/password

### ✅ SÍ CREAR (Simplificado)
- Middleware de autorización (verificar rol admin)
- Protected routes en Next.js
- Simple tabla `user_roles` para gestión de roles

---

## 📊 Estructura Simplificada

### Tabla Única de Roles (Nuevo)

```sql
-- Solo una tabla ligera para roles
CREATE TABLE IF NOT EXISTS user_roles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'redactor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Solo admins pueden gestionar roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can manage roles"
ON user_roles
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  )
);

-- Función helper para verificar si usuario es admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_id = auth.uid()
    AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔒 Middleware de Autorización

### `lib/auth/check-admin.ts`

```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function checkAdminAccess() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  // 1. Verificar si está autenticado
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/admin/login');
  }

  // 2. Verificar si es admin
  const { data: role } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single();

  if (role?.role !== 'admin') {
    redirect('/unauthorized');
  }

  return { user, role: role.role };
}
```

---

## 🛡️ Uso en Páginas Admin

### `app/admin/noticias/page.tsx`

```typescript
import { checkAdminAccess } from '@/lib/auth/check-admin';

export default async function NoticiasAdminPage() {
  // Verificar acceso admin (server-side)
  const { user } = await checkAdminAccess();

  return (
    <div>
      <h1>Noticias - Panel Admin</h1>
      <p>Bienvenido, {user.email}</p>
      {/* Resto del contenido */}
    </div>
  );
}
```

---

## 🔐 Login Simplificado

### `app/admin/login/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    // Verificar que el usuario sea admin
    const { data: role } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', data.user.id)
      .single();

    if (role?.role !== 'admin') {
      setError('No tienes permisos de administrador');
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    router.push('/admin/noticias');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">ETF Nexo Admin</h2>
          <p className="mt-2 text-center text-gray-600">
            Acceso solo para administradores
          </p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## 🎯 Actualización del Checklist FASE 1

### Nuevo Checklist Simplificado

**Migraciones de Base de Datos** (10 minutos)
- [x] ~~Crear `user_profiles`~~ → NO NECESARIO
- [ ] Crear solo `user_roles` (tabla simple)
- [ ] Crear función helper `is_admin()`
- [ ] Insertar rol admin para tu usuario actual

**Autenticación** (30 minutos)
- [ ] Crear `lib/auth/check-admin.ts`
- [ ] Crear página login `/admin/login/page.tsx`
- [ ] Crear página unauthorized `/unauthorized/page.tsx`
- [ ] Probar login con usuario existente

**Resto de API Routes** (sin cambios)
- [ ] `/api/v1/admin/noticias/list/route.ts`
- [ ] `/api/v1/admin/noticias/[id]/route.ts`
- [ ] etc. (igual que antes)

---

## 📝 Crear Usuario Admin Inicial

### SQL para crear tu primer admin

```sql
-- 1. Primero, crea tu usuario en Supabase Dashboard
--    Auth > Users > Add User
--    Email: tu-email@ejemplo.com
--    Password: tu-password-seguro

-- 2. Luego, asigna rol admin (reemplaza con tu user_id real)
INSERT INTO user_roles (user_id, role)
VALUES (
  (SELECT id FROM auth.users WHERE email = 'tu-email@ejemplo.com'),
  'admin'
);

-- Verificar que funcionó
SELECT u.email, ur.role
FROM auth.users u
LEFT JOIN user_roles ur ON u.id = ur.user_id
WHERE u.email = 'tu-email@ejemplo.com';
```

---

## ✅ Beneficios de Esta Aproximación

1. **Más rápido**: No crear sistema de auth desde cero
2. **Más seguro**: Usar Supabase Auth probado en producción
3. **Menos código**: Solo una tabla `user_roles` en lugar de sistema completo
4. **Escalable**: Fácil agregar más roles en el futuro
5. **Mantenible**: Menos superficie de ataque, menos bugs

---

## 🚀 Próximo Paso

1. **Ahora**: Aplicar migración de `user_roles`
2. **5 minutos**: Crear tu usuario admin en Supabase Dashboard
3. **10 minutos**: Implementar `check-admin.ts`
4. **15 minutos**: Crear página de login
5. **Continuar**: Con el resto de la Fase 1 (API Routes)

---

**Tiempo ahorrado**: ~2 días de desarrollo
**Complejidad reducida**: De 5 tablas a 1 tabla
**Listo para producción**: Usar sistema battle-tested de Supabase
