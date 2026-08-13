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
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/admin/noticias"
          className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver al listado
        </Link>

        <h1 className="heading-1 text-slate-900">Crear Nueva Noticia</h1>
        <p className="mt-2 text-slate-600">
          Completa los campos para crear un nuevo artículo
        </p>
      </div>

      {/* Error global */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
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
