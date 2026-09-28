'use client';

import { useEffect, useState, useRef } from 'react';
import '../app/styles/components/ads.css';

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
  placement: 'sidebar_top' | 'sidebar_bottom' | 'article_top' | 'article_mid' | 'article_bottom' | 'feed_inline' | 'header' | 'footer' | 'home_top' | 'home_after_ranking' | 'home_news_sidebar';
  className?: string;
}

// Helper: Get skeleton height by placement
function getPlacementHeight(placement: string): string {
  const heightMap: Record<string, string> = {
    'article_top': '90px',
    'home_top': '110px',
    'home_after_ranking': '110px',
    'sidebar_top': '250px',
    'sidebar_bottom': '250px',
    'home_news_sidebar': '250px',
    'article_mid': '180px',
    'article_bottom': '180px',
    'feed_inline': '180px',
    'header': '60px',
    'footer': '90px'
  };
  return heightMap[placement] || '180px';
}

// Above-the-fold placements (load immediately)
const ABOVE_FOLD_PLACEMENTS = [
  'article_top',
  'home_top',
  'header'
];

export default function AdSlot({ placement, className = '' }: AdSlotProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [viewabilityTracked, setViewabilityTracked] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
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
        const apiUrl = `/api/ads/active?placement=${placement}&page_url=${encodeURIComponent(pageUrl)}`;

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
              fetch('/api/ads/impression', {
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
      }
    };
  }, [ad, viewabilityTracked]);

  const handleAdClick = () => {
    if (!ad) return;

    // Track click
    fetch('/api/ads/click', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ad_id: ad.id,
        page_url: window.location.pathname
      })
    }).catch(() => {});

    // Navigate
    if (ad.link_url) {
      if (ad.target === '_blank') {
        window.open(ad.link_url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = ad.link_url;
      }
    }
  };

  // Skeleton loader while loading
  if (!mounted || loading || !ad) {
    return (
      <div
        ref={adRef}
        className={`ad-slot ad-slot--skeleton ad-slot--${placement} ${className}`}
        style={{
          minHeight: getPlacementHeight(placement),
          backgroundColor: '#f1f5f9',
          borderRadius: '12px',
          overflow: 'hidden',
          position: 'relative',
          border: '2px solid #e2e8f0'
        }}
      >
        {/* Shimmer effect */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '-100%',
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
            animation: 'shimmer 1.5s infinite'
          }}
        />
        <style jsx>{`
          @keyframes shimmer {
            0% { left: -100%; }
            100% { left: 100%; }
          }
        `}</style>
      </div>
    );
  }

  // Script ad
  if (ad.type === 'script') {
    return (
      <div
        className={`ad-slot ad-slot--script ad-slot--${placement} ${className}`}
        dangerouslySetInnerHTML={{ __html: ad.script_code || '' }}
      />
    );
  }

  // Image banner
  if (ad.type === 'image_banner') {
    // Ajustar altura según el placement
    const isTopBanner = placement === 'article_top';
    const maxHeight = isTopBanner ? '90px' : '250px';
    const containerMargin = isTopBanner ? '0' : '24px 0';
    const borderRadius = isTopBanner ? '8px' : '12px';

    return (
      <div
        className={`ad-slot ad-slot--image ad-slot--${placement} ${className}`}
        style={{
          backgroundColor: '#ffffff',
          border: '2px solid #e2e8f0',
          borderRadius,
          overflow: 'hidden',
          margin: containerMargin,
          position: 'relative',
          maxHeight, // Altura adaptativa según placement
          height: isTopBanner ? '90px' : 'auto' // Altura fija para top banner
        }}
      >
        <div
          className="ad-slot__label"
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            fontSize: '12px',
            color: '#94a3b8',
            textTransform: 'uppercase',
            fontWeight: '600',
            backgroundColor: '#ffffff',
            padding: '4px 8px',
            borderRadius: '4px',
            zIndex: 1
          }}
        >
          Publicidad
        </div>
        <div
          className="ad-slot__image-container"
          onClick={handleAdClick}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && handleAdClick()}
          style={{
            cursor: 'pointer',
            maxHeight, // Altura adaptativa
            height: isTopBanner ? '90px' : 'auto', // Altura fija para top banner
            overflow: 'hidden',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <img
            src={ad.image_url}
            alt={ad.image_alt || 'Anuncio'}
            className="ad-slot__image"
            style={{
              width: '100%',
              height: isTopBanner ? '90px' : 'auto', // Altura fija para top banner
              maxHeight,
              display: 'block',
              objectFit: isTopBanner ? 'cover' : 'contain' // Cover para banners horizontales, contain para otros
            }}
          />
        </div>
      </div>
    );
  }

  // Text banner - Professional financial styling
  if (ad.type === 'text_banner') {
    return (
      <div
        ref={adRef}
        className={`ad-slot ad-slot--text ad-slot--${placement} ${className}`}
        style={{
          backgroundColor: '#f8fafc',
          border: '2px solid #e2e8f0',
          borderRadius: '12px',
          padding: '32px',
          margin: '24px 0',
          position: 'relative',
          minHeight: '180px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
          transition: 'all 0.3s ease'
        }}
      >
        <div
          className="ad-slot__label"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            fontSize: '11px',
            color: '#94a3b8',
            textTransform: 'uppercase',
            fontWeight: '600',
            letterSpacing: '0.5px'
          }}
        >
          Publicidad
        </div>
        <div
          className="ad-slot__text-container"
          onClick={handleAdClick}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && handleAdClick()}
          style={{
            cursor: 'pointer',
            textAlign: 'center'
          }}
        >
          <h3
            className="ad-slot__title"
            style={{
              fontSize: '22px',
              fontWeight: '700',
              color: '#0f172a',
              margin: '0 0 12px 0',
              lineHeight: '1.3'
            }}
          >
            {ad.title}
          </h3>
          <p
            className="ad-slot__description"
            style={{
              fontSize: '15px',
              color: '#475569',
              margin: '0 0 20px 0',
              lineHeight: '1.6'
            }}
          >
            {ad.description}
          </p>
          <button
            className="ad-slot__cta"
            style={{
              display: 'inline-block',
              padding: '12px 28px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
              transition: 'all 0.2s ease'
            }}
          >
            {ad.cta_text || 'Saber más'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
