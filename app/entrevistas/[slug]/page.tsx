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
            <div className="flex items-center gap-4 text-sm text-slate-600 mb-8 pb-8 border-b border-slate-200">
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

            {/* Video Embed - YouTube only */}
            {interview.youtube_video_id && (
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
        <ArticleFAQ faqs={interview.faq || []} articleTitle={interview.title} />
      </main>

      <Footer />
    </>
  );
}
