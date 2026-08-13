/**
 * Admin Layout - Protected Layout for Admin Panel
 * Usa el mismo Header que el resto del sitio
 */

import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth/check-admin';
import Header from '@/components/Header';

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
    // No autenticado → redirigir a login con returnTo
    redirect('/login?redirectTo=/admin');
  }

  // Verificar que tenga permisos (al menos redactor)
  if (authUser.role === 'viewer') {
    // Solo viewer → no tiene acceso al admin
    redirect('/unauthorized');
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
}
