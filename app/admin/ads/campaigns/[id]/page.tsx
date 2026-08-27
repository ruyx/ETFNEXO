// @ts-nocheck
/**
 * Campaign Detail Page - Vista de detalle de campaña
 * Muestra información completa, métricas y preview del anuncio
 */

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit, Eye, MousePointerClick, Calendar, TrendingUp, MapPin, User } from 'lucide-react';

interface PageProps {
  params: { id: string };
}

async function getCampaign(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ads')
    .select(`
      *,
      advertiser:advertiser_id (
        id,
        name,
        email,
        website
      )
    `)
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function generateMetadata({ params }: PageProps) {
  const campaign = await getCampaign(params.id);

  return {
    title: campaign ? `${campaign.name} - ETF Nexo` : 'Campaña No Encontrada',
    description: `Detalle de la campaña ${campaign?.name || ''}`
  };
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const campaign = await getCampaign(params.id);

  if (!campaign) {
    notFound();
  }

  const ctr = campaign.impressions_count > 0
    ? ((campaign.clicks_count || 0) / campaign.impressions_count) * 100
    : 0;

  return (
    <div className="admin-ads-page">
      {/* Header */}
      <div className="admin-ads-page__header">
        <div>
          <h1 className="admin-ads-page__title">{campaign.name}</h1>
          <p className="admin-ads-page__subtitle">
            Detalle de la campaña publicitaria
          </p>
        </div>
        <div className="admin-ads-page__header-actions">
          <Link href="/admin/ads/campaigns" className="admin-ads-btn admin-ads-btn--secondary">
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>
          <Link href={`/admin/ads/campaigns/${params.id}/edit`} className="admin-ads-btn admin-ads-btn--primary">
            <Edit className="w-4 h-4" />
            Editar
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="admin-ads-dashboard__stats">
        <div className="admin-ads-stat-card">
          <div className="admin-ads-stat-card__icon admin-ads-stat-card__icon--info">
            <Eye className="w-5 h-5" />
          </div>
          <div className="admin-ads-stat-card__content">
            <p className="admin-ads-stat-card__label">Impresiones</p>
            <p className="admin-ads-stat-card__value">{campaign.impressions_count.toLocaleString()}</p>
          </div>
        </div>

        <div className="admin-ads-stat-card">
          <div className="admin-ads-stat-card__icon admin-ads-stat-card__icon--success">
            <MousePointerClick className="w-5 h-5" />
          </div>
          <div className="admin-ads-stat-card__content">
            <p className="admin-ads-stat-card__label">Clicks</p>
            <p className="admin-ads-stat-card__value">{campaign.clicks_count.toLocaleString()}</p>
          </div>
        </div>

        <div className="admin-ads-stat-card">
          <div className="admin-ads-stat-card__icon admin-ads-stat-card__icon--warning">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="admin-ads-stat-card__content">
            <p className="admin-ads-stat-card__label">CTR</p>
            <p className="admin-ads-stat-card__value">{ctr.toFixed(2)}%</p>
          </div>
        </div>

        <div className="admin-ads-stat-card">
          <div className="admin-ads-stat-card__icon admin-ads-stat-card__icon--primary">
            <MapPin className="w-5 h-5" />
          </div>
          <div className="admin-ads-stat-card__content">
            <p className="admin-ads-stat-card__label">Ubicación</p>
            <p className="admin-ads-stat-card__value" style={{ fontSize: '1rem' }}>{campaign.placement}</p>
          </div>
        </div>
      </div>

      <div className="admin-ads-detail-grid">
        {/* Información de la Campaña */}
        <div className="admin-ads-card">
          <div className="admin-ads-card__header">
            <h2 className="admin-ads-card__title">Información de la Campaña</h2>
            <span className={`admin-ads-badge admin-ads-badge--${
              campaign.status === 'active' ? 'success' :
              campaign.status === 'paused' ? 'warning' :
              campaign.status === 'ended' ? 'neutral' :
              'neutral'
            }`}>
              {campaign.status === 'active' ? 'Activo' :
               campaign.status === 'paused' ? 'Pausado' :
               campaign.status === 'ended' ? 'Finalizado' :
               'Borrador'}
            </span>
          </div>

          <div className="admin-ads-info-list">
            <div className="admin-ads-info-item">
              <MapPin className="admin-ads-info-item__icon" />
              <div>
                <p className="admin-ads-info-item__label">Tipo de Anuncio</p>
                <p className="admin-ads-info-item__value">
                  {campaign.type === 'image_banner' ? 'Banner Imagen' :
                   campaign.type === 'text_banner' ? 'Banner Texto' :
                   'Script (AdSense)'}
                </p>
              </div>
            </div>

            {campaign.advertiser && (
              <div className="admin-ads-info-item">
                <User className="admin-ads-info-item__icon" />
                <div>
                  <p className="admin-ads-info-item__label">Anunciante</p>
                  <Link
                    href={`/admin/ads/advertisers/${campaign.advertiser.id}`}
                    className="admin-ads-info-item__value admin-ads-info-item__value--link"
                  >
                    {campaign.advertiser.name}
                  </Link>
                </div>
              </div>
            )}

            {campaign.size && (
              <div className="admin-ads-info-item">
                <MapPin className="admin-ads-info-item__icon" />
                <div>
                  <p className="admin-ads-info-item__label">Tamaño</p>
                  <p className="admin-ads-info-item__value">{campaign.size}</p>
                </div>
              </div>
            )}

            {(campaign.start_date || campaign.end_date) && (
              <div className="admin-ads-info-item">
                <Calendar className="admin-ads-info-item__icon" />
                <div>
                  <p className="admin-ads-info-item__label">Periodo</p>
                  <p className="admin-ads-info-item__value">
                    {campaign.start_date && new Date(campaign.start_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                    {campaign.start_date && campaign.end_date && ' - '}
                    {campaign.end_date && new Date(campaign.end_date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                    {!campaign.start_date && !campaign.end_date && 'Sin fechas'}
                  </p>
                </div>
              </div>
            )}

            {(campaign.max_impressions || campaign.max_clicks) && (
              <div className="admin-ads-info-item">
                <TrendingUp className="admin-ads-info-item__icon" />
                <div>
                  <p className="admin-ads-info-item__label">Límites</p>
                  <p className="admin-ads-info-item__value">
                    {campaign.max_impressions && `Max. ${campaign.max_impressions.toLocaleString()} impresiones`}
                    {campaign.max_impressions && campaign.max_clicks && ' / '}
                    {campaign.max_clicks && `Max. ${campaign.max_clicks.toLocaleString()} clicks`}
                  </p>
                </div>
              </div>
            )}

            <div className="admin-ads-info-item">
              <Calendar className="admin-ads-info-item__icon" />
              <div>
                <p className="admin-ads-info-item__label">Creado</p>
                <p className="admin-ads-info-item__value">
                  {new Date(campaign.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview del Anuncio */}
        <div className="admin-ads-card admin-ads-card--full">
          <div className="admin-ads-card__header">
            <h2 className="admin-ads-card__title">Vista Previa del Anuncio</h2>
          </div>

          <div style={{
            padding: 'var(--spacing-6)',
            background: 'var(--color-neutral-50)',
            borderRadius: 'var(--btn-radius)',
            minHeight: '200px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {campaign.type === 'image_banner' && campaign.image_url ? (
              <div style={{ maxWidth: '600px', width: '100%' }}>
                <img
                  src={campaign.image_url}
                  alt={campaign.image_alt || campaign.name}
                  style={{
                    width: '100%',
                    borderRadius: 'var(--btn-radius)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                  }}
                />
                {campaign.link_url && (
                  <p style={{
                    marginTop: 'var(--spacing-3)',
                    fontSize: '0.875rem',
                    color: 'var(--color-neutral-600)',
                    textAlign: 'center'
                  }}>
                    Link: <a href={campaign.link_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--color-primary)' }}>
                      {campaign.link_url}
                    </a>
                  </p>
                )}
              </div>
            ) : campaign.type === 'text_banner' ? (
              <div style={{
                maxWidth: '500px',
                width: '100%',
                padding: 'var(--spacing-6)',
                background: 'var(--color-white)',
                borderRadius: 'var(--btn-radius)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                <h3 style={{
                  margin: '0 0 var(--spacing-3) 0',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  color: 'var(--color-neutral-900)'
                }}>
                  {campaign.title}
                </h3>
                {campaign.description && (
                  <p style={{
                    margin: '0 0 var(--spacing-4) 0',
                    fontSize: '1rem',
                    lineHeight: '1.6',
                    color: 'var(--color-neutral-700)'
                  }}>
                    {campaign.description}
                  </p>
                )}
                {campaign.cta_text && (
                  <button style={{
                    padding: 'var(--spacing-3) var(--spacing-5)',
                    background: 'var(--color-primary)',
                    color: 'var(--color-white)',
                    border: 'none',
                    borderRadius: 'var(--btn-radius)',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}>
                    {campaign.cta_text}
                  </button>
                )}
              </div>
            ) : campaign.type === 'script' && campaign.script_code ? (
              <div style={{
                maxWidth: '600px',
                width: '100%',
                padding: 'var(--spacing-6)',
                background: 'var(--color-neutral-900)',
                borderRadius: 'var(--btn-radius)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
              }}>
                <pre style={{
                  margin: 0,
                  fontFamily: 'Courier New, monospace',
                  fontSize: '0.813rem',
                  lineHeight: '1.5',
                  color: '#e0e0e0',
                  overflow: 'auto',
                  maxHeight: '400px'
                }}>
                  {campaign.script_code}
                </pre>
              </div>
            ) : (
              <div style={{ textAlign: 'center', color: 'var(--color-neutral-500)' }}>
                <p>No hay contenido para mostrar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
