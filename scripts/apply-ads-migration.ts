// ============================================
// Script para aplicar migración del sistema de ads
// ============================================
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
const envPath = join(process.cwd(), '.env.local');
const envFile = readFileSync(envPath, 'utf-8');
envFile.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const [key, ...valueParts] = trimmed.split('=');
    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  }
});

async function applyMigration() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing Supabase credentials');
    }

    // Read migration file
    const migrationPath = join(process.cwd(), 'supabase/migrations/20260615_ads_system.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf-8');

    console.log('📥 Applying ads system migration...\n');

    // Execute migration via REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ sql: migrationSQL })
    });

    if (!response.ok) {
      // Si exec_sql no existe, intentamos directamente con pg
      console.log('⚠️  RPC exec_sql not available, trying direct execution...\n');

      // Try alternative: use supabase-js client
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseServiceKey, {
        auth: { persistSession: false }
      });

      // Split SQL into individual statements and execute one by one
      const statements = migrationSQL
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0 && !s.startsWith('--'));

      let successCount = 0;
      let errorCount = 0;

      for (const statement of statements) {
        if (!statement) continue;

        try {
          const { error } = await supabase.rpc('exec', { sql: statement + ';' });
          if (error) {
            console.log(`❌ Error executing statement: ${error.message}`);
            console.log(`   Statement: ${statement.substring(0, 100)}...\n`);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (err: any) {
          console.log(`❌ Exception: ${err.message}`);
          errorCount++;
        }
      }

      console.log(`\n📊 Migration results:`);
      console.log(`   ✅ Successful: ${successCount}`);
      console.log(`   ❌ Failed: ${errorCount}`);

    } else {
      console.log('✅ Migration applied successfully!\n');
    }

    console.log('🎉 Done! You can now:');
    console.log('   1. Check tables in Supabase Dashboard');
    console.log('   2. Create advertisers and ads');
    console.log('   3. View stats in ad_stats view\n');

  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

applyMigration();
