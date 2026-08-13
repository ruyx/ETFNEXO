'use client';

/**
 * Admin Editar Noticia - Formulario de edición de artículos
 * Usa ArticleForm con datos existentes del artículo
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ArticleForm from '@/components/admin/ArticleForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EditNoticiaPageProps {
  params: {
    id: string;
  };
}

export default function EditNoticiaPage({ params }: EditNoticiaPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [articleData, setArticleData] = useState<any>(null);

  useEffect(() => {
    loadArticle();
  }, [params.id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/noticias/${params.id}`);

      if (!response.ok) {
        throw new Error('Error al cargar el artículo');
      }

      const result = await response.json();
      setArticleData(result.data.article);
    } catch (err: any) {
      setError(err.message || 'Error al cargar el artículo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (updatedData: any) => {
    try {
      const response = await fetch(`/api/admin/noticias/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el artículo');
      }

      // Redirigir al listado con mensaje de éxito
      router.push('/admin/noticias?updated=true');
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el artículo');
      throw err; // Re-throw para que ArticleForm maneje el loading state
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600">Cargando artículo...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !articleData) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="card bg-red-50 border-red-200">
          <h2 className="heading-3 text-red-900 mb-2">Error al cargar artículo</h2>
          <p className="text-red-700">{error}</p>
          <Link
            href="/admin/noticias"
            className="btn-secondary mt-4 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al listado
          </Link>
        </div>
      </div>
    );
  }

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

        <h1 className="heading-1 text-slate-900">Editar Noticia</h1>
        <p className="mt-2 text-slate-600">
          Modifica los campos del artículo según sea necesario
        </p>
      </div>

      {/* Error global */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form */}
      {articleData && (
        <ArticleForm
          initialData={articleData}
          onSubmit={handleSubmit}
          isEditing={true}
        />
      )}
    </div>
  );
}
