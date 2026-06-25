import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws as any }
})

async function checkCronStatus() {
  console.log('🔍 Verificando estado del sistema de automatización...\n')

  // Verificar logs de cron
  console.log('📊 Verificando logs de cron jobs...')
  console.log('='.repeat(100))

  const { data: logs, error: logsError } = await supabase
    .from('cron_logs')
    .select('*')
    .order('executed_at', { ascending: false })
    .limit(20)

  if (logsError) {
    console.error('❌ Error al obtener logs:', logsError.message)
  } else if (logs && logs.length > 0) {
    console.log(`\nÚltimos ${logs.length} registros de cron:\n`)
    logs.forEach((log, i) => {
      const date = new Date(log.executed_at).toISOString()
      const status = log.status === 'success' ? '✅' : '❌'
      console.log(`${(i+1).toString().padStart(2)}. ${status} [${date}] ${log.job_name}`)
      if (log.message) console.log(`    → ${log.message}`)
      if (log.error_message) console.log(`    → ERROR: ${log.error_message}`)
    })
  } else {
    console.log('⚠️  No hay logs de cron jobs')
    console.log('    Esto significa que los cron jobs NUNCA se han ejecutado automáticamente')
  }

  // Verificar vista de estado
  console.log('\n📈 Estado general de cron jobs (últimos 7 días)...')
  console.log('='.repeat(100))

  const { data: status, error: statusError } = await supabase
    .from('cron_jobs_status')
    .select('*')

  if (statusError) {
    console.error('❌ Error al obtener estado:', statusError.message)
  } else if (status && status.length > 0) {
    console.log('\nResumen de jobs:\n')
    status.forEach(job => {
      console.log(`Job: ${job.job_name}`)
      console.log(`  ✅ Éxitos: ${job.total_success}`)
      console.log(`  ❌ Errores: ${job.total_errors}`)
      console.log(`  🕐 Último éxito: ${job.last_success ? new Date(job.last_success).toISOString() : 'Nunca'}`)
      console.log(`  🕐 Última ejecución: ${job.last_run ? new Date(job.last_run).toISOString() : 'Nunca'}`)
      console.log('')
    })
  } else {
    console.log('⚠️  No hay datos de estado de cron jobs')
  }

  console.log('\n🚀 Edge Functions disponibles:')
  console.log('='.repeat(100))
  console.log('  1. fetch-news (scraping RSS automático) - ⚠️  DESACTIVADO')
  console.log('  2. import-gsheets-news (importación manual desde Google Sheets)')

  console.log('\n📋 Instrucciones de verificación manual:')
  console.log('='.repeat(100))
  console.log('\n1. Ver cron jobs programados en Supabase Dashboard → SQL Editor:')
  console.log('   SELECT * FROM cron.job;')
  console.log('\n2. Probar Edge Function fetch-news manualmente:')
  console.log('   curl -X POST https://utvioubcqkwwzvufhups.supabase.co/functions/v1/fetch-news \\')
  console.log('     -H "Authorization: Bearer [SERVICE_KEY]"')
  console.log('\n3. Probar Edge Function import-gsheets-news manualmente:')
  console.log('   curl -X POST https://utvioubcqkwwzvufhups.supabase.co/functions/v1/import-gsheets-news \\')
  console.log('     -H "Authorization: Bearer [SERVICE_KEY]"')

  console.log('\n' + '='.repeat(100))
  console.log('✅ Verificación completa')
  console.log('='.repeat(100))

  process.exit(0)
}

checkCronStatus()
