#!/usr/bin/env tsx

/**
 * Execute SQL via Supabase REST API
 * Workaround for blocked PostgreSQL direct connection
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function executeSqlFile(filePath: string) {
  console.log(`📄 Leyendo SQL desde: ${filePath}`);

  const sqlContent = readFileSync(filePath, 'utf-8');

  console.log(`📊 Ejecutando SQL (${sqlContent.length} caracteres)...`);
  console.log('');

  // Split SQL into individual statements
  const statements = sqlContent
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`📝 ${statements.length} statements encontrados`);
  console.log('');

  let successCount = 0;
  let errorCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i];

    // Extract statement type for logging
    const firstLine = statement.split('\n')[0].trim();
    const statementType = firstLine.split(' ').slice(0, 3).join(' ');

    console.log(`[${i + 1}/${statements.length}] ${statementType}...`);

    try {
      // Use rpc to execute raw SQL
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: statement + ';'
      });

      if (error) {
        // If exec_sql function doesn't exist, try creating it first
        if (error.message.includes('function') && error.message.includes('does not exist')) {
          console.log('   ⚠️  Función exec_sql no existe, intentando método alternativo...');

          // Try to create the function first
          const createFunctionSQL = `
            CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
            RETURNS void
            LANGUAGE plpgsql
            SECURITY DEFINER
            AS $$
            BEGIN
              EXECUTE sql_query;
            END;
            $$;
          `;

          // This will likely fail too, but let's try direct execution via fetch
          const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabaseKey,
              'Authorization': `Bearer ${supabaseKey}`,
              'Prefer': 'return=minimal'
            },
            body: JSON.stringify({ query: statement + ';' })
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${await response.text()}`);
          }

          console.log('   ✅ Ejecutado (método alternativo)');
          successCount++;
        } else {
          throw error;
        }
      } else {
        console.log('   ✅ Ejecutado');
        successCount++;
      }
    } catch (err: any) {
      console.error(`   ❌ Error: ${err.message}`);
      errorCount++;

      // Continue with next statement unless it's a critical error
      if (err.message.includes('already exists')) {
        console.log('   ℹ️  Objeto ya existe, continuando...');
      }
    }
  }

  console.log('');
  console.log('═══════════════════════════════════════════════');
  console.log(`✅ Exitosos: ${successCount}`);
  console.log(`❌ Errores: ${errorCount}`);
  console.log('═══════════════════════════════════════════════');
}

// Execute the setup SQL
const sqlFilePath = join(__dirname, '..', 'supabase', 'setup-complete.sql');
executeSqlFile(sqlFilePath).catch(err => {
  console.error('❌ Error fatal:', err.message);
  process.exit(1);
});
