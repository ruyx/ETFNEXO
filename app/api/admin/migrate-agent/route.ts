/**
 * Temporary Migration Endpoint
 * Apply agent_id migration
 */

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { requireAdmin } from '@/lib/auth/check-admin';
import { successResponse, errorResponse } from '@/lib/auth/api-response';

export async function POST(request: NextRequest) {
  try {
    // Only admins can run migrations
    await requireAdmin();

    const supabase = createAdminClient();

    console.log('Applying agent_id migration...');

    // Check if column already exists by trying to select it
    const { error: checkError } = await supabase
      .from('user_profiles')
      .select('agent_id')
      .limit(1);

    if (!checkError) {
      return successResponse(
        { message: 'Migration already applied - agent_id column exists' },
        'Column already exists'
      );
    }

    // Column doesn't exist, need to run migration via Supabase Dashboard
    return errorResponse(
      'Migration must be applied manually via Supabase Dashboard SQL Editor',
      'MANUAL_MIGRATION_REQUIRED',
      400,
      `Please run this SQL in Supabase Dashboard → SQL Editor:

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_agent
  ON user_profiles(agent_id)
  WHERE agent_id IS NOT NULL;

Then refresh this page.`
    );

  } catch (error: any) {
    console.error('Migration check error:', error);
    return errorResponse(
      'Error checking migration status',
      'INTERNAL_ERROR',
      500,
      error.message
    );
  }
}
