import { readFileSync } from 'fs';

const content = readFileSync('/tmp/blackrock-etfs.csv', 'utf-8');
const lines = content.split('\n');

// Primera línea de datos (índice 14)
const firstLine = lines[14];

if (firstLine) {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < firstLine.length; i++) {
    const char = firstLine[i];
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

  console.log('📊 Primer ETF (Japan Govt Bond) - Análisis:\n');
  console.log(`Nombre: ${cleaned[1]}`);
  console.log(`ISIN: ${cleaned[5]}\n`);

  console.log('Todos los campos:');
  cleaned.forEach((field, idx) => {
    if (field && field !== '-' && field.length > 0) {
      console.log(`  [${idx}] = "${field}"`);
    }
  });
}
