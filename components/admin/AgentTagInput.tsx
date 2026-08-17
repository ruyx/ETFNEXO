'use client';

import { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  display_name: string;
  role: string;
  slug: string;
}

interface SelectedAgent extends Agent {
  assignment_id?: string;
  assigned_at?: string;
}

interface AgentTagInputProps {
  userId: string;
  selectedAgents: SelectedAgent[];
  onAgentsChange: (agents: SelectedAgent[]) => void;
}

export default function AgentTagInput({
  userId,
  selectedAgents,
  onAgentsChange
}: AgentTagInputProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [filteredAgents, setFilteredAgents] = useState<Agent[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cargar todos los agentes disponibles
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch('/api/agents');
        const data = await response.json();
        if (response.ok && data.data) {
          setAvailableAgents(data.data);
        }
      } catch (error) {
        console.error('Error fetching agents:', error);
      }
    };
    fetchAgents();
  }, []);

  // Filtrar agentes según el término de búsqueda
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredAgents([]);
      setIsDropdownOpen(false);
      return;
    }

    const term = searchTerm.toLowerCase();
    const selectedIds = selectedAgents.map(a => a.id);

    const filtered = availableAgents.filter(agent => {
      // Excluir agentes ya seleccionados
      if (selectedIds.includes(agent.id)) return false;

      // Buscar en nombre, display_name y role
      return (
        agent.name.toLowerCase().includes(term) ||
        agent.display_name.toLowerCase().includes(term) ||
        agent.role.toLowerCase().includes(term)
      );
    });

    setFilteredAgents(filtered);
    setIsDropdownOpen(filtered.length > 0);
  }, [searchTerm, availableAgents, selectedAgents]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddAgent = async (agent: Agent) => {
    setIsLoading(true);

    try {
      // Llamar al API para asignar el agente
      const response = await fetch(`/api/admin/usuarios/${userId}/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: agent.id })
      });

      const data = await response.json();

      if (response.ok && data.data?.assignment) {
        // Agregar el agente con su assignment_id
        const newAgent: SelectedAgent = {
          ...agent,
          assignment_id: data.data.assignment.id,
          assigned_at: data.data.assignment.assigned_at
        };

        onAgentsChange([...selectedAgents, newAgent]);
        setSearchTerm('');
        setIsDropdownOpen(false);
      } else {
        console.error('Error assigning agent:', data);
        alert(data.error?.message || 'Error al asignar agente');
      }
    } catch (error) {
      console.error('Error adding agent:', error);
      alert('Error al asignar agente');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveAgent = async (agent: SelectedAgent) => {
    setIsLoading(true);

    try {
      // Llamar al API para remover el agente
      const response = await fetch(
        `/api/admin/usuarios/${userId}/agents?agent_id=${agent.id}`,
        { method: 'DELETE' }
      );

      const data = await response.json();

      if (response.ok) {
        onAgentsChange(selectedAgents.filter(a => a.id !== agent.id));
      } else {
        console.error('Error removing agent:', data);
        alert(data.error?.message || 'Error al remover agente');
      }
    } catch (error) {
      console.error('Error removing agent:', error);
      alert('Error al remover agente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="agent-tag-input">
      {/* Tags de agentes seleccionados */}
      {selectedAgents.length > 0 && (
        <div className="agent-tag-input__tags">
          {selectedAgents.map(agent => (
            <div key={agent.id} className="agent-tag-input__tag">
              <span className="agent-tag-input__tag-name">
                {agent.display_name}
              </span>
              <span className="agent-tag-input__tag-role">
                {agent.role}
              </span>
              <button
                type="button"
                className="agent-tag-input__tag-remove"
                onClick={() => handleRemoveAgent(agent)}
                disabled={isLoading}
                aria-label={`Remover ${agent.display_name}`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input de búsqueda */}
      <div className="agent-tag-input__search-container">
        <input
          ref={inputRef}
          type="text"
          className="agent-tag-input__search"
          placeholder={isLoading ? 'Cargando...' : 'Buscar agente por nombre o rol...'}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => {
            if (filteredAgents.length > 0) {
              setIsDropdownOpen(true);
            }
          }}
          disabled={isLoading}
        />

        {/* Dropdown de resultados */}
        {isDropdownOpen && (
          <div ref={dropdownRef} className="agent-tag-input__dropdown">
            {filteredAgents.length > 0 ? (
              filteredAgents.map(agent => (
                <button
                  key={agent.id}
                  type="button"
                  className="agent-tag-input__dropdown-item"
                  onClick={() => handleAddAgent(agent)}
                  disabled={isLoading}
                >
                  <div className="agent-tag-input__dropdown-item-content">
                    <span className="agent-tag-input__dropdown-item-name">
                      {agent.display_name}
                    </span>
                    <span className="agent-tag-input__dropdown-item-role">
                      {agent.role}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="agent-tag-input__empty">
                No se encontraron agentes
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mensaje de ayuda */}
      <p className="admin-form-help">
        {selectedAgents.length === 0
          ? 'Escribe para buscar y agregar agentes IA a este usuario.'
          : `${selectedAgents.length} ${selectedAgents.length === 1 ? 'agente asignado' : 'agentes asignados'}. Escribe para agregar más.`
        }
      </p>
    </div>
  );
}
