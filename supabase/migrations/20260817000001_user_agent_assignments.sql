-- ============================================
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

-- PARTE 3: Eliminar la columna antigua agent_id
-- (mantenerla comentada por si necesitamos rollback)
-- ALTER TABLE public.user_profiles DROP COLUMN IF EXISTS agent_id;

-- PARTE 4: Políticas RLS para la tabla de asignaciones
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

-- PARTE 5: Función helper para obtener agentes de un usuario
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

COMMENT ON FUNCTION public.get_user_agents IS 'Obtiene todos los agentes asignados a un usuario específico';
