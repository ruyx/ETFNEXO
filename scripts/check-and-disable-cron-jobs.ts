import { createClient } from '@supabase/supabase-js'
import ws from 'ws'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: Variables de entorno faltantes')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  realtime: {
    transport: ws as any
  }
})

async function checkAndDisableCronJobs() {
  console.log('🔍 Verificando cron jobs activos...\n')

  // Ver todos los cron jobs
  const { data: cronJobs, error } = await supabase.rpc('check_cron_jobs', {})

  if (error) {
    // Si la función no existe, usar SQL directo
    console.log('⚠️  Función check_cron_jobs no existe, usando SQL directo...\n')

    // Crear query SQL para verificar cron jobs
    const sqlQuery = `
      SELECT
        jobname,
        schedule,
        active,
        command
      FROM cron.job
      ORDER BY jobname;
    `

    console.log('📋 Ejecutando query para ver cron jobs...')
    console.log(sqlQuery)
    console.log('\n⚠️  MANUAL: Debes ejecutar esto en Supabase Dashboard → SQL Editor:')
    console.log('\n```sql')
    console.log(sqlQuery)
    console.log('```\n')

    // Y para desactivar fetch-news
    console.log('🚫 Para DESACTIVAR fetch-news, ejecuta:')
    console.log('\n```sql')
    console.log(`
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'fetch-news-every-6-hours') THEN
    PERFORM cron.unschedule('fetch-news-every-6-hours');
    RAISE NOTICE '✅ fetch-news-every-6-hours desactivado';
  ELSE
    RAISE NOTICE 'ℹ️  fetch-news-every-6-hours no existe';
  END IF;

  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'fetch-news') THEN
    PERFORM cron.unschedule('fetch-news');
    RAISE NOTICE '✅ fetch-news desactivado';
  ELSE
    RAISE NOTICE 'ℹ️  fetch-news no existe';
  END IF;
END $$;

-- Verificar que quedaron desactivados
SELECT jobname, schedule, active FROM cron.job;
    `)
    console.log('```\n')

    return
  }

  // Si la función existe, mostrar resultados
  console.log('📊 Cron jobs activos:')
  console.log(cronJobs)
}

checkAndDisableCronJobs().catch(console.error)
