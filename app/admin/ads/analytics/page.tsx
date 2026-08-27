// @ts-nocheck
'use client';

/**
 * Analytics Dashboard Page - Vista principal de analíticas
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Eye, MousePointerClick, Activity } from 'lucide-react';
import MetricsChart from './MetricsChart';
import TopAdsRanking from './TopAdsRanking';
import PlacementBreakdown from './PlacementBreakdown';
import ExportButton from './ExportButton';
import '@/app/styles/components/admin-ads.css';

interface AnalyticsData {
  globalStats: {
    totalImpressions: number;
    totalClicks: number;
    totalCTR: number;
    activeAds: number;
    totalAds: number;
  };
  chartData: Array<{
    date: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
  topAds: Array<{
    id: string;
    name: string;
    type: string;
    placement: string;
    impressions_count: number;
    clicks_count: number;
    ctr: number;
  }>;
  placementStats: Array<{
    placement: string;
    impressions: number;
    clicks: number;
    ctr: number;
    ads: number;
  }>;
  typeStats: Array<{
    type: string;
    impressions: number;
    clicks: number;
    ctr: number;
    ads: number;
  }>;
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros de fecha (últimos 30 días por defecto)
  const [startDate, setStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);

      const res = await fetch(`/api/admin/analytics?${params.toString()}`);

      if (!res.ok) {
        throw new Error('Error al cargar analytics');
      }

      const data = await res.json();
      setData(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleApplyFilters = () => {
    fetchAnalytics();
  };

  const handleResetFilters = () => {
    const date = new Date();
    date.setDate(date.getDate() - 30);
    setStartDate(date.toISOString().split('T')[0]);
    setEndDate(new Date().toISOString().split('T')[0]);
    setTimeout(fetchAnalytics, 100);
  };

  if (loading) {
    return (
      <div className="admin-ads-page">
        <div className="container">
          <div className="admin-ads-page__header">
            <div>
              <h1 className="admin-ads-page__title">Analíticas</h1>
              <p className="admin-ads-page__subtitle">Cargando datos...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="admin-ads-page">
        <div className="container">
          <div className="admin-ads-page__header">
            <div>
              <h1 className="admin-ads-page__title">Analíticas</h1>
              <p className="admin-ads-page__subtitle" style={{ color: 'var(--color-danger)' }}>
                {error || 'Error al cargar datos'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-ads-page">
      <div className="container">
        {/* Header */}
        <div className="admin-ads-page__header">
          <div>
            <h1 className="admin-ads-page__title">Analíticas y Reportes</h1>
            <p className="admin-ads-page__subtitle">
              Rendimiento y métricas de anuncios
            </p>
          </div>
          <div className="admin-ads-page__header-actions">
            <Link href="/admin/ads" className="admin-ads-btn admin-ads-btn--secondary">
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Link>
            <ExportButton data={data} startDate={startDate} endDate={endDate} />
          </div>
        </div>

        {/* Date Range Filter */}
        <div className="analytics-date-range">
          <div className="analytics-date-range__group">
            <label htmlFor="start_date" className="analytics-date-range__label">
              Desde
            </label>
            <input
              type="date"
              id="start_date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="analytics-date-range__input"
            />
          </div>

          <div className="analytics-date-range__group">
            <label htmlFor="end_date" className="analytics-date-range__label">
              Hasta
            </label>
            <input
              type="date"
              id="end_date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="analytics-date-range__input"
            />
          </div>

          <div className="analytics-date-range__actions">
            <button
              onClick={handleApplyFilters}
              className="admin-ads-btn admin-ads-btn--primary"
            >
              Aplicar
            </button>
            <button
              onClick={handleResetFilters}
              className="admin-ads-btn admin-ads-btn--secondary"
            >
              Últimos 30 días
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="analytics-stats-grid">
          <div className="analytics-stat-card">
            <div className="analytics-stat-card__header">
              <h4 className="analytics-stat-card__title">Total Impresiones</h4>
              <Eye className="w-5 h-5" style={{ color: 'var(--color-primary)' }} />
            </div>
            <p className="analytics-stat-card__value">
              {data.globalStats.totalImpressions.toLocaleString()}
            </p>
            <p className="analytics-stat-card__subtitle">
              {data.globalStats.activeAds} anuncios activos
            </p>
          </div>

          <div className="analytics-stat-card">
            <div className="analytics-stat-card__header">
              <h4 className="analytics-stat-card__title">Total Clicks</h4>
              <MousePointerClick className="w-5 h-5" style={{ color: 'var(--color-success)' }} />
            </div>
            <p className="analytics-stat-card__value">
              {data.globalStats.totalClicks.toLocaleString()}
            </p>
            <p className="analytics-stat-card__subtitle">
              En {data.chartData.length} días
            </p>
          </div>

          <div className="analytics-stat-card">
            <div className="analytics-stat-card__header">
              <h4 className="analytics-stat-card__title">CTR Promedio</h4>
              <TrendingUp className="w-5 h-5" style={{ color: 'var(--color-info)' }} />
            </div>
            <p className="analytics-stat-card__value">
              {data.globalStats.totalCTR.toFixed(2)}%
            </p>
            <p className="analytics-stat-card__subtitle">
              Click-through rate
            </p>
          </div>

          <div className="analytics-stat-card">
            <div className="analytics-stat-card__header">
              <h4 className="analytics-stat-card__title">Total Anuncios</h4>
              <Activity className="w-5 h-5" style={{ color: 'var(--color-warning)' }} />
            </div>
            <p className="analytics-stat-card__value">
              {data.globalStats.totalAds}
            </p>
            <p className="analytics-stat-card__subtitle">
              {data.globalStats.activeAds} activos
            </p>
          </div>
        </div>

        {/* Main Chart - Full Width */}
        <div className="analytics-grid analytics-grid--full">
          <MetricsChart data={data.chartData} />
        </div>

        {/* Top Ads Ranking - Full Width */}
        <div className="analytics-grid analytics-grid--full">
          <TopAdsRanking ads={data.topAds} />
        </div>

        {/* Placement and Type Breakdown - 2 columns */}
        <div className="analytics-grid">
          <PlacementBreakdown stats={data.placementStats} />
          <PlacementBreakdown
            stats={data.typeStats}
            title="Rendimiento por Tipo de Anuncio"
            showAdsCount={true}
          />
        </div>
      </div>
    </div>
  );
}
