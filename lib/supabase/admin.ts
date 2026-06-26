/**
 * Supabase Admin Client - Server-side operations with elevated permissions
 * Use this for admin operations and public data access that bypasses RLS
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';
import WebSocket from 'ws';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase environment variables');
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    },
    realtime: {
      // @ts-ignore - ws transport for Node.js 20
      transport: WebSocket,
      params: {
        eventsPerSecond: 0
      }
    },
    global: {
      headers: {
        'x-client-info': 'supabase-admin-js'
      }
    }
  });
}
