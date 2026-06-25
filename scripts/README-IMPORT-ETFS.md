# Guía de Importación de ETFs desde Google Sheets

Este README explica cómo importar ETFs desde archivos CSV descargados de Google Sheets.

## 🎯 Objetivo

Importar ~800-1200 ETFs desde las hojas de cálculo de gestoras (BlackRock, Invesco, Vanguard, etc.) a la base de datos de ETFNexo.

## 📋 Pasos para Importar ETFs de BlackRock

### 1. Descargar el CSV desde Google Sheets

1. Abrir el Google Sheet de BlackRock:
   - https://docs.google.com/spreadsheets/d/e/2PACX-1vQyDCvm4ZMsKsFFBtba_QnGN3GAtsE6a8bLTWptf93KycJhOWRRrhaYte_e8PHe0g/pubhtml

   O el enlace compartido original:
   - https://docs.google.com/spreadsheets/d/1vmecsyl8tK1N8hjFGTsbbQY8jrknPLEd/edit

2. En el menú: **File → Download → Comma Separated Values (.csv)**

3. Guardar el archivo descargado en `/tmp/blackrock-etfs.csv`

### 2. Configurar Variables de Entorno

Asegurarse de que las variables de entorno estén configuradas:

```bash
export NEXT_PUBLIC_SUPABASE_URL="tu-supabase-url"
export SUPABASE_SERVICE_ROLE_KEY="tu-service-role-key"
```

O crear un archivo `.env.local` en la raíz del proyecto con:

```env
NEXT_PUBLIC_SUPABASE_URL=tu-supabase-url
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
```

### 3. Ejecutar el Script de Importación

```bash
# Opción 1: Usando el archivo por defecto /tmp/blackrock-etfs.csv
npx tsx scripts/import-blackrock-etfs.ts

# Opción 2: Especificando una ruta personalizada
npx tsx scripts/import-blackrock-etfs.ts /ruta/al/archivo.csv
```

### 4. Verificar la Importación

El script mostrará un resumen como:

```
============================================================
📊 RESUMEN DE IMPORTACIÓN
============================================================
✅ Nuevos ETFs importados: 750
🔄 ETFs actualizados:      52
⏭️  Filas omitidas:        0
❌ Errores:                0
📈 Total procesado:        802
============================================================

📊 Total de ETFs en base de datos: 841
```

## 📊 Estructura del CSV Esperado

El CSV de BlackRock debe tener las siguientes columnas (pueden estar en español):

- **Ticker** - Símbolo del ETF (ej: IUCS, SWDA)
- **Nombre** - Nombre del ETF
- **ISIN** - Código ISIN (obligatorio)
- **Domicilio** - País de domicilio (ej: Irlanda, Luxembourg)
- **Divisa** - Moneda (USD, EUR, GBP)
- **Total Expense Ratio** - TER en porcentaje
- **Fecha de lanzamiento** - Fecha de inicio
- **1Y (%)**, **3Y (%)**, **5Y (%)**, **10Y (%)** - Rendimientos históricos
- **Asset Class** - Clase de activo (Equity, Fixed Income, Commodities)
- **Sub Asset Class** - Subclase o sector
- **Región** - Región geográfica
- **Net Assets** - Activos bajo gestión (AUM)

## 🔧 Qué hace el Script

1. **Parsea el CSV** - Lee y procesa el archivo CSV línea por línea
2. **Mapea las columnas** - Convierte nombres en español a campos de BD
3. **Busca el manager** - Encuentra el ID de BlackRock en la tabla `managers`
4. **Transforma los datos**:
   - Convierte porcentajes a números decimales
   - Mapea Asset Class a categorías (equity/bond/commodity)
   - Mapea regiones a valores estándar (global/us/europe/emerging/asia/latin_america)
   - Formatea tickers para Yahoo Finance (añade `.L` por defecto)
5. **Importa con UPSERT** - Inserta nuevos o actualiza existentes basándose en ISIN
6. **Reporta resultados** - Muestra estadísticas detalladas

## 🚨 Notas Importantes

### Yahoo Ticker

El script asume **London Stock Exchange (`.L`)** por defecto para ETFs de iShares. Si algunos ETFs cotizan en otras bolsas:

- Amsterdam: `.AS`
- Xetra (Alemania): `.DE`
- Euronext París: `.PA`
- SIX Swiss Exchange: `.SW`

Puedes ajustar manualmente después de la importación con:

```sql
UPDATE etfs
SET yahoo_ticker = 'TICKER.AS'
WHERE isin = 'IE00XXXXXXXX';
```

### Validación de Datos

El script omitirá filas que:
- No tengan ISIN
- No tengan nombre

Todas las demás columnas son opcionales y se establecerán en `null` si faltan.

### Actualización vs Inserción

- **Upsert** usa ISIN como clave única
- Si el ISIN ya existe → **actualiza** los datos
- Si el ISIN es nuevo → **inserta** nuevo registro

## 📈 Próximos Pasos

Después de importar los ETFs de BlackRock:

1. **Importar otras gestoras**:
   - Crear scripts similares para Vanguard, Invesco, Xtrackers, etc.
   - O adaptar este script para manejar diferentes formatos de CSV

2. **Actualizar datos de mercado**:
   ```bash
   curl -X POST https://etfnexo.vercel.app/api/admin/update-etf-data
   ```
   Esto actualizará Return 1Y y Sharpe Ratio desde Yahoo Finance

3. **Verificar tickers**:
   - Revisar ETFs que no tienen datos actualizados
   - Ajustar `yahoo_ticker` si es necesario

## 🐛 Solución de Problemas

### Error: "Faltan variables de entorno SUPABASE"

Configurar las variables como se indica en el paso 2.

### Error: "No such file or directory"

Asegurarse de que el CSV está en la ruta especificada.

### Error: "Manager BlackRock no encontrado"

Crear el manager manualmente:

```sql
INSERT INTO managers (name, official_name, description, logo_url)
VALUES ('blackrock', 'BlackRock / iShares', 'BlackRock iShares ETFs', NULL);
```

### Muchos errores al importar

- Verificar que el CSV está correctamente formateado
- Comprobar que las columnas coinciden con lo esperado
- Revisar los logs de error para identificar problemas específicos

## 📞 Contacto

Si encuentras problemas, revisa:
1. Los logs del script (se muestran en consola)
2. Los datos del CSV (primeras 5 filas)
3. El schema de la base de datos

---

**Última actualización:** 2025-01-17
