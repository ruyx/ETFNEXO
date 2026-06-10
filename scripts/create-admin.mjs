import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createAdminUser() {
  try {
    console.log('Creating admin user...')

    const { data, error } = await supabase.auth.admin.createUser({
      email: 'info@artifigence.net',
      password: 'Tera2Sira',
      email_confirm: true,
      user_metadata: {
        full_name: 'Admin ETF Nexo',
        role: 'admin'
      }
    })

    if (error) {
      console.error('Error creating user:', error)
      return
    }

    console.log('✓ User created successfully:', data.user.email)
    console.log('✓ User ID:', data.user.id)

    // Create profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert({
        id: data.user.id,
        full_name: 'Admin ETF Nexo',
        username: 'admin'
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
    } else {
      console.log('✓ Profile created successfully')
    }

    console.log('\n=== ADMIN USER CREDENTIALS ===')
    console.log('Email: info@artifigence.net')
    console.log('Password: Tera2Sira')
    console.log('==============================\n')

  } catch (err) {
    console.error('Exception:', err)
  }
}

createAdminUser()
