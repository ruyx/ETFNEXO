// @ts-nocheck
/**
 * Advertiser Detail Page - Vista de detalle de anunciante
 * Muestra información completa y anuncios asociados
 */

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Mail, Phone, Globe, User, Calendar, FileText, Eye, MousePointerClick } from 'lucide-react';

interface PageProps {
  params: { id: string };
}

async function getAdvertiser(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('advertisers')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function getAdvertiserAds(advertiserId: string) {
  const supabase = await createClient();

  const { data } = await supabase
    .from('ads')
    .select('id, name, type, placement, status, impressions_count, clicks_count, created_at')
    .eq('advertiser_id', advertiserId)
    .order('created_at', { ascending: false });

  return data || [];
}

export async function generateMetadata({ params }: PageProps) {
  const advertiser = await getAdvertiser(params.id);

  return {
    title: advertiser ? `${advertiser.name} - ETF Nexo` : 'Anunciante No Encontrado',
    description: `Detalle del anunciante ${advertiser?.name || ''}`
  };
}

export default async function AdvertiserDetailPage({ params }: PageProps) {
  const advertiser = await getAdvertiser(params.id);

  if (!advertiser) {
    notFound();
  }

  const ads = await getAdvertiserAds(params.id);

  const totalImpressions = ads.reduce((sum, ad) => sum + (ad.impressions_count || 0), 0);
  const totalClicks = ads.reduce((sum, ad) => sum + (ad.clicks_count || 0), 0);
  const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return (
    <div className="admin-ads-page">
      {/* Header */}
      <div className="admin-ads-page__header">
        <div>
          <h1 className="admin-ads-page__title">{advertiser.name}</h1>
          <p className="admin-ads-page__subtitle">
            Detalle del anunciante y sus campañas
          </p>
        </div>
        <div className="admin-ads-page__header-actions">
          <Link href="/admin/ads/advertisers" className="admin-ads-btn admin-ads-btn--secondary">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <Link href={`/admin/ads/advertisers/${params.id}/edit`} className="admin-ads-btn admin-ads-btn--primary">
            <Edit className="w-4 h-4" />
            Editar
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="admin-ads-dashboard__stats">
        <div className="admin-ads-stat-card">
          <div className="admin-ads-stat-card__icon admin-ads-stat-card__icon--primary">
            <FileText className="w-5 h-5" />
          </div>
          <div className="admin-ads-stat-card__content">
            <p className="admin-ads-stat-card__label">Total Anuncios</p>
            <p className="admin-ads-stat-card__value">{ads.length}</p>
          </div>
        </div>

        <div className="admin-ads-stat-card">
          <div className="admin-ads-stat-card__icon admin-ads-stat-card__icon--info">
            <Eye className="w-5 h-5" />
          </div>
          <div className="admin-ads-stat-card__content">
            <p className="admin-ads-stat-card__label">Impresiones</p>
            <p className="admin-ads-stat-card__value">{totalImpressions.toLocaleString()}</p>
          </div>
        </div>

        <div className="admin-ads-stat-card">
          <div className="admin-ads-stat-card__icon admin-ads-stat-card__icon--success">
            <MousePointerClick className="w-5 h-5" />
          </div>
          <div className="admin-ads-stat-card__content">
            <p className="admin-ads-stat-card__label">Clicks</p>
            <p className="admin-ads-stat-card__value">{totalClicks.toLocaleString()}</p>
          </div>
        </div>

        <div className="admin-ads-stat-card">
          <div className="admin-ads-stat-card__icon admin-ads-stat-card__icon--warning">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="admin-ads-stat-card__content">
            <p className="admin-ads-stat-card__label">CTR</p>
            <p className="admin-ads-stat-card__value">{averageCTR.toFixed(2)}%</p>
          </div>
        </div>
      </div>

      <div className="admin-ads-detail-grid">
        {/* Información del Anunciante */}
        <div className="admin-ads-card">
          <div className="admin-ads-card__header">
            <h2 className="admin-ads-card__title">Información del Anunciante</h2>
            <span className={`admin-ads-badge admin-ads-badge--${
              advertiser.status === 'active' ? 'success' :
              advertiser.status === 'inactive' ? 'neutral' :
              'danger'
            }`}>
              {advertiser.status === 'active' ? 'Activo' :
               advertiser.status === 'inactive' ? 'Inactivo' :
               'Suspendido'}
            </span>
          </div>

          <div className="admin-ads-info-list">
            {advertiser.email && (
              <div className="admin-ads-info-item">
                <Mail className="admin-ads-info-item__icon" />
                <div>
                  <p className="admin-ads-info-item__label">Email</p>
                  <a href={`mailto:${advertiser.email}`} className="admin-ads-info-item__value admin-ads-info-item__value--link">
                    {advertiser.email}
                  </a>
                </div>
              </div>
            )}

            {advertiser.website && (
              <div className="admin-ads-info-item">
                <Globe className="admin-ads-info-item__icon" />
                <div>
                  <p className="admin-ads-info-item__label">Sitio Web</p>
                  <a href={advertiser.website} target="_blank" rel="noopener noreferrer" className="admin-ads-info-item__value admin-ads-info-item__value--link">
                    {advertiser.website}
                  </a>
                </div>
              </div>
            )}

            {advertiser.contact_person && (
              <div className="admin-ads-info-item">
                <User className="admin-ads-info-item__icon" />
                <div>
                  <p className="admin-ads-info-item__label">Contacto</p>
                  <p className="admin-ads-info-item__value">{advertiser.contact_person}</p>
                </div>
              </div>
            )}

            {advertiser.phone && (
              <div className="admin-ads-info-item">
                <Phone className="admin-ads-info-item__icon" />
                <div>
                  <p className="admin-ads-info-item__label">Teléfono</p>
                  <a href={`tel:${advertiser.phone}`} className="admin-ads-info-item__value admin-ads-info-item__value--link">
                    {advertiser.phone}
                  </a>
                </div>
              </div>
            )}

            <div className="admin-ads-info-item">
              <Calendar className="admin-ads-info-item__icon" />
              <div>
                <p className="admin-ads-info-item__label">Creado</p>
                <p className="admin-ads-info-item__value">
                  {new Date(advertiser.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {advertiser.notes && (
              <div className="admin-ads-info-item admin-ads-info-item--full">
                <FileText className="admin-ads-info-item__icon" />
                <div>
                  <p className="admin-ads-info-item__label">Notas</p>
                  <p className="admin-ads-info-item__value">{advertiser.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Anuncios */}
        <div className="admin-ads-card admin-ads-card--full">
          <div className="admin-ads-card__header">
            <h2 className="admin-ads-card__title">Anuncios ({ads.length})</h2>
            <Link href="/admin/ads/campaigns/new" className="admin-ads-btn admin-ads-btn--sm admin-ads-btn--primary">
              + Nuevo Anuncio
            </Link>
          </div>

          {ads.length === 0 ? (
            <div className="admin-ads-empty">
              <p>Este anunciante no tiene anuncios todavía.</p>
              <Link href="/admin/ads/campaigns/new" className="admin-ads-btn admin-ads-btn--primary">
                Crear Primer Anuncio
              </Link>
            </div>
          ) : (
            <div className="admin-ads-table-container">
              <table className="admin-ads-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Ubicación</th>
                    <th>Estado</th>
                    <th>Impresiones</th>
                    <th>Clicks</th>
                    <th>CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {ads.map((ad) => {
                    const ctr = ad.impressions_count && ad.impressions_count > 0
                      ? ((ad.clicks_count || 0) / ad.impressions_count) * 100
                      : 0;

                    return (
                      <tr key={ad.id}>
                        <td className="admin-ads-table__name">
                          <Link href={`/admin/ads/campaigns/${ad.id}`}>
                            {ad.name}
                          </Link>
                        </td>
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
                             ad.status === 'ended' ? 'Finalizado' :
                             'Borrador'}
                          </span>
                        </td>
                        <td>{(ad.impressions_count || 0).toLocaleString()}</td>
                        <td>{(ad.clicks_count || 0).toLocaleString()}</td>
                        <td>{ctr.toFixed(2)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
