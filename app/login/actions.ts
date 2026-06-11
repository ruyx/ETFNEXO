'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  console.log('[Login] Attempting login for:', email)

  if (!email || !password) {
    return { error: 'Email y contraseña son requeridos' }
  }

  const supabase = await createClient()

  const { error, data } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    console.error('[Login] Error:', error.message)
    return { error: error.message }
  }

  // Verify session was created
  if (!data.session) {
    console.error('[Login] No session created')
    return { error: 'Error al crear la sesión' }
  }

  console.log('[Login] Session created successfully for user:', data.user.email)
  console.log('[Login] Session expires at:', data.session.expires_at)

  // Force revalidation to ensure cookies are picked up
  revalidatePath('/', 'layout')

  // Return success - let client handle redirect
  return { success: true }
}
