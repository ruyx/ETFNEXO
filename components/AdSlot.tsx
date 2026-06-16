'use client';

import { useEffect, useState } from 'react';
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
  placement: 'sidebar_top' | 'sidebar_bottom' | 'article_top' | 'article_mid' | 'article_bottom' | 'feed_inline' | 'header' | 'footer';
  className?: string;
}

export default function AdSlot({ placement, className = '' }: AdSlotProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Set mounted flag after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Only run on client after mount
    if (!mounted) {
      console.log('[AdSlot] Not mounted yet, skipping fetch');
      return;
    }

    const fetchAd = async () => {
      try {
        const pageUrl = window.location.pathname;
        const apiUrl = `/api/ads/active?placement=${placement}&page_url=${encodeURIComponent(pageUrl)}`;

        console.log('[AdSlot] Fetching ad:', { placement, pageUrl, apiUrl });

        const response = await fetch(apiUrl);
        if (!response.ok) {
          console.log('[AdSlot] API response not ok:', response.status);
          setLoading(false);
          return;
        }

        const data = await response.json();
        console.log('[AdSlot] API response data:', data);

        if (data.ad) {
          console.log('[AdSlot] Setting ad:', data.ad);
          setAd(data.ad);
          // Track impression
          fetch('/api/ads/impression', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ad_id: data.ad.id,
              page_url: window.location.pathname
            })
          }).catch(() => {});
        } else {
          console.log('[AdSlot] No ad returned from API');
        }
        setLoading(false);
      } catch (error) {
        console.error('[AdSlot] Error fetching ad:', error);
        setLoading(false);
      }
    };

    fetchAd();
  }, [placement, mounted]);

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

  // Show diagnostic box before mounting
  if (!mounted) {
    return (
      <div style={{
        backgroundColor: '#ff0000',
        color: '#ffffff',
        padding: '20px',
        margin: '20px 0',
        border: '5px solid #000000',
        fontSize: '18px',
        fontWeight: 'bold',
        textAlign: 'center',
        minHeight: '100px'
      }}>
        DIAGNOSTIC: AdSlot component exists but not mounted yet
      </div>
    );
  }

  // Don't render anything while loading or if no ad
  if (loading || !ad) {
    console.log('[AdSlot] Not rendering - loading:', loading, 'ad:', ad);
    // Show loading diagnostic
    return (
      <div style={{
        backgroundColor: '#ffaa00',
        color: '#000000',
        padding: '20px',
        margin: '20px 0',
        border: '5px solid #ff0000',
        fontSize: '18px',
        fontWeight: 'bold',
        textAlign: 'center',
        minHeight: '100px'
      }}>
        DIAGNOSTIC: Mounted but {loading ? 'LOADING...' : 'NO AD'}
      </div>
    );
  }

  console.log('[AdSlot] Rendering ad type:', ad.type, 'placement:', placement);

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
    return (
      <div
        className={`ad-slot ad-slot--image ad-slot--${placement} ${className}`}
        style={{
          backgroundColor: '#ffffff',
          border: '2px solid #e2e8f0',
          borderRadius: '12px',
          overflow: 'hidden',
          margin: '24px 0',
          position: 'relative'
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
            cursor: 'pointer'
          }}
        >
          <img
            src={ad.image_url}
            alt={ad.image_alt || 'Anuncio'}
            className="ad-slot__image"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block'
            }}
          />
        </div>
      </div>
    );
  }

  // Text banner
  if (ad.type === 'text_banner') {
    return (
      <div
        className={`ad-slot ad-slot--text ad-slot--${placement} ${className}`}
        style={{
          backgroundColor: '#ffffff',
          border: '2px solid #e2e8f0',
          borderRadius: '12px',
          padding: '32px',
          margin: '24px 0',
          position: 'relative',
          minHeight: '200px'
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
            borderRadius: '4px'
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
              fontSize: '20px',
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
              fontSize: '14px',
              color: '#475569',
              margin: '0 0 16px 0',
              lineHeight: '1.5'
            }}
          >
            {ad.description}
          </p>
          <button
            className="ad-slot__cta"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              fontSize: '14px',
              fontWeight: '600',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
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
