#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  console.log('Applying agent_id migration...');

  // Method 1: Use direct SQL execution
  // Since we can't use RPC, we'll use the REST API directly

  const queries = [
    `ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL`,
    `CREATE INDEX IF NOT EXISTS idx_user_profiles_agent ON user_profiles(agent_id) WHERE agent_id IS NOT NULL`
  ];

  for (const query of queries) {
    try {
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        const error = await response.text();
        console.log(`Query: ${query}`);
        console.log(`Response: ${error}`);
      }
    } catch (err) {
      console.log('Query attempt failed (may be okay):', err.message);
    }
  }

  // Verify the column exists by trying to select from it
  console.log('\nVerifying migration...');
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id, agent_id')
    .limit(1);

  if (error) {
    if (error.message.includes('agent_id')) {
      console.error('❌ Migration failed - agent_id column does not exist');
      console.error('Error:', error.message);
      console.error('\nPlease apply the migration manually via Supabase Dashboard:');
      console.error('SQL Editor → New Query → Paste the following:\n');
      console.error(`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL;`);
      console.error(`CREATE INDEX IF NOT EXISTS idx_user_profiles_agent ON user_profiles(agent_id) WHERE agent_id IS NOT NULL;`);
      process.exit(1);
    } else {
      console.error('Verification query error:', error);
    }
  } else {
    console.log('✅ Migration verified successfully!');
    console.log('Agent column exists and is queryable.');
  }
}

applyMigration();
