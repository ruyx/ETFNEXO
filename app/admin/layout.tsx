/**
 * Admin Layout - Protected Layout for Admin Panel
 * Verifica autenticación y permisos antes de mostrar contenido
 */

import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth/check-admin';
import Link from 'next/link';

export const metadata = {
  title: 'Panel Admin - ETF Nexo',
  description: 'Panel de administración de ETF Nexo'
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificar autenticación
  const authUser = await getAuthenticatedUser();

  if (!authUser) {
    // No autenticado → redirigir a login
    redirect('/admin/login');
  }

  // Verificar que tenga permisos (al menos redactor)
  if (authUser.role === 'viewer') {
    // Solo viewer → no tiene acceso al admin
    redirect('/unauthorized');
  }

  const isAdmin = authUser.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header del Admin */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center">
              <Link
                href="/admin"
                className="text-xl font-bold text-gray-900 hover:text-gray-700"
              >
                ETF Nexo Admin
              </Link>
            </div>

            {/* Navegación principal */}
            <nav className="hidden md:flex space-x-8">
              <Link
                href="/admin"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                href="/admin/noticias"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Noticias
              </Link>
              {isAdmin && (
                <>
                  <Link
                    href="/admin/categorias"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Categorías
                  </Link>
                  <Link
                    href="/admin/usuarios"
                    className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Usuarios
                  </Link>
                </>
              )}
            </nav>

            {/* Usuario y logout */}
            <div className="flex items-center space-x-4">
              <div className="text-sm">
                <p className="text-gray-900 font-medium">
                  {authUser.profile.full_name || authUser.user.email}
                </p>
                <p className="text-gray-500 text-xs capitalize">
                  {authUser.role}
                </p>
              </div>
              <Link
                href="/api/auth/logout"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Salir
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            ETF Nexo Admin Panel - {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
}
