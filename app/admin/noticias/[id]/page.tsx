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
      <div className="admin-form-container">
        <div className="admin-loading">Cargando artículo...</div>
      </div>
    );
  }

  if (error && !articleData) {
    return (
      <div className="admin-form-container">
        <div className="admin-alert admin-alert--error">
          <strong>Error:</strong> Error al cargar artículo - {error}
        </div>
        <Link href="/admin/noticias" className="btn btn-secondary">
          <ArrowLeft className="w-4 h-4" />
          Volver al listado
        </Link>
      </div>
    );
  }

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
          <h1 className="admin-form-title">Editar Noticia</h1>
          <p className="admin-form-description">
            Modifica el contenido del artículo usando los editores
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
