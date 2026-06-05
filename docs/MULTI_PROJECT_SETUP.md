# Sistema Multi-Proyecto - ETF Nexo

Guía completa para trabajar con múltiples proyectos en paralelo sin conflictos de configuración.

## 🎯 Problema Resuelto

Cuando trabajas con múltiples proyectos que usan:
- Diferentes cuentas de Supabase
- Diferentes cuentas de Vercel
- Diferentes repositorios de GitHub
- Diferentes SSH keys

Las configuraciones globales pueden causar conflictos. Este sistema aísla cada proyecto.

## 📁 Estructura de Aislamiento

```
/home/suario/ruy/  (ETF Nexo)
├── .env.local                    # Variables de entorno (NUNCA commitear)
├── .vercel/                      # Configuración Vercel (automática)
│   ├── project.json             # ID del proyecto
│   └── .env.*.local             # Variables Vercel
├── .supabase-config/            # Configuración Supabase local
│   ├── config.toml              # Config del proyecto
│   └── access_token             # Token de acceso (NUNCA commitear)
├── .git/config                   # Git config local (override global)
├── activate-project.sh          # Script de activación
└── bin/                          # Wrappers de comandos
    ├── supabase-etf             # Supabase aislado
    └── vercel-etf               # Vercel aislado
```

## 🚀 Uso Diario

### Opción 1: Activar Contexto (Recomendado)

Cada vez que abras una terminal para trabajar en ETF Nexo:

```bash
# Ir al proyecto
cd /home/suario/ruy

# Activar contexto
source activate-project.sh
```

Esto configurará:
- ✅ Variables de entorno del proyecto
- ✅ Git con user/email específicos
- ✅ Aliases útiles (`dev-etf`, `deploy-etf`, etc.)
- ✅ SSH key correcta para GitHub

**Comandos disponibles después de activar:**
```bash
dev-etf          # pnpm dev
build-etf        # pnpm build
deploy-etf       # vercel --prod
supabase-etf     # supabase (con config local)
vercel-etf       # vercel (con config local)
```

**Desactivar cuando termines:**
```bash
deactivate-etf
```

### Opción 2: Usar Wrappers Directamente

Sin activar el contexto, puedes usar los wrappers:

```bash
cd /home/suario/ruy

# Comandos Supabase
./bin/supabase-etf db push --linked
./bin/supabase-etf functions deploy fetch-news

# Comandos Vercel
./bin/vercel-etf --prod
./bin/vercel-etf ls

# Git (usa configuración local automáticamente)
git push origin main
```

## 🔧 Configuración por Componente

### 1. Supabase CLI

**Configuración Aislada:**
- **Workdir**: Siempre usa el directorio del proyecto
- **Access Token**: Guardado en `.supabase-config/access_token`
- **Project Ref**: `utvioubcqkwwzvufhups`

**Comandos:**
```bash
# Con contexto activado
supabase-etf db push --linked
supabase-etf gen types typescript --linked

# Sin contexto
./bin/supabase-etf db push --linked
```

### 2. Vercel

**Configuración Aislada:**
- **Project ID**: Almacenado en `.vercel/project.json`
- **Env Variables**: En `.vercel/.env.*.local`
- **Auth**: Usa auth global de Vercel (no conflictúa)

**Comandos:**
```bash
# Con contexto activado
vercel-etf --prod
vercel-etf ls

# Sin contexto
./bin/vercel-etf --prod
```

### 3. Git

**Configuración Local (`.git/config`):**
```ini
[user]
    name = ETF Nexo
    email = dev@etfnexo.com
[core]
    sshCommand = ssh -i ~/.ssh/id_ed25519_github
[remote "origin"]
    url = git@github.com:ruyx/ETFNEXO.git
```

Esta configuración **override** la global, así que:
- Commits con user correcto
- Push con SSH key correcta
- Remote específico del proyecto

**Comandos Git normales funcionan:**
```bash
cd /home/suario/ruy
git add .
git commit -m "Cambios"
git push origin main  # Usa SSH key de ETF Nexo automáticamente
```

### 4. Variables de Entorno

**Archivo: `.env.local`** (NUNCA commitear)
```env
NEXT_PUBLIC_SUPABASE_URL=https://utvioubcqkwwzvufhups.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
```

**Carga automática:**
- Next.js las carga automáticamente
- El script `activate-project.sh` las exporta al shell

