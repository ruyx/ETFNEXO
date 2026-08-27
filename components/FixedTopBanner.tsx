// @ts-nocheck
'use client';

/**
 * Fixed Top Banner - Banner fijo encima del breadcrumb
 * Maximiza impresiones manteniéndose visible mientras el usuario hace scroll
 */

import { useEffect, useState } from 'react';
import AdSlot from './AdSlot';

interface FixedTopBannerProps {
  placement: string;
}

export default function FixedTopBanner({ placement }: FixedTopBannerProps) {
  const [isFixed, setIsFixed] = useState(true);

  return (
    <>
      {/* Espaciador para evitar que el contenido salte cuando el banner se vuelve fixed */}
      <div style={{ height: isFixed ? '110px' : '0' }} />

      {/* Banner Fixed - Solo tamaños horizontales 728x90 o 970x90 con fondo oscuro */}
      <div
        className="fixed-top-banner"
        style={{
          position: 'fixed',
          top: '72px', // Altura del header (4.5rem = 72px)
          left: '0',
          right: '0',
          zIndex: 39, // Menos que el header (40) pero más que el contenido
          background: 'linear-gradient(to bottom, #1e293b 0%, #0f172a 100%)', // Fondo oscuro como el header
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 'var(--spacing-2)',
          height: '110px', // Altura fija
          overflow: 'hidden' // Ocultar contenido que exceda
        }}
      >
        <div style={{
          maxWidth: '970px',
          width: '100%',
          height: '90px', // Altura exacta del banner (728x90 o 970x90)
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          overflow: 'hidden' // Importante: ocultar imagen que exceda
        }}>
          <AdSlot placement={placement} />
        </div>
      </div>
    </>
  );
}
