'use client';

import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Number */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
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
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-lg hover:shadow-xl"
          >
            <Home className="w-5 h-5" />
            Ir al Inicio
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-slate-700 font-semibold rounded-lg hover:bg-slate-50 transition-colors border border-slate-200 shadow-sm hover:shadow-md"
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
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Noticias
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              href="/entrevistas"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Entrevistas
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              href="/academia"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              Academia
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              href="/etfs"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              ETFs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
