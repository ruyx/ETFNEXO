'use client';

/**
 * Migration Page - Multi-Agent Support
 * Navigate to http://localhost:5000/admin/migrate-agents
 */

import { useState } from 'react';

export default function MigrateAgentsPage() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'instructions'>('idle');
  const [message, setMessage] = useState('');

  const showInstructions = () => {
    setStatus('instructions');
    setMessage('Sigue las instrucciones abajo para aplicar la migración de múltiples agentes.');
  };

  return (
    <div style={{
      maxWidth: '900px',
      margin: '40px auto',
      padding: '30px',
      background: 'var(--color-neutral-0)',
      borderRadius: 'var(--radius-lg)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <h1 style={{
        fontSize: '28px',
        fontWeight: '700',
        marginBottom: '20px',
        color: 'var(--color-neutral-900)'
      }}>
        Migración: Soporte para Múltiples Agentes
      </h1>

      <div style={{ marginBottom: '30px' }}>
        <p style={{ marginBottom: '15px', lineHeight: '1.6' }}>
          Esta migración permite asignar <strong>múltiples agentes AI</strong> a cada usuario.
        </p>
        <button
          onClick={showInstructions}
          style={{
            padding: '12px 24px',
            background: 'var(--color-primary)',
            color: 'var(--color-white)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '16px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Ver Instrucciones
        </button>
      </div>

      {status === 'instructions' && (
        <div style={{
          padding: '30px',
          background: 'var(--color-neutral-100)',
          borderRadius: 'var(--radius-md)',
          border: '2px solid var(--color-primary)'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: '15px',
            color: 'var(--color-neutral-900)'
          }}>
            📋 Instrucciones para Aplicar la Migración
          </h2>

          <ol style={{
            lineHeight: '1.8',
            paddingLeft: '20px',
            marginBottom: '20px'
          }}>
            <li>Abre el <strong>Supabase Dashboard</strong>: <a href="https://supabase.com/dashboard/project/utvioubcqkwwzvufhups" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>https://supabase.com/dashboard</a></li>
            <li>Ve a <strong>SQL Editor</strong> en el menú lateral</li>
            <li>Click en <strong>"New Query"</strong></li>
            <li>Copia y pega el siguiente SQL:</li>
          </ol>

          <div style={{
            background: 'var(--color-neutral-900)',
            color: 'var(--color-neutral-0)',
            padding: '20px',
            borderRadius: 'var(--radius-md)',
            fontFamily: 'monospace',
            fontSize: '14px',
            overflowX: 'auto',
            marginBottom: '20px',
            maxHeight: '500px',
            overflowY: 'auto'
          }}>
            <pre style={{ margin: 0 }}>{`-- ============================================
-- MIGRACIÓN: Soporte para Múltiples Agentes por Usuario
-- ============================================

-- PARTE 1: Crear tabla de asignaciones
CREATE TABLE IF NOT EXISTS public.user_agent_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_id UUID NOT NULL REFERENCES public.ai_agents(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,

  -- Un usuario no puede tener el mismo agente asignado dos veces
  UNIQUE(user_id, agent_id)
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_user_agent_assignments_user
  ON public.user_agent_assignments(user_id);

CREATE INDEX IF NOT EXISTS idx_user_agent_assignments_agent
  ON public.user_agent_assignments(agent_id);

COMMENT ON TABLE public.user_agent_assignments IS 'Asignación de agentes IA a usuarios (relación muchos a muchos)';

-- PARTE 2: Migrar datos existentes de agent_id
-- Si hay usuarios con agent_id asignado, migrarlos a la nueva tabla
INSERT INTO public.user_agent_assignments (user_id, agent_id, assigned_at)
SELECT id, agent_id, now()
FROM public.user_profiles
WHERE agent_id IS NOT NULL
ON CONFLICT (user_id, agent_id) DO NOTHING;

-- PARTE 3: Políticas RLS para la tabla de asignaciones
ALTER TABLE public.user_agent_assignments ENABLE ROW LEVEL SECURITY;

-- Los usuarios pueden ver sus propias asignaciones
CREATE POLICY "Users can view their own agent assignments"
  ON public.user_agent_assignments FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    public.is_admin()
  );

-- Solo admins pueden crear asignaciones
CREATE POLICY "Admins can insert agent assignments"
  ON public.user_agent_assignments FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- Solo admins pueden eliminar asignaciones
CREATE POLICY "Admins can delete agent assignments"
  ON public.user_agent_assignments FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- PARTE 4: Función helper para obtener agentes de un usuario
CREATE OR REPLACE FUNCTION public.get_user_agents(p_user_id UUID)
RETURNS TABLE (
  agent_id UUID,
  agent_name TEXT,
  agent_display_name TEXT,
  agent_role TEXT,
  agent_slug TEXT,
  assigned_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.name,
    a.display_name,
    a.role,
    a.slug,
    uaa.assigned_at
  FROM public.user_agent_assignments uaa
  INNER JOIN public.ai_agents a ON a.id = uaa.agent_id
  WHERE uaa.user_id = p_user_id
  ORDER BY uaa.assigned_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_user_agents IS 'Obtiene todos los agentes asignados a un usuario específico';`}</pre>
          </div>

          <ol start={5} style={{ lineHeight: '1.8', paddingLeft: '20px' }}>
            <li>Click en el botón <strong>"RUN"</strong> (o presiona Ctrl+Enter / Cmd+Enter)</li>
            <li>Espera a que se ejecute exitosamente</li>
            <li>Recarga la página de edición de usuarios para ver el nuevo sistema de tags</li>
          </ol>

          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: 'var(--color-info-light)',
            border: '1px solid var(--color-info)',
            borderRadius: 'var(--radius-md)'
          }}>
            <strong>💡 Nota:</strong> Esta migración:
            <ul style={{ marginTop: '10px', paddingLeft: '20px' }}>
              <li>Crea la tabla <code>user_agent_assignments</code> para relación muchos a muchos</li>
              <li>Migra automáticamente los agentes existentes de <code>user_profiles.agent_id</code></li>
              <li>Mantiene la columna <code>agent_id</code> original para compatibilidad (opcional eliminarla después)</li>
              <li>Añade políticas RLS para seguridad</li>
            </ul>
          </div>

          <div style={{
            marginTop: '20px',
            padding: '20px',
            background: 'var(--color-success-light)',
            border: '2px solid var(--color-success)',
            borderRadius: 'var(--radius-md)',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '10px', color: 'var(--color-success-dark)' }}>
              ¿Listo?
            </h3>
            <p style={{ margin: 0 }}>
              Una vez aplicada la migración, visita{' '}
              <a href="/admin/usuarios" style={{ color: 'var(--color-primary)', fontWeight: '600' }}>
                /admin/usuarios
              </a>
              {' '}y edita un usuario para probar el sistema de múltiples agentes.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
