'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import UserCard, { UserProfile } from '@/components/UserCard';

export default function UsuariosPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [roleFilter, setRoleFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, [page, roleFilter, debouncedSearch]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });

      if (roleFilter) params.append('role', roleFilter);
      if (debouncedSearch) params.append('search', debouncedSearch);

      const response = await fetch(`/api/admin/usuarios?${params}`);
      const result = await response.json();

      if (result.error) {
        setError(result.error || 'Error al cargar usuarios');
      } else if (result.data) {
        setUsers(result.data.users || []);
        setTotalPages(result.data.pagination.totalPages || 1);
        setTotalUsers(result.data.pagination.total || 0);
      } else {
        setError('Respuesta inesperada del servidor');
      }
    } catch (error) {
      console.error('[UsuariosPage] Fetch error:', error);
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (roleFilter) params.append('role', roleFilter);
    if (debouncedSearch) params.append('search', debouncedSearch);

    window.open(`/api/admin/usuarios/export?${params}`, '_blank');
  };

  // Calculate stats
  const activeUsers = users.filter(u => u.email_confirmed_at).length;
  const adminCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1 className="admin-header__title">Gestión de Usuarios</h1>
          <p className="admin-header__description">
            {totalUsers} usuario{totalUsers !== 1 ? 's' : ''} registrado{totalUsers !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="admin-header-actions">
          <button
            onClick={handleExport}
            className="btn-secondary"
            disabled={loading}
          >
            <svg className="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Exportar CSV
          </button>
          <Link href="/admin/usuarios/crear" className="btn btn-primary">
            <Plus className="w-4 h-4" />
            Nuevo Usuario
          </Link>
        </div>
      </div>

      {/* Stats */}
      {users.length > 0 && (
        <div className="admin-stats-grid">
          <div className="admin-stat-card">
            <p className="admin-stat-card__label">Total Usuarios</p>
            <p className="admin-stat-card__value">{totalUsers}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-card__label">Verificados</p>
            <p className="admin-stat-card__value">{activeUsers}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-card__label">Administradores</p>
            <p className="admin-stat-card__value">{adminCount}</p>
          </div>
          <div className="admin-stat-card">
            <p className="admin-stat-card__label">Página</p>
            <p className="admin-stat-card__value">{page} / {totalPages}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="admin-filters">
        <div className="admin-filters-grid">
          <div className="admin-filter-group">
            <label className="admin-filter-label">Buscar</label>
            <input
              type="text"
              placeholder="Nombre, email o username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-input"
            />
          </div>

          <div className="admin-filter-group">
            <label className="admin-filter-label">Rol</label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPage(1);
              }}
              className="admin-select"
            >
              <option value="">Todos los roles</option>
              <option value="admin">Administrador</option>
              <option value="editor">Editor</option>
              <option value="redactor">Redactor</option>
              <option value="viewer">Lector</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="admin-error-message">
          <svg className="admin-error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="admin-error-title">Error al cargar usuarios</p>
            <p className="admin-error-text">{error}</p>
          </div>
          <button onClick={fetchUsers} className="btn-secondary btn-sm">
            Reintentar
          </button>
        </div>
      )}

      {/* Users Grid */}
      <div className="admin-content-section">
        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Cargando usuarios...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty">
            <svg className="admin-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="admin-empty__title">No se encontraron usuarios</p>
            <p className="admin-empty__description">
              {debouncedSearch || roleFilter
                ? 'Intenta ajustar los filtros o crear un nuevo usuario'
                : 'Crea tu primer usuario para comenzar'}
            </p>
            <Link href="/admin/usuarios/crear" className="btn btn-primary">
              <Plus className="w-4 h-4" />
              Crear Primer Usuario
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {users.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="admin-pagination">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="admin-pagination-btn"
                >
                  Anterior
                </button>
                <span className="admin-pagination-info">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="admin-pagination-btn"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
