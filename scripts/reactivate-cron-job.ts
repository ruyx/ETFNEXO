import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  realtime: { transport: ws as any },
  db: { schema: 'public' }
})

async function reactivateCronJob() {
  console.log('🔧 Reactivando sistema automático de noticias...\n')

  try {
    // Paso 1: Mostrar instrucciones (no podemos ejecutar SQL directamente sin permisos)
    console.log('📝 Verificando estado actual del sistema...')

    // Paso 2: Programar cron job usando Management API
    // Como no podemos usar RPC directamente, vamos a usar el approach de crear una migración
    console.log('📅 Paso 2: Programando cron job fetch-news-every-6-hours...')
    console.log('   Frecuencia: Cada 6 horas (0 */6 * * *)')
    console.log('   Comando: SELECT public.fetch_news_cron();\n')

    // Intentar via SQL directo (requiere que el usuario tenga permisos)
    console.log('⚠️  IMPORTANTE:')
    console.log('   El cron job debe programarse manualmente via Supabase Dashboard')
    console.log('   debido a restricciones de permisos.\n')

    console.log('📋 Ejecuta este SQL en Supabase Dashboard → SQL Editor:')
    console.log('=' .repeat(80))
    console.log(`
-- Programar cron job de fetch-news
SELECT cron.schedule(
  'fetch-news-every-6-hours',
  '0 */6 * * *',
  'SELECT public.fetch_news_cron();'
);

-- Verificar que se creó
SELECT jobname, schedule, command, active
FROM cron.job
WHERE jobname = 'fetch-news-every-6-hours';
    `.trim())
    console.log('=' .repeat(80))

    console.log('\n📊 URL del SQL Editor:')
    console.log('   https://supabase.com/dashboard/project/utvioubcqkwwzvufhups/sql\n')

    // Paso 3: Verificar estado actual de cron jobs
    console.log('📊 Paso 3: Verificando estado actual de cron jobs...')
    const { data: logs, error: logsError } = await supabase
      .from('cron_logs')
      .select('*')
      .eq('job_name', 'fetch-news')
      .order('executed_at', { ascending: false })
      .limit(1)

    if (logsError) {
      console.log('⚠️  No se pudo verificar logs:', logsError.message)
    } else if (logs && logs.length > 0) {
      const lastLog = logs[0]
      console.log('   Última ejecución registrada de fetch-news:')
      console.log(`   → ${new Date(lastLog.executed_at).toISOString()}`)
      console.log(`   → Estado: ${lastLog.status}`)
      if (lastLog.message) console.log(`   → Mensaje: ${lastLog.message}`)
    } else {
      console.log('   ⚠️  No hay registros de ejecución de fetch-news (nunca se ha ejecutado)')
    }

    // Mostrar estado de auto-publish
    const { data: publishLogs } = await supabase
      .from('cron_logs')
      .select('*')
      .eq('job_name', 'auto-publish-news')
      .order('executed_at', { ascending: false })
      .limit(1)

    if (publishLogs && publishLogs.length > 0) {
      console.log('\n   Estado de auto-publish-news:')
      console.log(`   → Última ejecución: ${new Date(publishLogs[0].executed_at).toISOString()}`)
      console.log(`   → Estado: ${publishLogs[0].status}`)
      console.log(`   → ${publishLogs[0].message || 'Sin mensaje'}`)
    }

    console.log('\n' + '='.repeat(80))
    console.log('✅ Verificación completa')
    console.log('='.repeat(80))

    console.log('\n📝 Resumen:')
    console.log('   1. ✅ Script de verificación ejecutado')
    console.log('   2. ⚠️  Cron job debe programarse manualmente (permisos requeridos)')
    console.log('   3. 📋 Instrucciones SQL generadas arriba')
    console.log('   4. 🔗 URL del Dashboard proporcionada')

    console.log('\n🎯 Próximos pasos:')
    console.log('   1. Ejecuta el SQL en Supabase Dashboard (link arriba)')
    console.log('   2. Espera 6 horas (próxima ejecución: 00:00, 06:00, 12:00 o 18:00 UTC)')
    console.log('   3. Verifica con: npx tsx scripts/check-news.ts')

  } catch (error) {
    console.error('\n❌ Error:', error)
    throw error
  }

  process.exit(0)
}

reactivateCronJob()
