// @ts-nocheck
'use client';

/**
 * Sticky News Banner - Banner destacado en sidebar de noticias
 * Se mantiene sticky mientras el usuario está en la sección de noticias
 * Se elimina el sticky cuando la sección termina
 */

import { useEffect, useState, useRef } from 'react';
import AdSlot from './AdSlot';

interface StickyNewsBannerProps {
  placement: string;
}

export default function StickyNewsBanner({ placement }: StickyNewsBannerProps) {
  const [isSticky, setIsSticky] = useState(false);
  const bannerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current || !bannerRef.current) return;

      const container = containerRef.current.parentElement;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const headerHeight = 72; // Altura del header (4.5rem)
      const bannerHeight = bannerRef.current.offsetHeight;

      // Activar sticky cuando el top del container pasa el header
      const shouldBeSticky = containerRect.top <= headerHeight &&
                            containerRect.bottom > (headerHeight + bannerHeight + 100);

      setIsSticky(shouldBeSticky);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      <div
        ref={bannerRef}
        style={{
          position: isSticky ? 'sticky' : 'static',
          top: isSticky ? '90px' : 'auto', // Espacio del header + margen
          zIndex: 10,
          transition: 'all 0.2s ease'
        }}
      >
        {/* Banner Card - Mismo estilo que NewsCard */}
        <div
          style={{
            background: 'var(--color-white)',
            borderRadius: '0.5rem',
            border: '1px solid var(--color-slate-200)',
            overflow: 'hidden',
            boxShadow: isSticky ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none',
            marginBottom: 'var(--spacing-4)'
          }}
        >
          {/* Label "Publicidad" */}
          <div
            style={{
              padding: 'var(--spacing-2) var(--spacing-3)',
              background: 'var(--color-slate-50)',
              borderBottom: '1px solid var(--color-slate-200)',
              fontSize: '0.75rem',
              fontWeight: 600,
              color: 'var(--color-slate-500)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em'
            }}
          >
            Publicidad
          </div>

          {/* Ad Content */}
          <div style={{ padding: 'var(--spacing-4)' }}>
            <AdSlot placement={placement} />
          </div>
        </div>
      </div>
    </div>
  );
}
