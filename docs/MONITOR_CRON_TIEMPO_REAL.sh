#!/bin/bash
# ============================================
# Monitor Cron Job en Tiempo Real
# ============================================
# Ejecutar mientras esperas que se ejecute el cron (07:42 UTC)
# ============================================

echo "🔍 Monitoreando cron job import-gsheets-TEST..."
echo "⏰ Hora objetivo: 07:42 UTC"
echo "📊 Actualizando cada 10 segundos..."
echo ""

while true; do
  clear
  echo "============================================"
  echo "⏰ MONITOR CRON JOB - Actualizado: $(date -u)"
  echo "============================================"
  echo ""

  # Verificar si el cron existe
  echo "📋 Estado del Cron Job:"
  cd /home/suario/ruy
  export PGPASSWORD="GX7fzQvZSMszrjpk"
  echo "SELECT jobname, schedule, active FROM cron.job WHERE jobname = 'import-gsheets-TEST';" | supabase db query --linked 2>/dev/null | grep -A5 "jobname"

  echo ""
  echo "📊 Últimas Ejecuciones:"
  echo "SELECT start_time, status, return_message FROM cron.job_run_details WHERE jobid = (SELECT jobid FROM cron.job WHERE jobname = 'import-gsheets-TEST') ORDER BY start_time DESC LIMIT 1;" | supabase db query --linked 2>/dev/null | grep -A3 "start_time"

  echo ""
  echo "📰 Últimas Noticias Creadas:"
  echo "SELECT title, created_at FROM news_articles ORDER BY created_at DESC LIMIT 1;" | supabase db query --linked 2>/dev/null | grep -A3 "title"

  echo ""
  echo "============================================"
  echo "Presiona Ctrl+C para detener el monitor"
  echo "============================================"

  sleep 10
done
