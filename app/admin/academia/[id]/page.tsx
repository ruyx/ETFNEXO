'use client';

/**
 * Admin Editar Artículo de Academia - Formulario completo de edición
 * Usa AcademiaArticleForm con integración a la API
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AcademiaArticleForm from '@/components/admin/AcademiaArticleForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EditAcademiaPageProps {
  params: {
    id: string;
  };
}

export default function EditAcademiaPage({ params }: EditAcademiaPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [initialData, setInitialData] = useState<any>(null);

  useEffect(() => {
    loadArticle();
  }, [params.id]);

  const loadArticle = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/academia/${params.id}`);

      if (!response.ok) {
        throw new Error('Error al cargar el artículo');
      }

      const result = await response.json();
      const article = result.data.article;

      // Preparar datos para el formulario
      setInitialData({
        id: article.id,
        title: article.title,
        slug: article.slug,
        excerpt: article.excerpt || '',
        content: article.content,
        category_id: article.category_id,
        author_id: article.author_id,
        meta_title: article.meta_title || '',
        meta_description: article.meta_description || '',
        featured_image_url: article.featured_image_url || '',
        featured_image_alt: article.featured_image_alt || '',
        status: article.status,
        faq: article.faq || [],
        difficulty_level: article.difficulty_level || 'beginner',
        estimated_reading_time: article.estimated_reading_time || null,
        prerequisites: article.prerequisites || []
      });
    } catch (err: any) {
      setError(err.message || 'Error al cargar el artículo');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (articleData: any) => {
    try {
      const response = await fetch(`/api/admin/academia/${params.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al actualizar el artículo');
      }

      const result = await response.json();

      // Redirigir al listado con mensaje de éxito
      router.push('/admin/academia?updated=true');
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el artículo');
      throw err; // Re-throw para que AcademiaArticleForm maneje el loading state
    }
  };

  if (loading) {
    return (
      <div className="admin-form-container">
        <div className="admin-loading">
          <p className="admin-loading__text">Cargando artículo...</p>
        </div>
      </div>
    );
  }

  if (error && !initialData) {
    return (
      <div className="admin-form-container">
        <div className="admin-alert admin-alert--error">
          <strong>Error:</strong> {error}
        </div>
        <Link href="/admin/academia" className="btn btn-secondary">
          <ArrowLeft className="w-4 h-4" />
          Volver al listado
        </Link>
      </div>
    );
  }

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
          <h1 className="admin-form-title">Editar Artículo de Academia</h1>
          <p className="admin-form-description">
            Modifica el contenido educativo sobre ETFs
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
      {initialData && (
        <AcademiaArticleForm
          initialData={initialData}
          onSubmit={handleSubmit}
          isEditing={true}
        />
      )}
    </div>
  );
}
