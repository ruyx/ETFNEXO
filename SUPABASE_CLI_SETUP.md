# Configuración Completa de Supabase CLI

## 🎯 Objetivo

Configurar Supabase CLI para tener control total sobre el proyecto `utvioubcqkwwzvufhups` sin restricciones.

---

## ✅ Estado Actual

- ✅ Supabase CLI instalado (v2.90.0)
- ✅ Configuración local creada (`supabase/config.toml`)
- ✅ Scripts de migración listos
- ❌ Personal Access Token falta configurar

---

## 🔧 Configuración (3 Pasos - 5 minutos)

### Paso 1: Generar Personal Access Token

1. **Abre el dashboard de Supabase:**
   ```
   https://supabase.com/dashboard/account/tokens
   ```

2. **IMPORTANTE**: Asegúrate de estar logueado con la cuenta que tiene acceso a:
   ```
   Project ID: utvioubcqkwwzvufhups
   Project Name: (el que corresponda)
   ```

3. **Genera el token:**
   - Click en **"Generate New Token"**
   - Nombre: `ETF Nexo CLI`
   - **Copia el token** (formato: `sbp_...`)

---

### Paso 2: Agregar Token a .env.local

Edita el archivo `.env.local` y busca esta línea:

```bash
#SUPABASE_ACCESS_TOKEN=sbp_GENERA_TOKEN_AQUI
```

Reemplázala por (descomentando y pegando tu token):

```bash
SUPABASE_ACCESS_TOKEN=sbp_tu_token_real_aqui
```

**Guarda el archivo**.

---

### Paso 3: Ejecutar Script de Configuración

Ejecuta el script automatizado:

```bash
bash configure-supabase-cli.sh
```

Este script:
1. ✅ Verifica el token
2. ✅ Valida acceso al proyecto
3. ✅ Vincula Supabase CLI con el proyecto
4. ✅ Aplica migraciones SQL
5. ✅ Pobla la base de datos con ETFs

---

## 🎉 Resultado Final

Al completar los 3 pasos, tendrás **Supabase CLI completamente funcional** con:

### Comandos Disponibles

```bash
# Migraciones
supabase db push              # Aplicar migraciones locales → remoto
supabase db pull              # Obtener schema remoto → local
supabase db diff              # Ver diferencias entre local y remoto
supabase db reset             # Resetear base de datos local

# Edge Functions
supabase functions deploy     # Desplegar funciones serverless
supabase functions list       # Listar funciones
supabase functions logs       # Ver logs de funciones

# Tipos TypeScript
supabase gen types typescript # Generar tipos desde schema

# Status
supabase status               # Ver estado del proyecto
supabase db dump              # Dump completo de la base de datos
```

---

## 🔍 Verificación

Después de ejecutar el script, verifica:

### 1. Proyecto Vinculado

```bash
cat supabase/.temp/project-ref
```
Debe mostrar: `utvioubcqkwwzvufhups`

### 2. Tablas Creadas

```bash
supabase db dump --data-only | grep "INSERT INTO"
```

### 3. ETFs Poblados

Consulta en Supabase Dashboard:
```sql
SELECT COUNT(*) FROM etfs;
```
Debe mostrar: **5 ETFs**

---

## 🛠️ Troubleshooting

### Error: "Token NO tiene acceso al proyecto"

**Causa:** El token es de otra cuenta/organización.

**Solución:**
1. Verifica que estés logueado en la cuenta correcta en https://supabase.com/dashboard
2. El proyecto `utvioubcqkwwzvufhups` debe aparecer en tu lista de proyectos
3. Genera un nuevo token desde esa cuenta

---

### Error: "Network is unreachable" (IPv6)

**Causa:** Restricción de red IPv6 (conocida).

**Solución:** El script usa la API REST de Supabase que **SÍ funciona**. No necesitas conexión directa a PostgreSQL.

---

### Error al ejecutar `supabase db push`

**Causa 1:** Token expirado

**Solución:** Genera un nuevo token (Paso 1)

**Causa 2:** Proyecto no vinculado

**Solución:**
```bash
export SUPABASE_ACCESS_TOKEN=tu_token
supabase link --project-ref utvioubcqkwwzvufhups
```

---

## 📊 Estructura de Archivos

```
/home/suario/ruy/
├── .env.local                    ← EDITAR AQUÍ (Paso 2)
├── configure-supabase-cli.sh     ← EJECUTAR AQUÍ (Paso 3)
├── supabase/
│   ├── config.toml               ✅ Configurado
│   ├── .temp/project-ref         ✅ Se crea automáticamente
│   └── migrations/
│       └── 20260603000002_*.sql  ✅ Listas para aplicar
├── scripts/
│   └── setup-and-populate.ts     ✅ Población automática
└── ~/.supabase/
    └── access-token              ✅ Token guardado aquí
```

---

## 🔐 Seguridad

- ✅ El token se guarda en `~/.supabase/access-token` con permisos `600` (solo lectura para ti)
- ✅ `.env.local` está en `.gitignore` (no se sube a Git)
- ✅ El token tiene los mismos permisos que tu cuenta de Supabase
- ⚠️ **NO compartas** el token con nadie
- ⚠️ **NO subas** .env.local a repositorios públicos

---

## 📝 Diferencia: Personal Access Token vs Service Role Key

| Característica | Personal Access Token | Service Role Key |
|----------------|----------------------|------------------|
| **Propósito** | Supabase CLI, Management API | Backend queries, Admin operations |
| **Formato** | `sbp_...` | `eyJ...` (JWT) |
| **Dónde se usa** | Variable `SUPABASE_ACCESS_TOKEN` | Variable `SUPABASE_SERVICE_ROLE_KEY` |
| **Generación** | Dashboard → Account → Tokens | Dashboard → Project → Settings → API |
| **Permisos** | Gestión de proyectos, migraciones | Bypass RLS, admin queries |

**Ambos son necesarios:**
- **Personal Access Token**: Para `supabase` CLI commands
- **Service Role Key**: Para scripts de población/backend

---

## ✨ Resumen

```bash
# 1. Generar token en Dashboard
open https://supabase.com/dashboard/account/tokens

# 2. Editar .env.local con tu token
nano .env.local

# 3. Ejecutar configuración automática
bash configure-supabase-cli.sh

# ✅ Listo! Supabase CLI funcionando al 100%
```

---

## 🎯 Próximos Pasos (Después del Setup)

1. **Verificar datos:**
   ```bash
   supabase db dump --data-only
   ```

2. **Desarrollar algoritmo de ranking:**
   - Performance Score (35%)
   - Cost Score (25%)
   - Liquidity Score (20%)
   - Community Score (20%)

3. **Crear API endpoints:**
   - `/api/v1/etfs`
   - `/api/v1/rankings`

4. **Desarrollar frontend:**
   - Catálogo de ETFs
   - Ranking en vivo
   - Detalles de ETF

---

**¿Listo para empezar?** → `bash configure-supabase-cli.sh` 🚀
