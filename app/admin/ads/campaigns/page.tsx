// @ts-nocheck
/**
 * Campaigns List - Listado de anuncios/campañas
 * Con filtros por tipo, placement, status y anunciante
 */

import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Plus, Eye, Edit, Trash2, Filter } from 'lucide-react';
import DeleteCampaignButton from './DeleteCampaignButton';

interface Campaign {
  id: string;
  name: string;
  type: string;
  placement: string;
  status: string;
  impressions_count: number;
  clicks_count: number;
  start_date: string | null;
  end_date: string | null;
  created_at: string;
  advertiser: {
    id: string;
    name: string;
  } | null;
}

interface SearchParams {
  type?: string;
  placement?: string;
  status?: string;
  advertiser?: string;
}

async function getCampaigns(filters: SearchParams): Promise<Campaign[]> {
  const supabase = await createClient();

  let query = supabase
    .from('ads')
    .select(`
      id,
      name,
      type,
      placement,
      status,
      impressions_count,
      clicks_count,
      start_date,
      end_date,
      created_at,
      advertiser:advertiser_id (
        id,
        name
      )
    `)
    .order('created_at', { ascending: false });

  // Apply filters
  if (filters.type) {
    query = query.eq('type', filters.type);
  }
  if (filters.placement) {
    query = query.eq('placement', filters.placement);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }
  if (filters.advertiser) {
    query = query.eq('advertiser_id', filters.advertiser);
  }

  const { data } = await query;
  return data || [];
}

async function getAdvertisers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('advertisers')
    .select('id, name')
    .eq('status', 'active')
    .order('name');
  return data || [];
}

