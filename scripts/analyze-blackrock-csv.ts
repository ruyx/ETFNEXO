import { readFileSync } from 'fs';

const content = readFileSync('/tmp/blackrock-etfs.csv', 'utf-8');
const lines = content.split('\n');

console.log('📊 Análisis de estructura del CSV de BlackRock\n');
console.log(`Total de líneas: ${lines.length}`);
console.log(`Líneas de cabecera: 14`);
console.log(`Líneas de datos: ${lines.length - 14}\n`);

// Analizar una línea de datos (línea 15 = índice 14)
const dataLine = lines[14];
if (dataLine) {
  // Parsear manualmente para contar campos correctamente
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < dataLine.length; i++) {
    const char = dataLine[i];

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

  console.log(`Campos en primera línea de datos: ${fields.length}\n`);

  // Buscar campos que parezcan TER o AUM
  console.log('🔍 Buscando campos TER y AUM:\n');
  fields.forEach((field, idx) => {
    const cleaned = field.replace(/"/g, '').replace(/\n/g, ' ').trim();

    // Buscar números que parezcan AUM (millones)
    if (cleaned.match(/^\d{1,3}(\.\d{3})*,\d{2}$/) && parseFloat(cleaned.replace(/\./g, '').replace(',', '.')) > 100) {
      console.log(`  [${idx}] AUM posible: "${cleaned}"`);
    }

    // Buscar números pequeños que parezcan TER (%)
    if (cleaned.match(/^[\d,]+$/) && cleaned.length < 10) {
      const val = parseFloat(cleaned.replace(',', '.'));
      if (val > 0 && val < 5) {
        console.log(`  [${idx}] TER posible: "${cleaned}"`);
      }
    }
  });

  // Mostrar campos específicos que sabemos son importantes
  console.log('\n📋 Campos específicos de interés:');
  console.log(`  [0] Ticker: "${fields[0]?.replace(/"/g, '')}"`);
  console.log(`  [1] Nombre: "${fields[1]?.substring(0, 40)}..."`);
  console.log(`  [5] ISIN: "${fields[5]?.replace(/"/g, '')}"`);
  console.log(`  [42] Campo 42: "${fields[42]?.replace(/"/g, '').replace(/\n/g, ' ').trim()}"`);
  console.log(`  [43] Campo 43: "${fields[43]?.replace(/"/g, '').replace(/\n/g, ' ').trim()}"`);
  console.log(`  [44] Campo 44: "${fields[44]?.replace(/"/g, '').replace(/\n/g, ' ').trim()}"`);
  console.log(`  [48] Campo 48: "${fields[48]?.replace(/"/g, '').replace(/\n/g, ' ').trim()}"`);

  // Verificar con otro ETF conocido
  const msciLine = lines.find(l => l.includes('IE00B4L5Y983'));
  if (msciLine) {
    console.log('\n✅ Verificación con MSCI World ETF (IE00B4L5Y983):');
    const msciFields: string[] = [];
    let curr = '';
    let inQ = false;

    for (let i = 0; i < msciLine.length; i++) {
      const char = msciLine[i];
      if (char === '"') {
        inQ = !inQ;
      } else if (char === ',' && !inQ) {
        msciFields.push(curr);
        curr = '';
      } else {
        curr += char;
      }
    }
    msciFields.push(curr);

    console.log(`  [42] Campo 42: "${msciFields[42]?.replace(/"/g, '').replace(/\n/g, ' ').trim()}"`);
    console.log(`  [43] Campo 43: "${msciFields[43]?.replace(/"/g, '').replace(/\n/g, ' ').trim()}"`);
  }
}
