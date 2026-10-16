'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-light flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="font-heading text-9xl font-bold text-primary">
            404
          </h1>
        </div>

        {/* Title */}
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
          Página no encontrada
        </h2>

        {/* Description */}
        <p className="text-lg text-slate-600 mb-8 max-w-md mx-auto">
          Lo sentimos, la página que buscas no existe o ha sido movida.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href="/"
            className="btn-primary"
          >
            <Home className="w-5 h-5" />
            Ir al Inicio
          </Link>

          <button
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver Atrás
          </button>
        </div>

        {/* Quick Links */}
        <div className="mt-12 pt-8 border-t border-slate-200">
          <p className="text-sm text-slate-500 mb-4">Páginas populares:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/noticias"
              className="text-sm text-secondary-dark hover:text-primary hover:underline"
            >
              Noticias
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              href="/entrevistas"
              className="text-sm text-secondary-dark hover:text-primary hover:underline"
            >
              Entrevistas
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              href="/academia"
              className="text-sm text-secondary-dark hover:text-primary hover:underline"
            >
              Academia
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              href="/etfs"
              className="text-sm text-secondary-dark hover:text-primary hover:underline"
            >
              ETFs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
