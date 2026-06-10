/**
 * Auth Callback Handler
 * Handles OAuth redirects and email confirmations
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirectTo = requestUrl.searchParams.get('redirectTo') || '/'

  if (code) {
    const supabase = await createClient()

    // Exchange code for session
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to the redirect URL or home
  return NextResponse.redirect(new URL(redirectTo, request.url))
}
