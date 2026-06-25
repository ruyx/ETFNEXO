/**
 * Script robusto para importar ETFs de BlackRock desde CSV de Google Sheets
 * Maneja correctamente CSVs con cabeceras multi-línea y valores con formato europeo
 *
 * Uso:
 * NEXT_PUBLIC_SUPABASE_URL=xxx SUPABASE_SERVICE_ROLE_KEY=xxx \
 * npx tsx scripts/import-blackrock-etfs-robust.ts /tmp/blackrock-etfs.csv
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import ws from 'ws';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Faltan variables de entorno SUPABASE');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  global: { fetch: fetch },
  realtime: { transport: ws as any }
});

// Parser CSV robusto que maneja comillas correctamente
function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);

  return fields.map(f => f.replace(/^"|"$/g, '').trim());
}

// Convertir valor europeo a número (ej: "43.664.783,61" -> 43664783.61)
function parseEuropeanNumber(value: string): number | null {
  if (!value || value === '-' || value === 'N/A') return null;

  try {
    // Remover comillas y espacios
    const cleaned = value.replace(/"/g, '').trim();

    // Convertir formato europeo: puntos como separadores de miles, coma como decimal
    const normalized = cleaned
      .replace(/\./g, '')  // Remover puntos (separadores de miles)
      .replace(',', '.');   // Convertir coma a punto decimal

    const parsed = parseFloat(normalized);
    return isNaN(parsed) ? null : parsed;
  } catch {
    return null;
  }
}

// Convertir TER de % a decimal (ej: "0,20" -> 0.0020)
function parseTER(value: string): number | null {
  const num = parseEuropeanNumber(value);
  if (num === null) return null;

  // Si el valor ya está en formato decimal (< 1), devolverlo como está
  // Si está en porcentaje (>= 1), dividir por 100
  return num >= 1 ? num / 100 : num;
}

// Convertir AUM a millones
function parseAUM(value: string): number | null {
  const num = parseEuropeanNumber(value);
  if (num === null) return null;

  // El CSV tiene valores ya en la escala correcta (millones)
  return num / 1000000; // Convertir a millones
}

async function importBlackRockETFs(csvPath: string) {
  console.log('🚀 Importación ROBUSTA de ETFs de BlackRock\n');
  console.log(`Archivo CSV: ${csvPath}\n`);

  // Leer archivo
  const content = readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter(l => l.trim());

  console.log(`📄 Total de líneas: ${lines.length}`);
  console.log(`📋 Saltando 14 líneas de cabecera...`);

  // Skip las primeras 14 líneas (cabeceras multi-línea)
  const dataLines = lines.slice(14);
  console.log(`✅ Líneas de datos a procesar: ${dataLines.length}\n`);

  let updated = 0;
  let inserted = 0;
  let errors = 0;
  let skipped = 0;

  for (const line of dataLines) {
    try {
      const fields = parseCSVLine(line);

      // Validar que tenemos suficientes campos
      if (fields.length < 43) {
        skipped++;
        continue;
      }

      const isin = fields[5];
      const name = fields[1];

      if (!isin || !name) {
        skipped++;
        continue;
      }

      // Obtener manager iShares
      const { data: manager } = await supabase
        .from('fund_managers')
        .select('id')
        .eq('name', 'iShares')
        .single();

      // Parsear datos
      const ticker = fields[0];
      const aum = parseAUM(fields[41]); // Column 41: Net Assets
      const ter = parseTER(fields[42]); // Column 42: TER

      const etfData = {
        isin,
        name,
        yahoo_ticker: ticker ? `${ticker}.L` : null,
        ter,
        aum_millions: aum,
        manager_id: manager?.id || null
      };

      // Upsert
      const { error } = await supabase
        .from('etfs')
        .upsert(etfData, {
          onConflict: 'isin',
          ignoreDuplicates: false
        });

      if (error) {
        console.error(`❌ Error ${isin}: ${error.message}`);
        errors++;
      } else {
        console.log(`🔄 Actualizado: ${name} (${isin}) - TER: ${ter?.toFixed(4) || 'N/A'}, AUM: ${aum?.toFixed(0) || 'N/A'}M`);
        updated++;
      }
    } catch (err: any) {
      errors++;
      console.error(`❌ Error procesando línea: ${err.message}`);
    }
  }

  console.log('\n✨ Importación completada:');
  console.log(`   - Actualizados: ${updated}`);
  console.log(`   - Insertados: ${inserted}`);
  console.log(`   - Errores: ${errors}`);
  console.log(`   - Saltados: ${skipped}`);

  // Estadísticas finales
  const { count: totalETFs } = await supabase
    .from('etfs')
    .select('*', { count: 'exact', head: true });

  const { count: withTER } = await supabase
    .from('etfs')
    .select('*', { count: 'exact', head: true })
    .not('ter', 'is', null);

  const { count: withAUM } = await supabase
    .from('etfs')
    .select('*', { count: 'exact', head: true })
    .not('aum_millions', 'is', null);

  console.log('\n📊 ESTADO FINAL:');
  console.log(`Total ETFs: ${totalETFs}`);
  console.log(`Con TER: ${withTER} (${((withTER || 0) / (totalETFs || 1) * 100).toFixed(1)}%)`);
  console.log(`Con AUM: ${withAUM} (${((withAUM || 0) / (totalETFs || 1) * 100).toFixed(1)}%)`);
}

// Ejecutar
const csvPath = process.argv[2] || '/tmp/blackrock-etfs.csv';
importBlackRockETFs(csvPath);
