import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan variables de entorno')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createUser() {
  console.log('Creating user with admin privileges...')

  // Delete existing user if exists
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existingUser = existingUsers?.users.find(u => u.email === 'info@artifigence.net')

  if (existingUser) {
    console.log('Deleting existing user...')
    await supabase.auth.admin.deleteUser(existingUser.id)
  }

  // Create new user
  const { data: userData, error: userError } = await supabase.auth.admin.createUser({
    email: 'info@artifigence.net',
    password: 'genesis2023G+',
    email_confirm: true,
    user_metadata: {
      full_name: 'Admin Artifigence',
      role: 'admin'
    }
  })

  if (userError) {
    console.error('❌ Error creating user:', userError)
    return
  }

  console.log('✅ User created:', userData.user.email)
  console.log('User ID:', userData.user.id)

  // Update profile in database
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({
      id: userData.user.id,
      email: 'info@artifigence.net',
      full_name: 'Admin Artifigence',
      role: 'admin',
      updated_at: new Date().toISOString()
    })

  if (profileError) {
    console.error('⚠️  Error updating profile:', profileError)
  } else {
    console.log('✅ Profile created/updated')
  }

  console.log('\n✅ User ready to login:')
  console.log('Email: info@artifigence.net')
  console.log('Password: genesis2023G+')
}

createUser()
