import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/client'

export async function GET() {
  try {
    const supabase = createClient()

    console.log('[Test Auth] Testing Supabase client...')

    const { data: { user }, error } = await supabase.auth.getUser()

    console.log('[Test Auth] Result:', { user, error })

    return NextResponse.json({
      success: true,
      user: user,
      error: error,
      hasUser: !!user,
      timestamp: new Date().toISOString()
    })
  } catch (err) {
    console.error('[Test Auth] Exception:', err)
    return NextResponse.json({
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