## 🔀 Cambiar Entre Proyectos

### Proyecto 1: ETF Nexo

```bash
cd /home/suario/ruy
source activate-project.sh

# Trabajar...
dev-etf
git commit -m "Feature X"
git push

# Terminar
deactivate-etf
```

### Proyecto 2: Otro Proyecto

```bash
cd /home/suario/otro-proyecto
source activate-project.sh  # Su propio script

# Trabajar con su propia config...
git commit -m "Feature Y"
git push  # Usa su propia SSH key

deactivate
```

**No hay conflictos** porque cada proyecto tiene:
- Su propio `.env.local`
- Su propio `.git/config`
- Su propio `.vercel/`
- Su propio `.supabase-config/`

## 🛡️ Seguridad

### Archivos NUNCA Commiteados:

```gitignore
# Variables de entorno
.env.local
.env*.local

# Tokens de acceso
.supabase-config/access_token

# Configuración Vercel con secrets
.vercel/.env*

# Claves privadas
*.pem
*.key
```

### SSH Keys por Proyecto

Si tienes diferentes cuentas de GitHub:

**ETF Nexo:**
```bash
# .git/config
[core]
    sshCommand = ssh -i ~/.ssh/id_ed25519_github
```

**Otro Proyecto:**
```bash
# .git/config
[core]
    sshCommand = ssh -i ~/.ssh/id_ed25519_other
```

## 📋 Checklist Setup Nuevo Proyecto

Para replicar este sistema en otro proyecto:

- [ ] Copiar `activate-project.sh` (modificar variables)
- [ ] Crear `bin/supabase-{proyecto}` wrapper
- [ ] Crear `bin/vercel-{proyecto}` wrapper
- [ ] Crear `.supabase-config/config.toml`
- [ ] Configurar `.git/config` local:
  ```bash
  git config user.name "Proyecto X"
  git config user.email "dev@proyecto.com"
  git config core.sshCommand "ssh -i ~/.ssh/id_proyecto"
  ```
- [ ] Copiar `.env.example` a `.env.local` (con credenciales del proyecto)
- [ ] Actualizar `.gitignore`

## 🐛 Troubleshooting

### "Permission denied" en Git push

**Causa**: Usando SSH key incorrecta

**Solución:**
```bash
cd /home/suario/ruy
git config core.sshCommand "ssh -i ~/.ssh/id_ed25519_github"
git push origin main
```

### Supabase usa proyecto incorrecto

**Causa**: No está usando el wrapper o workdir incorrecto

**Solución:**
```bash
# Usar wrapper
./bin/supabase-etf db push --linked

# O activar contexto
source activate-project.sh
supabase-etf db push --linked
```

### Vercel despliega a proyecto incorrecto

**Causa**: No estás en el directorio correcto

**Solución:**
```bash
cd /home/suario/ruy  # IMPORTANTE
vercel --prod
```

### Variables de entorno no se cargan

**Causa**: `.env.local` no existe o tiene nombre incorrecto

**Solución:**
```bash
cd /home/suario/ruy
cp .env.example .env.local
# Editar con credenciales correctas
```

## 📊 Comparación: Global vs Local

| Componente | Configuración Global | Configuración Local (Este Sistema) |
|------------|---------------------|-----------------------------------|
| Supabase | `~/.supabase/` | `.supabase-config/` + wrapper |
| Vercel | Auth global ✅ | `.vercel/project.json` |
| Git User | `~/.gitconfig` | `.git/config` (override) |
| SSH Key | Una sola | Por proyecto en `.git/config` |
| Env Vars | Sistema | `.env.local` |
| NPM Scripts | N/A | Aliases en `activate-project.sh` |

## 🎓 Mejores Prácticas

1. **Siempre activar contexto** al empezar a trabajar
2. **Desactivar al terminar** o cambiar de proyecto
3. **Verificar proyecto activo** antes de hacer push/deploy
4. **NUNCA commitear** archivos `.env*`
5. **Usar wrappers** para Supabase y Vercel
6. **Probar en local** antes de deploy

## 📚 Referencias

- [Documentación Supabase CLI](https://supabase.com/docs/guides/cli)
- [Documentación Vercel CLI](https://vercel.com/docs/cli)
- [Git Config Scopes](https://git-scm.com/docs/git-config#_configuration_file)

---

**Última actualización:** 2026-06-05
