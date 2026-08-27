/**
 * Admin Ads Layout - Layout con navegación lateral para gestión de publicidad
 * Solo accesible para usuarios con rol admin
 */

import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/auth/check-admin';
import Link from 'next/link';
import { LayoutDashboard, Users, Megaphone, MapPin, BarChart3 } from 'lucide-react';
import './styles.css';
import './common.css';
import './dashboard.css';
import './campaigns/campaigns.css';
import './analytics/analytics.css';
import './placements/placements.css';

export const metadata = {
  title: 'Gestión de Publicidad - ETF Nexo',
  description: 'Panel de administración de publicidad y anuncios'
};

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  {
    href: '/admin/ads',
    label: 'Dashboard',
    icon: LayoutDashboard
  },
  {
    href: '/admin/ads/advertisers',
    label: 'Anunciantes',
    icon: Users
  },
  {
    href: '/admin/ads/campaigns',
    label: 'Campañas',
    icon: Megaphone
  },
  {
    href: '/admin/ads/placements',
    label: 'Ubicaciones',
    icon: MapPin
  },
  {
    href: '/admin/ads/analytics',
    label: 'Analíticas',
    icon: BarChart3
  }
];

export default async function AdminAdsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Verificar autenticación
  const authUser = await getAuthenticatedUser();

  if (!authUser) {
    redirect('/login?redirectTo=/admin/ads');
  }

  // Verificar que sea admin (más estricto que el layout general)
  if (authUser.role !== 'admin') {
    redirect('/unauthorized');
  }

  return (
    <div className="admin-ads-layout">
      {/* Sidebar */}
      <aside className="admin-ads-sidebar">
        <div className="admin-ads-sidebar__header">
          <Megaphone className="admin-ads-sidebar__header-icon" />
          <h2 className="admin-ads-sidebar__header-title">Publicidad</h2>
        </div>

        <nav className="admin-ads-sidebar__nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="admin-ads-sidebar__nav-item"
            >
              <item.icon className="admin-ads-sidebar__nav-icon" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="admin-ads-content">
        {children}
      </main>
    </div>
  );
}
