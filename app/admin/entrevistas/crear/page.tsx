'use client';

/**
 * Admin - Crear Nueva Entrevista
 */

import InterviewForm from '@/components/admin/InterviewForm';

export default function CrearEntrevistaPage() {
  return (
    <div className="admin-container">
      <div className="admin-header">
        <div>
          <h1 className="admin-header__title">Crear Entrevista</h1>
          <p className="admin-header__description">
            Nueva entrevista en video
          </p>
        </div>
      </div>

      <InterviewForm />
    </div>
  );
}
