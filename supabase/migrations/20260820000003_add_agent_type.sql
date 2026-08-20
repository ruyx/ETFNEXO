-- Agregar campo agent_type a ai_agents
-- Para diferenciar entre redactores (noticias) y educadores (academia)

BEGIN;

-- Agregar columna agent_type con valores posibles 'redactor' o 'educador'
ALTER TABLE ai_agents
ADD COLUMN agent_type TEXT CHECK (agent_type IN ('redactor', 'educador')) DEFAULT 'redactor';

-- Actualizar agentes existentes
-- Por defecto, los agentes existentes serán redactores
UPDATE ai_agents SET agent_type = 'redactor' WHERE agent_type IS NULL;

-- Hacer el campo NOT NULL después de actualizar los existentes
ALTER TABLE ai_agents
ALTER COLUMN agent_type SET NOT NULL;

-- Crear índice para mejorar el rendimiento de las consultas filtradas
CREATE INDEX idx_ai_agents_agent_type ON ai_agents(agent_type);

-- Comentario para documentación
COMMENT ON COLUMN ai_agents.agent_type IS 'Tipo de agente: redactor para noticias, educador para academia';

COMMIT;
