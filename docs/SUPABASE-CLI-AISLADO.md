# 🔐 Supabase CLI Aislado - ETF Nexo

## ⚠️ REGLA DE ORO

**NUNCA mezclar el CLI de Supabase entre proyectos diferentes.**

Este proyecto (ETF Nexo / Ruy) usa una **cuenta de Supabase separada** de otros proyectos (Xprinta, etc.).

---

## 📋 Cuentas Separadas

### Cuenta 1: Xprinta
- **Organización**: `fexwsukhjhrwurszwclp`
- **Proyectos**:
  - `xprinta-web-dev` (ejgtclbejfcfqaopcjzy)
  - `xprintapro` (bdotuurxrdksolhywapd)
  - `xprinta-montadores` (pgkmepwodeeqfqhwyhlo)
  - `supabase-xprinta-extranet` (thdvcwmygvtdhafbiwqy)

### Cuenta 2: ETF Nexo / Ruy (ESTA CUENTA)
- **Organización**: [POR DETERMINAR]
- **Proyecto**: `utvioubcqkwwzvufhups` (ETF Nexo)
- **URL**: https://utvioubcqkwwzvufhups.supabase.co

---

## 🔧 Configuración del CLI Aislado

### Opción 1: Usar SUPABASE_ACCESS_TOKEN (Recomendado para CI/CD)

```bash
# En .env.local (NO COMMITEAR)
export SUPABASE_ACCESS_TOKEN="sbp_[TU_PERSONAL_ACCESS_TOKEN]"
```

Generar token desde:
https://supabase.com/dashboard/account/tokens

**Nombre sugerido**: `ETF Nexo CLI - Ruy Project`

### Opción 2: Login Manual con Token

```bash
# Logout de cualquier sesión anterior
supabase logout

# Login con token específico de ETF Nexo
supabase login --token sbp_[TU_TOKEN_AQUI]

# Verificar que estás en la cuenta correcta
supabase projects list
# Debe mostrar SOLO el proyecto utvioubcqkwwzvufhups
```

### Opción 3: Usar por Proyecto (Recomendado para Desarrollo Local)

```bash
# Crear archivo .supabase/config.toml específico del proyecto
cd /home/suario/ruy
supabase link --project-ref utvioubcqkwwzvufhups

# Esto crea un archivo local que vincula este directorio al proyecto
```

---

## ✅ Verificación de Aislamiento

Después de configurar, SIEMPRE verificar:

```bash
supabase projects list
```

**Output esperado (SOLO ETF Nexo):**
```
LINKED | ORG ID          | REFERENCE ID         | NAME      | REGION
  ✓    | [org_id]        | utvioubcqkwwzvufhups | ETF Nexo  | West EU (Ireland)
```

**❌ Si ves proyectos de Xprinta, estás en la cuenta INCORRECTA.**

---

## 🚀 Despliegue de Edge Functions

Una vez configurado correctamente:

```bash
# Verificar que estás en ETF Nexo
supabase projects list | grep utvioubcqkwwzvufhups

# Desplegar Edge Function
supabase functions deploy scrape-article-content --project-ref utvioubcqkwwzvufhups
```

---

## 🔑 Claves del Proyecto ETF Nexo

**Ubicación**: `.env.local` (NO COMMITEAR)

```bash
# Supabase ETF Nexo (utvioubcqkwwzvufhups)
NEXT_PUBLIC_SUPABASE_URL=https://utvioubcqkwwzvufhups.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[JWT_ANON_KEY]
SUPABASE_SERVICE_ROLE_KEY=[JWT_SERVICE_ROLE_KEY]
```

**Formato nuevo de claves** (equivalentes):
- Publishable: `sb_publishable_XXXXXXXXXXXXXXXXXXXXXXX`
- Secret: `sb_secret_XXXXXXXXXXXXXXXXXXXXXXX`

Ambos formatos son válidos, pero el proyecto ya usa JWT tokens.

---

## ⚠️ Prevenir Confusión

### Antes de CUALQUIER comando de Supabase CLI:

```bash
# 1. Verificar proyecto actual
supabase projects list

# 2. Si NO ves utvioubcqkwwzvufhups:
supabase logout
supabase login --token [TOKEN_ETF_NEXO]

# 3. Confirmar de nuevo
supabase projects list | grep utvioubcqkwwzvufhups
```

---

## 📝 Generación de Personal Access Token

1. **Ir a**: https://supabase.com/dashboard/account/tokens
2. **Click en**: "Generate new token"
3. **Nombre**: `ETF Nexo CLI - Ruy Project`
4. **Scopes**: Seleccionar todos (All)
5. **Copiar token**: `sbp_...` (empieza con `sbp_`)
6. **Guardar en**: Gestor de contraseñas + `.env.local`

**NUNCA commitear el token a Git.**

---

## 🛡️ Seguridad

- ✅ Tokens en `.env.local` (ignorado por `.gitignore`)
- ✅ CLI configurado por proyecto (`.supabase/config.toml`)
- ✅ Verificación pre-comando (`supabase projects list`)
- ❌ NUNCA commitear tokens
- ❌ NUNCA mezclar cuentas

---

## 📅 Última Actualización

- **Fecha**: 2026-06-26
- **Usuario**: Ruy
- **Proyecto**: ETF Nexo (`utvioubcqkwwzvufhups`)
- **Estado**: ✅ CLI CONFIGURADO Y FUNCIONANDO
- **Token usado**: `sbp_XXXXXXXXXXXXXXXXXXXXXXX` (guardado en .env.local)
- **Verificación**: `supabase projects list` muestra SOLO utvioubcqkwwzvufhups
- **Edge Function**: `scrape-article-content` desplegada exitosamente
- **Sistema de scraping**: ✅ OPERATIVO (98.6% éxito en 70 artículos)
