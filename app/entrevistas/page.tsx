'use client';

/**
 * Entrevistas - Listado público de entrevistas en video
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import InterviewCard from '@/components/InterviewCard';
import type { Interview } from '@/components/InterviewCard';

export default function EntrevistasPage() {
  const searchParams = useSearchParams();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 12;

  useEffect(() => {
    loadInterviews();
  }, [currentPage]);

  const loadInterviews = async () => {
    setLoading(true);
    try {
      const offset = (currentPage - 1) * limit;
      const response = await fetch(`/api/v1/entrevistas?limit=${limit}&offset=${offset}`);

      if (!response.ok) {
        throw new Error('Error al cargar entrevistas');
      }

      const result = await response.json();
      setInterviews(result.data || []);
      setTotalCount(result.count || 0);
    } catch (error) {
      console.error('Error loading interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <>
      <Header />

      <main className="bg-slate-50 min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16">
          <div className="container">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Entrevistas
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl">
              Conversaciones con expertos del sector financiero sobre ETFs, inversión y mercados
            </p>
          </div>
        </section>

        {/* Interviews Grid */}
        <section className="py-12">
          <div className="container">
            {loading ? (
              <div className="text-center py-12">
                <p className="text-slate-600">Cargando entrevistas...</p>
              </div>
            ) : interviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-600">No hay entrevistas disponibles</p>
              </div>
            ) : (
              <>
                {/* Featured Interview (first one) */}
                {interviews.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-bold mb-6 text-slate-900">
                      Destacada
                    </h2>
                    <InterviewCard interview={interviews[0]} variant="featured" />
                  </div>
                )}

                {/* Grid of other interviews */}
                {interviews.length > 1 && (
                  <>
                    <h2 className="text-2xl font-bold mb-6 text-slate-900">
                      Todas las Entrevistas
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                      {interviews.slice(1).map((interview) => (
                        <InterviewCard key={interview.id} interview={interview} />
                      ))}
                    </div>
                  </>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="btn btn-secondary"
                    >
                      Anterior
                    </button>
                    <span className="flex items-center px-4 text-sm text-slate-600">
                      Página {currentPage} de {totalPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="btn btn-secondary"
                    >
                      Siguiente
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>
    </>
  );
}
