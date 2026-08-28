'use client';

/**
 * Admin - Crear Nueva Entrevista
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import InterviewForm from '@/components/admin/InterviewForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CrearEntrevistaPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (interviewData: any) => {
    try {
      const endpoint = `/api/admin/entrevistas/${Date.now()}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(interviewData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear la entrevista');
      }

      // Redirigir al listado con mensaje de éxito
      router.push('/admin/entrevistas?created=true');
    } catch (err: any) {
      setError(err.message || 'Error al crear la entrevista');
      throw err; // Re-throw para que InterviewForm maneje el loading state
    }
  };

  return (
    <div className="admin-form-container">
      {/* Back link */}
      <Link href="/admin/entrevistas" className="admin-form-back-link">
        <ArrowLeft className="w-4 h-4" />
        Volver al listado
      </Link>

      {/* Header */}
      <div className="admin-form-header">
        <div>
          <h1 className="admin-form-title">Crear Nueva Entrevista</h1>
          <p className="admin-form-description">
            Completa los campos para crear una nueva entrevista en video
          </p>
        </div>
      </div>

      {/* Error global */}
      {error && (
        <div className="admin-alert admin-alert--error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Form */}
      <InterviewForm
        onSubmit={handleSubmit}
        isEditing={false}
      />
    </div>
  );
}
