// @ts-nocheck
/**
 * Admin Ads Dashboard - Vista principal del panel de publicidad
 * Muestra métricas generales, estadísticas y anuncios activos
 */

import { createClient } from '@/lib/supabase/server';
import { BarChart3, Eye, MousePointerClick, TrendingUp, LineChart } from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalAds: number;
  totalImpressions: number;
  totalClicks: number;
  averageCTR: number;
}

interface RecentAd {
  id: string;
  title: string;
  type: string;
  placement: string;
  status: string;
  created_at: string;
}

async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();

  // Total ads
  const { count: totalAds } = await supabase
    .from('ads')
    .select('*', { count: 'exact', head: true });

  // Total impressions
  const { count: totalImpressions } = await supabase
    .from('ad_impressions')
    .select('*', { count: 'exact', head: true });

  // Total clicks
  const { count: totalClicks } = await supabase
    .from('ad_clicks')
    .select('*', { count: 'exact', head: true });

  // Average CTR
  const averageCTR = totalImpressions && totalImpressions > 0
    ? ((totalClicks || 0) / totalImpressions) * 100
    : 0;

  return {
    totalAds: totalAds || 0,
    totalImpressions: totalImpressions || 0,
    totalClicks: totalClicks || 0,
    averageCTR
  };
}

async function getRecentAds(): Promise<RecentAd[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('ads')
    .select('id, title, type, placement, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5);

  return data || [];
}

export default async function AdminAdsDashboard() {
  const stats = await getDashboardStats();
  const recentAds = await getRecentAds();

  return (
    <div className="admin-ads-dashboard">
      <div className="container">
        {/* Header */}
        <div className="admin-ads-dashboard__header">
          <div>
            <h1 className="admin-ads-dashboard__title">Dashboard de Publicidad</h1>
            <p className="admin-ads-dashboard__subtitle">
              Gestiona y monitorea tus campañas publicitarias
            </p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
            <Link
              href="/admin/ads/analytics"
              className="admin-ads-dashboard__cta"
              style={{ background: 'var(--color-info)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}
            >
              <LineChart className="w-4 h-4" />
              Analíticas
            </Link>
            <Link href="/admin/ads/campaigns/new" className="admin-ads-dashboard__cta">
              + Nueva Campaña
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="admin-ads-dashboard__stats">
          <div className="admin-ads-stat-card">
            <div className="admin-ads-stat-card__icon admin-ads-stat-card__icon--primary">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div className="admin-ads-stat-card__content">
              <p className="admin-ads-stat-card__label">Total Anuncios</p>
              <p className="admin-ads-stat-card__value">{stats.totalAds}</p>
            </div>
          </div>

          <div className="admin-ads-stat-card">
            <div className="admin-ads-stat-card__icon admin-ads-stat-card__icon--info">
              <Eye className="w-5 h-5" />
            </div>
            <div className="admin-ads-stat-card__content">
              <p className="admin-ads-stat-card__label">Impresiones</p>
              <p className="admin-ads-stat-card__value">{stats.totalImpressions.toLocaleString()}</p>
            </div>
          </div>

          <div className="admin-ads-stat-card">
            <div className="admin-ads-stat-card__icon admin-ads-stat-card__icon--success">
              <MousePointerClick className="w-5 h-5" />
            </div>
            <div className="admin-ads-stat-card__content">
              <p className="admin-ads-stat-card__label">Clicks</p>
              <p className="admin-ads-stat-card__value">{stats.totalClicks.toLocaleString()}</p>
            </div>
          </div>

          <div className="admin-ads-stat-card">
            <div className="admin-ads-stat-card__icon admin-ads-stat-card__icon--warning">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div className="admin-ads-stat-card__content">
              <p className="admin-ads-stat-card__label">CTR Promedio</p>
              <p className="admin-ads-stat-card__value">{stats.averageCTR.toFixed(2)}%</p>
            </div>
          </div>
        </div>

        {/* Recent Ads */}
        <div className="admin-ads-dashboard__section">
          <div className="admin-ads-dashboard__section-header">
            <h2 className="admin-ads-dashboard__section-title">Anuncios Recientes</h2>
            <Link href="/admin/ads/campaigns" className="admin-ads-dashboard__section-link">
              Ver todos →
            </Link>
          </div>

          <div className="admin-ads-card">
            <div className="admin-ads-table-container">
              <table className="admin-ads-table">
                <thead>
                  <tr>
                    <th>Título</th>
                    <th>Tipo</th>
                    <th>Ubicación</th>
                    <th>Estado</th>
                    <th>Creado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAds.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="admin-ads-table__empty">
                        No hay anuncios todavía. <Link href="/admin/ads/campaigns/new">Crea el primero</Link>
                      </td>
                    </tr>
                  ) : (
                    recentAds.map((ad) => (
                      <tr key={ad.id}>
                        <td>{ad.title}</td>
                        <td>
                          <span className="admin-ads-badge admin-ads-badge--neutral">
                            {ad.type === 'image_banner' ? 'Banner Imagen' :
                             ad.type === 'text_banner' ? 'Banner Texto' :
                             'Script'}
                          </span>
                        </td>
                        <td>{ad.placement}</td>
                        <td>
                          <span className={`admin-ads-badge admin-ads-badge--${
                            ad.status === 'active' ? 'success' :
                            ad.status === 'paused' ? 'warning' :
                            'neutral'
                          }`}>
                            {ad.status === 'active' ? 'Activo' :
                             ad.status === 'paused' ? 'Pausado' :
                             'Inactivo'}
                          </span>
                        </td>
                        <td>{new Date(ad.created_at).toLocaleDateString('es-ES')}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
