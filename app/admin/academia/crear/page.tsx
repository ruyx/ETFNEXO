'use client';

/**
 * Admin Crear Artículo de Academia - Formulario completo de creación
 * Usa AcademiaArticleForm con integración a la API
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AcademiaArticleForm from '@/components/admin/AcademiaArticleForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CrearAcademiaPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (articleData: any) => {
    try {
      const response = await fetch('/api/admin/academia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el artículo');
      }

      const result = await response.json();

      // Redirigir al listado con mensaje de éxito
      router.push('/admin/academia?created=true');
    } catch (err: any) {
      setError(err.message || 'Error al crear el artículo');
      throw err; // Re-throw para que AcademiaArticleForm maneje el loading state
    }
  };

  return (
    <div className="admin-form-container">
      {/* Back link */}
      <Link href="/admin/academia" className="admin-form-back-link">
        <ArrowLeft className="w-4 h-4" />
        Volver al listado
      </Link>

      {/* Header */}
      <div className="admin-form-header">
        <div>
          <h1 className="admin-form-title">Crear Artículo de Academia</h1>
          <p className="admin-form-description">
            Crea contenido educativo sobre ETFs con especialistas formadores
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
      <AcademiaArticleForm
        onSubmit={handleSubmit}
        isEditing={false}
      />
    </div>
  );
}
