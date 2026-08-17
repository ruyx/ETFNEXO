-- ============================================
-- ETF Nexo - Add AI Agent Assignment to Users
-- ============================================
-- Fecha: 2026-08-14
-- Descripción: Permite asignar usuarios como gestores de agentes AI específicos

-- Add agent_id column to user_profiles
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS agent_id UUID REFERENCES ai_agents(id) ON DELETE SET NULL;

-- Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_agent ON user_profiles(agent_id) WHERE agent_id IS NOT NULL;

-- Add comment
COMMENT ON COLUMN user_profiles.agent_id IS 'Agente AI que este usuario gestiona (opcional)';
