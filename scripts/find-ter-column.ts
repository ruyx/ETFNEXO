import { readFileSync } from 'fs';

const content = readFileSync('/tmp/blackrock-etfs.csv', 'utf-8');
const lines = content.split('\n');

// Parsear varias líneas de datos
const sampleETFs = [
  { name: 'MSCI World', search: 'IE00B4L5Y983', expectedTER: 0.20 },
  { name: 'S&P 500 Utilities', search: 'IE00B4KBBD01', expectedTER: 0.15 },
  { name: 'Japan Govt Bond', search: 'IE00056AT4A2', expectedTER: 0.05 }
];

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

console.log('🔍 Buscando la columna correcta del TER\n');

for (const etf of sampleETFs) {
  const line = lines.find(l => l.includes(etf.search));
  if (!line) continue;

  const fields = parseCSVLine(line);

  console.log(`\n${etf.name} (${etf.search})`);
  console.log(`TER esperado: ~${etf.expectedTER}%\n`);

  // Buscar en todas las columnas valores que parezcan TER
  const terCandidates: { col: number; raw: string; value: number }[] = [];

  fields.forEach((field, idx) => {
    if (field && field !== '-') {
      const normalized = field.replace(/\./g, '').replace(',', '.');
      const val = parseFloat(normalized);

      // TER típico está entre 0.01 y 3.0
      if (!isNaN(val) && val > 0.01 && val < 3.0 && field.length < 10) {
        terCandidates.push({ col: idx, raw: field, value: val });
      }
    }
  });

  console.log(`Candidatos a TER (valores 0.01-3.0):`);
  terCandidates.forEach(c => {
    const diff = Math.abs(c.value - etf.expectedTER);
    const match = diff < 0.05 ? ' ⭐ MATCH!' : '';
    console.log(`  [${c.col}] = "${c.raw}" -> ${c.value.toFixed(4)}${match}`);
  });
}

console.log('\n\n📊 Resumen de posibles columnas TER:');
console.log('Analizando todos los ETFs para encontrar patrones...\n');

// Analizar todas las líneas de datos
const columnStats: Map<number, { values: number[]; nonEmpty: number }> = new Map();

lines.slice(14, 100).forEach(line => {
  const fields = parseCSVLine(line);

  fields.forEach((field, idx) => {
    if (field && field !== '-') {
      const normalized = field.replace(/\./g, '').replace(',', '.');
      const val = parseFloat(normalized);

      if (!isNaN(val) && val > 0.01 && val < 3.0 && field.length < 10) {
        if (!columnStats.has(idx)) {
          columnStats.set(idx, { values: [], nonEmpty: 0 });
        }
        columnStats.get(idx)!.values.push(val);
        columnStats.get(idx)!.nonEmpty++;
      }
    }
  });
});

// Mostrar columnas que consistentemente tienen valores tipo TER
Array.from(columnStats.entries())
  .filter(([_, stats]) => stats.nonEmpty > 50) // Al menos 50 ETFs con valor
  .sort((a, b) => b[1].nonEmpty - a[1].nonEmpty)
  .slice(0, 5)
  .forEach(([col, stats]) => {
    const avg = stats.values.reduce((a, b) => a + b, 0) / stats.values.length;
    const min = Math.min(...stats.values);
    const max = Math.max(...stats.values);

    console.log(`Columna [${col}]:`);
    console.log(`  - ETFs con valor: ${stats.nonEmpty}`);
    console.log(`  - Promedio: ${avg.toFixed(4)}`);
    console.log(`  - Rango: ${min.toFixed(4)} - ${max.toFixed(4)}`);
    console.log('');
  });
