import { readFileSync } from 'fs';

const content = readFileSync('/tmp/blackrock-etfs.csv', 'utf-8');
const lines = content.split('\n');

const msciLine = lines.find(l => l.includes('IE00B4L5Y983'));

if (msciLine) {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < msciLine.length; i++) {
    const char = msciLine[i];
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

  const cleaned = fields.map(f => f.replace(/^"|"$/g, '').trim());

  console.log('📊 MSCI World ETF - Análisis completo de campos:\n');
  console.log(`Nombre: ${cleaned[1]}`);
  console.log(`ISIN: ${cleaned[5]}\n`);

  // Mostrar todos los campos que parecen relevantes
  console.log('Campos con valores numéricos pequeños (posible TER):');
  cleaned.forEach((field, idx) => {
    if (field && field !== '-') {
      const val = parseFloat(field.replace(/\./g, '').replace(',', '.'));
      if (!isNaN(val) && val > 0 && val < 10 && field.length < 10) {
        console.log(`  [${idx}] = "${field}" -> ${val}`);
      }
    }
  });

  console.log('\nCampos con valores grandes (posible AUM):');
  cleaned.forEach((field, idx) => {
    if (field && field !== '-') {
      const val = parseFloat(field.replace(/\./g, '').replace(',', '.'));
      if (!isNaN(val) && val > 1000) {
        console.log(`  [${idx}] = "${field}" -> ${val.toLocaleString()}`);
      }
    }
  });

  console.log('\nCampos específicos de interés:');
  [0, 1, 5, 22, 41, 42, 43, 48].forEach(idx => {
    console.log(`  [${idx}] = "${cleaned[idx]}"`);
  });
}
