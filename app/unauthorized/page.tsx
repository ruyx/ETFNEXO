/**
 * Unauthorized Page
 * Página mostrada cuando un usuario autenticado no tiene permisos suficientes
 */

import Link from 'next/link';

export const metadata = {
  title: 'Acceso Denegado - ETF Nexo',
  description: 'No tienes permisos para acceder a esta página'
};

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <div className="mx-auto h-24 w-24 flex items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-12 w-12 text-red-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Acceso Denegado
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            No tienes permisos suficientes para acceder a esta página.
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Si crees que deberías tener acceso, contacta al administrador.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Link
            href="/"
            className="block w-full bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Volver al inicio
          </Link>
          <Link
            href="/admin/login"
            className="block w-full bg-gray-200 text-gray-700 rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-300 transition-colors"
          >
            Iniciar sesión con otra cuenta
          </Link>
        </div>
      </div>
    </div>
  );
}