export default async function CampaignsPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const campaigns = await getCampaigns(searchParams);
  const advertisers = await getAdvertisers();

  const totalImpressions = campaigns.reduce((sum, c) => sum + (c.impressions_count || 0), 0);
  const totalClicks = campaigns.reduce((sum, c) => sum + (c.clicks_count || 0), 0);
  const averageCTR = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;

  return (
    <div className="admin-ads-page">
      <div className="container">
        {/* Header */}
        <div className="admin-ads-page__header">
        <div>
          <h1 className="admin-ads-page__title">Campañas Publicitarias</h1>
          <p className="admin-ads-page__subtitle">
            Gestiona tus anuncios y campañas activas
          </p>
        </div>
        <Link href="/admin/ads/campaigns/new" className="admin-ads-btn admin-ads-btn--primary">
          <Plus className="w-4 h-4" />
          Nueva Campaña
        </Link>
      </div>

      {/* Stats Summary */}
      <div className="admin-ads-stats-mini">
        <div className="admin-ads-stat-mini">
          <span className="admin-ads-stat-mini__label">Total Anuncios</span>
          <span className="admin-ads-stat-mini__value">{campaigns.length}</span>
        </div>
        <div className="admin-ads-stat-mini">
          <span className="admin-ads-stat-mini__label">Activos</span>
          <span className="admin-ads-stat-mini__value admin-ads-stat-mini__value--success">
            {campaigns.filter(c => c.status === 'active').length}
          </span>
        </div>
        <div className="admin-ads-stat-mini">
          <span className="admin-ads-stat-mini__label">Impresiones</span>
          <span className="admin-ads-stat-mini__value">{totalImpressions.toLocaleString()}</span>
        </div>
        <div className="admin-ads-stat-mini">
          <span className="admin-ads-stat-mini__label">CTR</span>
          <span className="admin-ads-stat-mini__value">{averageCTR.toFixed(2)}%</span>
        </div>
      </div>

        {/* Filters */}
        <div className="admin-ads-filters">
          <div className="admin-ads-filters__header">
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </div>

          <form method="GET" className="admin-ads-filters__form">
            <div className="admin-ads-filters__field">
              <label htmlFor="type">Tipo</label>
            <select name="type" id="type" defaultValue={searchParams.type || ''}>
              <option value="">Todos</option>
              <option value="image_banner">Banner Imagen</option>
              <option value="text_banner">Banner Texto</option>
              <option value="script">Script (AdSense)</option>
            </select>
            </div>

            <div className="admin-ads-filters__field">
              <label htmlFor="placement">Ubicación</label>
            <select name="placement" id="placement" defaultValue={searchParams.placement || ''}>
              <option value="">Todas</option>
              <option value="sidebar_top">Sidebar Superior</option>
              <option value="sidebar_bottom">Sidebar Inferior</option>
              <option value="article_top">Artículo - Encabezado</option>
              <option value="article_mid">Artículo - Medio</option>
              <option value="article_bottom">Artículo - Pie</option>
              <option value="feed_inline">Feed Inline</option>
              <option value="header">Header</option>
              <option value="footer">Footer</option>
            </select>
            </div>

            <div className="admin-ads-filters__field">
              <label htmlFor="status">Estado</label>
            <select name="status" id="status" defaultValue={searchParams.status || ''}>
              <option value="">Todos</option>
              <option value="active">Activo</option>
              <option value="paused">Pausado</option>
              <option value="ended">Finalizado</option>
              <option value="draft">Borrador</option>
            </select>
            </div>

            <div className="admin-ads-filters__field">
              <label htmlFor="advertiser">Anunciante</label>
            <select name="advertiser" id="advertiser" defaultValue={searchParams.advertiser || ''}>
              <option value="">Todos</option>
              {advertisers.map((adv) => (
                <option key={adv.id} value={adv.id}>
                  {adv.name}
                </option>
              ))}
            </select>
            </div>

            <div className="admin-ads-filters__actions">
            <button type="submit" className="admin-ads-btn admin-ads-btn--sm admin-ads-btn--primary">
              Aplicar Filtros
            </button>
            <Link href="/admin/ads/campaigns" className="admin-ads-btn admin-ads-btn--sm admin-ads-btn--secondary">
              Limpiar
            </Link>
            </div>
          </form>
        </div>

        {/* Table */}
        <div className="admin-ads-card">
        <div className="admin-ads-table-container">
          <table className="admin-ads-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Anunciante</th>
                <th>Tipo</th>
                <th>Ubicación</th>
                <th>Estado</th>
                <th>Impresiones</th>
                <th>Clicks</th>
                <th>CTR</th>
                <th>Fechas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.length === 0 ? (
                <tr>
                  <td colSpan={10} className="admin-ads-table__empty">
                    No hay anuncios todavía. <Link href="/admin/ads/campaigns/new">Crea el primero</Link>
                  </td>
                </tr>
              ) : (
                campaigns.map((campaign) => {
                  const ctr = campaign.impressions_count > 0
                    ? ((campaign.clicks_count || 0) / campaign.impressions_count) * 100
                    : 0;

                  return (
                    <tr key={campaign.id}>
                      <td className="admin-ads-table__name">
                        <Link href={`/admin/ads/campaigns/${campaign.id}`}>
                          {campaign.name}
                        </Link>
                      </td>
                      <td>{campaign.advertiser?.name || '-'}</td>
                      <td>
                        <span className="admin-ads-badge admin-ads-badge--neutral">
                          {campaign.type === 'image_banner' ? 'Imagen' :
                           campaign.type === 'text_banner' ? 'Texto' :
                           'Script'}
                        </span>
                      </td>
                      <td>
                        <code className="campaigns-placement-code">
                          {campaign.placement}
                        </code>
                      </td>
                      <td>
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
                      </td>
                      <td>{campaign.impressions_count.toLocaleString()}</td>
                      <td>{campaign.clicks_count.toLocaleString()}</td>
                      <td>{ctr.toFixed(2)}%</td>
                      <td>
                        {campaign.start_date ? (
                          <span className="campaigns-dates">
                            {new Date(campaign.start_date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}
                            {campaign.end_date && ` - ${new Date(campaign.end_date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' })}`}
                          </span>
                        ) : '-'}
                      </td>
                      <td>
                        <div className="admin-ads-table__actions">
                          <Link
                            href={`/admin/ads/campaigns/${campaign.id}`}
                            className="admin-ads-icon-btn admin-ads-icon-btn--view"
                            title="Ver detalle"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/admin/ads/campaigns/${campaign.id}/edit`}
                            className="admin-ads-icon-btn admin-ads-icon-btn--edit"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <DeleteCampaignButton
                            campaignId={campaign.id}
                            campaignName={campaign.name}
                          />
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </div>
  );
}
