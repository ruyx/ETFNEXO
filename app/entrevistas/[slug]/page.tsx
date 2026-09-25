// @ts-nocheck
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ArticleFAQ from '@/components/ArticleFAQ';
import { Calendar, Eye, ArrowLeft } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';

export const revalidate = 3600;

interface PageProps {
  params: { slug: string };
}

async function getInterview(slug: string) {
  try {
    const supabase = createAdminClient();

    const { data: interview, error } = await supabase
      .from('interviews_with_metadata')
      .select('*')
      .eq('slug' as any, slug as any)
      .eq('status' as any, 'published' as any)
      .single();

    if (error || !interview) {
      return null;
    }

    return interview;
  } catch (error) {
    console.error('Error fetching interview:', error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const interview = await getInterview(params.slug);

  if (!interview) {
    return {
      title: 'Entrevista no encontrada | ETF Nexo',
    };
  }

  return {
    title: interview.meta_title || `${interview.title} | Entrevistas ETF Nexo`,
    description: interview.meta_description || interview.description || undefined,
    openGraph: {
      title: interview.meta_title || interview.title || undefined,
      description: interview.meta_description || interview.description || undefined,
    },
  };
}

export default async function EntrevistaDetailPage({ params }: PageProps) {
  const interview = await getInterview(params.slug);

  if (!interview) {
    notFound();
  }

  const publishedDate = interview.published_at
    ? new Date(interview.published_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Fecha no disponible';

  // Determinar autor (autor de entrevista)
  const displayAuthorName = interview.author_display_name || interview.author_name || 'ETF Nexo';
  const authorSlug = interview.author_slug || null;
  const authorAvatar = interview.author_avatar_url || null;

  // Link a perfil del autor
  const authorLink = authorSlug ? `/autores/${authorSlug}` : null;

  // Función para obtener iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <Header />

      <main className="bg-slate-50 min-h-screen">
        {/* Breadcrumb */}
        <section className="bg-white border-b border-slate-200 py-4">
          <div className="container">
            <nav className="flex items-center gap-2 text-sm text-slate-600">
              <Link href="/" className="hover:text-slate-900">
                Inicio
              </Link>
              <span>/</span>
              <Link href="/entrevistas" className="hover:text-slate-900">
                Entrevistas
              </Link>
              <span>/</span>
              <span className="text-slate-900">{interview.category_name || 'Entrevista'}</span>
            </nav>
          </div>
        </section>

        {/* Content */}
        <article className="py-12">
          <div className="container max-w-4xl">
            {/* Category Badge */}
            {interview.category_name && (
              <div className="mb-6">
                <span
                  className="inline-block px-3 py-1 text-sm font-semibold rounded-full text-white"
                  style={{ backgroundColor: interview.category_color || 'var(--color-primary)' }}
                >
                  {interview.category_name}
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">
              {interview.title}
            </h1>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-slate-600 mb-8 pb-8 border-b border-slate-200 flex-wrap">
              {/* Author */}
              <div className="flex items-center gap-2">
                {authorLink ? (
                  <Link
                    href={authorLink}
                    className="flex items-center gap-2 hover:text-slate-900 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
                      {authorAvatar ? (
                        <img
                          src={authorAvatar}
                          alt={displayAuthorName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-semibold text-slate-600">
                          {getInitials(displayAuthorName)}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">{displayAuthorName}</span>
                  </Link>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 flex items-center justify-center">
                      <span className="text-xs font-semibold text-slate-600">
                        {getInitials(displayAuthorName)}
                      </span>
                    </div>
                    <span className="font-medium">{displayAuthorName}</span>
                  </div>
                )}
              </div>

              <span className="text-slate-300">•</span>

              {/* Date */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time dateTime={interview.published_at || undefined}>
                  {publishedDate}
                </time>
              </div>

              {interview.views_count > 0 && (
                <>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    <span>{interview.views_count} vistas</span>
                  </div>
                </>
              )}
            </div>

            {/* Featured Image */}
            {interview.featured_image_url && (
              <div className="mb-8">
                <img
                  src={interview.featured_image_url}
                  alt={interview.featured_image_alt || interview.title}
                  className="w-full rounded-lg shadow-lg"
                  style={{ maxHeight: '500px', objectFit: 'cover' }}
                />
              </div>
            )}

            {/* Content - Always show if exists */}
            {interview.content && (
              <div className="mb-12 prose prose-slate max-w-none">
                {/* Video Embed - Floats to the right if content exists */}
                {interview.youtube_video_id && (
                  <div className="float-right ml-6 mb-6 w-full md:w-96 bg-slate-100 rounded-lg overflow-hidden shadow-lg">
                    <div className="aspect-video">
                      <iframe
                        width="100%"
                        height="100%"
                        src={`https://www.youtube.com/embed/${interview.youtube_video_id}`}
                        title={interview.title}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                )}
                <div dangerouslySetInnerHTML={{ __html: interview.content }} />
                <div className="clear-both"></div>
              </div>
            )}

            {/* Video only - Show full width if no content */}
            {!interview.content && interview.youtube_video_id && (
              <div className="mb-12">
                <div className="aspect-video bg-slate-100 rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    width="100%"
                    height="100%"
                    src={`https://www.youtube.com/embed/${interview.youtube_video_id}`}
                    title={interview.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Disclosure Legal */}
            <div className="mt-8 p-6 bg-slate-50 border-l-4 border-blue-500 rounded-r-lg">
              <p className="text-sm text-slate-600 leading-relaxed">
                <strong className="text-slate-900">Aviso:</strong> Las opiniones de este artículo tienen carácter exclusivamente informativo y educativo y no constituyen asesoramiento ni recomendación de inversión. La rentabilidad pasada no garantiza resultados futuros y toda inversión implica riesgos, incluida la posible pérdida de capital. Antes de invertir, consulte la documentación oficial del producto y valore su situación financiera y perfil de riesgo.
              </p>
            </div>

            {/* Back to Entrevistas */}
            <div className="mt-12 pt-8 border-t border-slate-200">
              <Link
                href="/entrevistas"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a Entrevistas</span>
              </Link>
            </div>
          </div>
        </article>

        {/* FAQ Floating Bubble */}
        <ArticleFAQ
          faqs={interview.faq || []}
          articleTitle={interview.title}
          sponsors={interview.sponsors || []}
        />
      </main>

      <Footer />
    </>
  );
}
