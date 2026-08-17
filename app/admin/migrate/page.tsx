'use client';

/**
 * Migration Page - Apply agent_id migration
 * Navigate to http://localhost:5000/admin/migrate to use this
 */

import { useState } from 'react';

export default function MigratePage() {
  const [status, setStatus] = useState<'idle' | 'checking' | 'success' | 'needs_manual'>('idle');
  const [message, setMessage] = useState('');

  const checkMigration = async () => {
    setStatus('checking');
    setMessage('Verificando estado de la migración...');

    try {
      const response = await fetch('/api/admin/check-migration');
      const data = await response.json();

      if (response.ok && data.data.status === 'ready') {
        setStatus('success');
        setMessage(data.data.message + '\n\n' +
          'Detalles:\n' +
          `- Columna agent_id: ${data.data.details.agent_column}\n` +
          `- Políticas admin: ${data.data.details.admin_policies}`
        );
      } else {
        setStatus('needs_manual');
        setMessage(
          'Estado actual:\n' +
          `- Columna agent_id: ${data.data?.details?.agent_column || 'UNKNOWN'}\n` +
          `- Políticas admin: ${data.data?.details?.admin_policies || 'UNKNOWN'}\n\n` +
          'Se requiere migración manual'
        );
      }
    } catch (error: any) {
      setStatus('needs_manual');
      setMessage('Error al verificar migración: ' + error.message);
    }
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
        Aplicar Migración agent_id
      </h1>

      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={checkMigration}
          disabled={status === 'checking'}
          style={{
            padding: '12px 24px',
            background: 'var(--color-primary)',
            color: 'var(--color-white)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '16px',
            fontWeight: '600',
            cursor: status === 'checking' ? 'wait' : 'pointer',
            opacity: status === 'checking' ? 0.6 : 1
          }}
        >
          {status === 'checking' ? 'Verificando...' : 'Verificar Migración'}
        </button>
      </div>

      {message && (
        <div style={{
          padding: '20px',
          background: status === 'success' ? 'var(--color-success-light)' : 'var(--color-warning-light)',
          border: `1px solid ${status === 'success' ? 'var(--color-success)' : 'var(--color-warning)'}`,
          borderRadius: 'var(--radius-md)',
          marginBottom: '20px'
        }}>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{message}</p>
        </div>
      )}

      {status === 'needs_manual' && (
        <div style={{
          padding: '30px',
          background: 'var(--color-neutral-100)',
          borderRadius: 'var(--radius-md)',
          border: '2px solid var(--color-warning)'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            marginBottom: '15px',
            color: 'var(--color-neutral-900)'
          }}>
            📋 Instrucciones para Migración Manual
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
-- MIGRACIÓN COMPLETA: User Management Fixes
-- ============================================

-- PARTE 1: Agregar columna agent_id
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS agent_id UUID
  REFERENCES ai_agents(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_agent
  ON user_profiles(agent_id)
  WHERE agent_id IS NOT NULL;

COMMENT ON COLUMN user_profiles.agent_id IS 'Agente AI que este usuario gestiona (opcional)';

-- PARTE 2: Políticas RLS para admins
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.user_profiles;

-- Admins pueden actualizar cualquier perfil
CREATE POLICY "Users can update profiles"
  ON public.user_profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR  -- Propio perfil
    public.is_admin()    -- O es admin
  )
  WITH CHECK (
    auth.uid() = id OR  -- Propio perfil
    public.is_admin()    -- O es admin
  );

-- Admins pueden eliminar cualquier perfil
CREATE POLICY "Users can delete profiles"
  ON public.user_profiles FOR DELETE
  TO authenticated
  USING (
    auth.uid() = id OR  -- Propio perfil
    public.is_admin()    -- O es admin
  );`}</pre>
          </div>

          <ol start={5} style={{ lineHeight: '1.8', paddingLeft: '20px' }}>
            <li>Click en el botón <strong>"RUN"</strong> (o presiona Ctrl+Enter / Cmd+Enter)</li>
            <li>Espera a que se ejecute exitosamente</li>
            <li>Vuelve aquí y click en <strong>"Verificar Migración"</strong> para confirmar</li>
          </ol>

          <div style={{
            marginTop: '20px',
            padding: '15px',
            background: 'var(--color-info-light)',
            border: '1px solid var(--color-info)',
            borderRadius: 'var(--radius-md)'
          }}>
            <strong>💡 Nota:</strong> Esta migración es segura. Si la columna ya existe, el comando <code>IF NOT EXISTS</code> evitará errores.
          </div>
        </div>
      )}

      {status === 'success' && (
        <div style={{
          padding: '20px',
          background: 'var(--color-success-light)',
          border: '2px solid var(--color-success)',
          borderRadius: 'var(--radius-md)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>✅</div>
          <h2 style={{
            fontSize: '22px',
            fontWeight: '700',
            marginBottom: '10px',
            color: 'var(--color-success-dark)'
          }}>
            ¡Migración Aplicada Correctamente!
          </h2>
          <p style={{ margin: 0, fontSize: '16px' }}>
            Ya puedes <a href="/admin/usuarios" style={{ color: 'var(--color-primary)' }}>volver a la gestión de usuarios</a> y asignar agentes.
          </p>
        </div>
      )}
    </div>
  );
}
