// @ts-nocheck
/**
 * Advertisers List - Listado de anunciantes
 * CRUD completo para gestión de anunciantes
 */

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, Eye, Edit, Trash2 } from 'lucide-react';
import DeleteAdvertiserButton from './DeleteAdvertiserButton';

interface Advertiser {
  id: string;
  name: string;
  email: string | null;
  website: string | null;
  contact_person: string | null;
  phone: string | null;
  status: string;
  created_at: string;
  ad_count?: number;
}

async function getAdvertisers(): Promise<Advertiser[]> {
  const supabase = await createClient();

  // Get advertisers with count of associated ads
  const { data: advertisers } = await supabase
    .from('advertisers')
    .select('*')
    .order('created_at', { ascending: false });

  if (!advertisers) return [];

  // Get ad counts for each advertiser
  const advertisersWithCounts = await Promise.all(
    advertisers.map(async (advertiser) => {
      const { count } = await supabase
        .from('ads')
        .select('*', { count: 'exact', head: true })
        .eq('advertiser_id', advertiser.id);

      return {
        ...advertiser,
        ad_count: count || 0
      };
    })
  );

  return advertisersWithCounts;
}

export default async function AdvertisersPage() {
  const advertisers = await getAdvertisers();

  return (
    <div className="admin-ads-page">
      <div className="container">
        {/* Header */}
        <div className="admin-ads-page__header">
          <div>
            <h1 className="admin-ads-page__title">Anunciantes</h1>
            <p className="admin-ads-page__subtitle">
              Gestiona los anunciantes y sus campañas publicitarias
            </p>
          </div>
          <Link href="/admin/ads/advertisers/new" className="admin-ads-btn admin-ads-btn--primary">
            <Plus className="w-4 h-4" />
            Nuevo Anunciante
          </Link>
        </div>

        {/* Stats Summary */}
        <div className="admin-ads-stats-mini">
          <div className="admin-ads-stat-mini">
            <span className="admin-ads-stat-mini__label">Total</span>
            <span className="admin-ads-stat-mini__value">{advertisers.length}</span>
          </div>
          <div className="admin-ads-stat-mini">
            <span className="admin-ads-stat-mini__label">Activos</span>
            <span className="admin-ads-stat-mini__value admin-ads-stat-mini__value--success">
              {advertisers.filter(a => a.status === 'active').length}
            </span>
          </div>
          <div className="admin-ads-stat-mini">
            <span className="admin-ads-stat-mini__label">Inactivos</span>
            <span className="admin-ads-stat-mini__value admin-ads-stat-mini__value--neutral">
              {advertisers.filter(a => a.status === 'inactive').length}
            </span>
          </div>
          <div className="admin-ads-stat-mini">
            <span className="admin-ads-stat-mini__label">Suspendidos</span>
            <span className="admin-ads-stat-mini__value admin-ads-stat-mini__value--danger">
              {advertisers.filter(a => a.status === 'suspended').length}
            </span>
          </div>
        </div>

        {/* Table */}
        <div className="admin-ads-card">
          <div className="admin-ads-table-container">
            <table className="admin-ads-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Contacto</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>Anuncios</th>
                  <th>Estado</th>
                  <th>Creado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {advertisers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="admin-ads-table__empty">
                      No hay anunciantes todavía. <Link href="/admin/ads/advertisers/new">Crea el primero</Link>
                    </td>
                  </tr>
                ) : (
                  advertisers.map((advertiser) => (
                    <tr key={advertiser.id}>
                      <td className="admin-ads-table__name">
                        <Link href={`/admin/ads/advertisers/${advertiser.id}`}>
                          {advertiser.name}
                        </Link>
                      </td>
                      <td>{advertiser.contact_person || '-'}</td>
                      <td>
                        {advertiser.email ? (
                          <a href={`mailto:${advertiser.email}`} className="admin-ads-table__link">
                            {advertiser.email}
                          </a>
                        ) : '-'}
                      </td>
                      <td>{advertiser.phone || '-'}</td>
                      <td>
                        <span className="admin-ads-count-badge">
                          {advertiser.ad_count}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-ads-badge admin-ads-badge--${
                          advertiser.status === 'active' ? 'success' :
                          advertiser.status === 'inactive' ? 'neutral' :
                          'danger'
                        }`}>
                          {advertiser.status === 'active' ? 'Activo' :
                           advertiser.status === 'inactive' ? 'Inactivo' :
                           'Suspendido'}
                        </span>
                      </td>
                      <td>{new Date(advertiser.created_at).toLocaleDateString('es-ES')}</td>
                      <td>
                        <div className="admin-ads-table__actions">
                          <Link
                            href={`/admin/ads/advertisers/${advertiser.id}`}
                            className="admin-ads-icon-btn admin-ads-icon-btn--view"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/ads/advertisers/${advertiser.id}/edit`}
                            className="admin-ads-icon-btn admin-ads-icon-btn--edit"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <DeleteAdvertiserButton
                            advertiserId={advertiser.id}
                            advertiserName={advertiser.name}
                            hasAds={advertiser.ad_count! > 0}
                          />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
