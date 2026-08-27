'use client';

import '@/app/styles/components/admin-ads.css';
import { useState } from 'react';
import { Download } from 'lucide-react';

/**
 * Export Button Component - Exportar datos de analytics a CSV
 */

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

interface ExportButtonProps {
  data: AnalyticsData;
  startDate?: string;
  endDate?: string;
}

export default function ExportButton({ data, startDate, endDate }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToCSV = () => {
    setIsExporting(true);

    try {
      // Crear CSV con múltiples secciones
      let csv = '';

      // Sección 1: Resumen Global
      csv += 'RESUMEN GLOBAL\n';
      csv += 'Métrica,Valor\n';
      csv += `Total Impresiones,${data.globalStats.totalImpressions}\n`;
      csv += `Total Clicks,${data.globalStats.totalClicks}\n`;
      csv += `CTR Promedio,${data.globalStats.totalCTR}%\n`;
      csv += `Anuncios Activos,${data.globalStats.activeAds}\n`;
      csv += `Total Anuncios,${data.globalStats.totalAds}\n`;
      csv += '\n';

      // Sección 2: Datos por Fecha
      csv += 'DATOS POR FECHA\n';
      csv += 'Fecha,Impresiones,Clicks,CTR (%)\n';
      data.chartData.forEach(point => {
        csv += `${point.date},${point.impressions},${point.clicks},${point.ctr}\n`;
      });
      csv += '\n';

      // Sección 3: Top Anuncios
      csv += 'TOP ANUNCIOS POR CTR\n';
      csv += 'Nombre,Tipo,Ubicación,Impresiones,Clicks,CTR (%)\n';
      data.topAds.forEach(ad => {
        csv += `"${ad.name}",${ad.type},${ad.placement},${ad.impressions_count},${ad.clicks_count},${ad.ctr}\n`;
      });
      csv += '\n';

      // Sección 4: Rendimiento por Ubicación
      csv += 'RENDIMIENTO POR UBICACIÓN\n';
      csv += 'Ubicación,Anuncios,Impresiones,Clicks,CTR (%)\n';
      data.placementStats.forEach(stat => {
        csv += `${stat.placement},${stat.ads},${stat.impressions},${stat.clicks},${stat.ctr}\n`;
      });
      csv += '\n';

      // Sección 5: Rendimiento por Tipo
      csv += 'RENDIMIENTO POR TIPO DE ANUNCIO\n';
      csv += 'Tipo,Anuncios,Impresiones,Clicks,CTR (%)\n';
      data.typeStats.forEach(stat => {
        csv += `${stat.type},${stat.ads},${stat.impressions},${stat.clicks},${stat.ctr}\n`;
      });

      // Crear blob y descargar
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);

      const dateRange = startDate && endDate
        ? `${startDate}_${endDate}`
        : new Date().toISOString().split('T')[0];

      link.setAttribute('href', url);
      link.setAttribute('download', `analytics_etf_nexo_${dateRange}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (error) {
      console.error('Error al exportar CSV:', error);
      alert('Error al exportar el reporte. Por favor intenta de nuevo.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={exportToCSV}
      disabled={isExporting}
      className="analytics-export-btn"
      title="Exportar datos a CSV"
    >
      <Download className="w-4 h-4" />
      {isExporting ? 'Exportando...' : 'Exportar CSV'}
    </button>
  );
}
