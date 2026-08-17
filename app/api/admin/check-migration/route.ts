/**
 * Check Migration Status
 * Verify if agent_id column and admin policies exist
 */

import { NextRequest } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { successResponse, errorResponse } from '@/lib/auth/api-response';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();

    // Check 1: Does agent_id column exist?
    const { data: columnCheck, error: columnError } = await supabase
      .from('user_profiles')
      .select('agent_id')
      .limit(1);

    const hasAgentColumn = !columnError;

    // Check 2: Try to update a profile as admin (will fail if RLS blocks)
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('id')
      .limit(1);

    let canUpdateAsAdmin = false;
    if (profiles && profiles.length > 0) {
      const testId = profiles[0].id;
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', testId);

      canUpdateAsAdmin = !updateError;
    }

    return successResponse({
      agent_column_exists: hasAgentColumn,
      admin_can_update: canUpdateAsAdmin,
      status: hasAgentColumn && canUpdateAsAdmin ? 'ready' : 'needs_migration',
      message: hasAgentColumn && canUpdateAsAdmin
        ? '✅ Todo configurado correctamente'
        : '❌ Necesita aplicar migraciones',
      details: {
        agent_column: hasAgentColumn ? 'OK' : 'MISSING',
        admin_policies: canUpdateAsAdmin ? 'OK' : 'BLOCKED',
        column_error: columnError?.message || null
      }
    });

  } catch (error: any) {
    console.error('Migration check error:', error);
    return errorResponse(
      'Error verificando migraciones',
      'INTERNAL_ERROR',
      500,
      error.message
    );
  }
}
