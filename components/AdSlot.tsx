'use client';

import { useEffect, useState, useRef } from 'react';
import '../app/styles/components/ads.css';
import { ABOVE_FOLD_PLACEMENTS, getPlacementFormat, type AdPlacement } from '@/lib/ads/placements';

interface Ad {
  id: string;
  type: 'image_banner' | 'text_banner' | 'script';
  name: string;
  image_url?: string;
  image_alt?: string;
  title?: string;
  description?: string;
  cta_text?: string;
  script_code?: string;
  link_url?: string;
  target?: string;
}

interface AdSlotProps {
  placement: AdPlacement;
  className?: string;
}

// Anuncios de terceros (AdSense, etc.). Con innerHTML el navegador no ejecuta
// los <script>; un fragmento creado con createContextualFragment sí lo hace.
// El código lo introduce un admin desde el panel: es contenido de confianza.
function ScriptAd({ code }: { code: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.replaceChildren(document.createRange().createContextualFragment(code));
    return () => el.replaceChildren();
  }, [code]);

  return <div ref={ref} className="nx-slot__script" />;
}

export default function AdSlot({ placement, className = '' }: AdSlotProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [viewabilityTracked, setViewabilityTracked] = useState(false);
  const adRef = useRef<HTMLElement>(null);
  const viewabilityTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Set mounted flag after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lazy loading with IntersectionObserver (below-the-fold ads)
  useEffect(() => {
    if (!mounted) return;

    // Above-the-fold ads load immediately
    if (ABOVE_FOLD_PLACEMENTS.includes(placement)) {
      setIsInView(true);
      return;
    }

    // Below-the-fold ads: lazy load when approaching viewport
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !ad) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' } // Start loading 200px before entering viewport
    );

    if (adRef.current) {
      observer.observe(adRef.current);
    }

    return () => observer.disconnect();
  }, [placement, mounted, ad]);

  // Fetch ad when in view
  useEffect(() => {
    if (!isInView) return;

    const fetchAd = async () => {
      try {
        const pageUrl = window.location.pathname;
        const apiUrl = `/api/nx/slot?slot=${placement}&path=${encodeURIComponent(pageUrl)}`;

        const response = await fetch(apiUrl);
        if (!response.ok) {
          setLoading(false);
          return;
        }

        const data = await response.json();

        if (data.ad) {
          setAd(data.ad);
        }
        setLoading(false);
      } catch (error) {
        console.error('[AdSlot] Error:', error);
        setLoading(false);
      }
    };

    fetchAd();
  }, [isInView, placement]);

  // Viewability tracking (50% visible + 1 second)
  useEffect(() => {
    if (!ad || viewabilityTracked || !adRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.intersectionRatio >= 0.5) {
          // 50%+ visible: start 1-second timer
          if (!viewabilityTimerRef.current) {
            viewabilityTimerRef.current = setTimeout(() => {
              // Track viewable impression
              fetch('/api/nx/view', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ad_id: ad.id,
                  page_url: window.location.pathname,
                  viewable: true,
                  viewability_ratio: entry.intersectionRatio
                })
              }).catch(() => {});

              setViewabilityTracked(true);
              observer.disconnect();
            }, 1000);
          }
        } else {
          // Less than 50% visible: cancel timer
          if (viewabilityTimerRef.current) {
            clearTimeout(viewabilityTimerRef.current);
            viewabilityTimerRef.current = null;
          }
        }
      },
      { threshold: [0.5] }
    );

    observer.observe(adRef.current);

    return () => {
      observer.disconnect();
      if (viewabilityTimerRef.current) {
        clearTimeout(viewabilityTimerRef.current);
        viewabilityTimerRef.current = null;
      }
    };
  }, [ad, viewabilityTracked]);

  // Registra el clic sin bloquear la navegación del enlace (keepalive
  // mantiene la petición aunque la página cambie).
  const handleAdClick = () => {
    if (!ad) return;
    fetch('/api/nx/go', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({ ad_id: ad.id, page_url: window.location.pathname })
    }).catch(() => {});
  };

  const { format, width, height } = getPlacementFormat(placement);
  const isLoading = !mounted || loading;

  // Sin anuncio activo no se pinta nada (un hueco vacío en un contenedor flex
  // colapsaba a una línea de 1px).
  if (!isLoading && !ad) return null;

  const linkProps = ad?.link_url
    ? {
        href: ad.link_url,
        target: ad.target === '_blank' ? '_blank' : undefined,
        rel: 'sponsored noopener noreferrer',
        onClick: handleAdClick
      }
    : null;

  const renderCreative = () => {
    if (!ad) return null;

    if (ad.type === 'script') {
      return <ScriptAd code={ad.script_code || ''} />;
    }

    if (ad.type === 'image_banner') {
      const image = (
        <img
          src={ad.image_url}
          alt={ad.image_alt || ad.name || 'Anuncio'}
          width={width}
          height={height}
          className="nx-slot__image"
          loading={ABOVE_FOLD_PLACEMENTS.includes(placement) ? 'eager' : 'lazy'}
          decoding="async"
        />
      );
      return linkProps ? (
        <a className="nx-slot__link" {...linkProps}>{image}</a>
      ) : image;
    }

    if (ad.type === 'text_banner') {
      const content = (
        <>
          <span className="nx-slot__text">
            <span className="nx-slot__title">{ad.title}</span>
            {ad.description && <span className="nx-slot__description">{ad.description}</span>}
          </span>
          <span className="nx-slot__cta">{ad.cta_text || 'Saber más'}</span>
        </>
      );
      return linkProps ? (
        <a className="nx-slot__link nx-slot__link--text" {...linkProps}>{content}</a>
      ) : (
        <div className="nx-slot__link nx-slot__link--text">{content}</div>
      );
    }

    return null;
  };

  // Un único contenedor para el esqueleto y el anuncio: mismo tamaño en ambos
  // estados, así la carga no desplaza el contenido.
  const variant = isLoading ? 'skeleton' : ad!.type === 'image_banner' ? 'image' : ad!.type === 'text_banner' ? 'text' : 'script';

  return (
    <aside
      ref={adRef}
      className={`nx-slot nx-slot--${format} nx-slot--${variant} nx-slot--${placement} ${className}`.trim()}
      aria-label="Publicidad"
      aria-busy={isLoading || undefined}
    >
      <span className="nx-slot__label">Publicidad</span>
      <div className="nx-slot__frame">{renderCreative()}</div>
    </aside>
  );
}
