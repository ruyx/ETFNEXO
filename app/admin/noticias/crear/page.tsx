'use client';

/**
 * Admin Crear Noticia - Formulario de creación de artículos
 * Usa ArticleForm con integración a la API
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ArticleForm from '@/components/admin/ArticleForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CrearNoticiaPage() {
  const router = useRouter();
  const [error, setError] = useState('');

  const handleSubmit = async (articleData: any) => {
    try {
      const response = await fetch('/api/admin/noticias', {
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
      router.push('/admin/noticias?created=true');
    } catch (err: any) {
      setError(err.message || 'Error al crear el artículo');
      throw err; // Re-throw para que ArticleForm maneje el loading state
    }
  };

  return (
    <div className="admin-form-container">
      {/* Back link */}
      <Link href="/admin/noticias" className="admin-form-back-link">
        <ArrowLeft className="w-4 h-4" />
        Volver al listado
      </Link>

      {/* Header */}
      <div className="admin-form-header">
        <div>
          <h1 className="admin-form-title">Crear Nueva Noticia</h1>
          <p className="admin-form-description">
            Completa los campos y usa los editores para crear un nuevo artículo
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
      <ArticleForm
        onSubmit={handleSubmit}
        isEditing={false}
      />
    </div>
  );
}
