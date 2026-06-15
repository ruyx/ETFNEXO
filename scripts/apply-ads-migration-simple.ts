// ============================================
// Script simple para aplicar migración de ads
// ============================================
import { readFileSync } from 'fs';
import { join } from 'path';
import { createClient } from '@supabase/supabase-js';

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

    console.log('📥 Reading migration file...');
    console.log('📊 Migration size:', (migrationSQL.length / 1024).toFixed(2), 'KB\n');

    console.log('⚠️  IMPORTANT: This script cannot execute raw SQL directly.');
    console.log('    You need to manually execute the migration in Supabase Dashboard.\n');

    console.log('📋 Steps to apply the migration:\n');
    console.log('1. Go to: https://supabase.com/dashboard');
    console.log('2. Select your project: utvioubcqkwwzvufhups');
    console.log('3. Navigate to: SQL Editor');
    console.log('4. Create a new query');
    console.log('5. Copy the contents of: supabase/migrations/20260615_ads_system.sql');
    console.log('6. Paste and execute the migration\n');

    console.log('✅ The migration file is ready at:');
    console.log('   ', migrationPath, '\n');

    console.log('📝 Alternative: Use Supabase CLI:');
    console.log('   supabase db push\n');

    console.log('   (Note: You may need to fix the old migration first)\n');

  } catch (error: any) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

applyMigration();
