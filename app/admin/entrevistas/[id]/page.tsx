'use client';

/**
 * Admin - Editar Entrevista
 */

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import InterviewForm from '@/components/admin/InterviewForm';

export default function EditarEntrevistaPage() {
  const params = useParams();
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterview();
  }, []);

  const loadInterview = async () => {
    try {
      const response = await fetch(`/api/admin/entrevistas/${params.id}`);
      if (response.ok) {
        const result = await response.json();
        setInterview(result.data);
      }
    } catch (error) {
      console.error('Error loading interview:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1 className="admin-header__title">Editar Entrevista</h1>
          <p className="admin-header__description">
            Modifica la información de la entrevista
          </p>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <p className="admin-loading__text">Cargando entrevista...</p>
        </div>
      ) : interview ? (
        <InterviewForm initialData={interview} isEditing />
      ) : (
        <div className="admin-empty-state">
          <p className="admin-empty-state__text">Entrevista no encontrada</p>
        </div>
      )}
    </div>
  );
}
