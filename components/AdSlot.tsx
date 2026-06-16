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

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') {
      console.log('[AdSlot] Server-side, skipping fetch');
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
  }, [placement]);

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

  // Don't render anything while loading or if no ad
  if (loading || !ad) {
    console.log('[AdSlot] Not rendering - loading:', loading, 'ad:', ad);
    return null;
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
      <div className={`ad-slot ad-slot--image ad-slot--${placement} ${className}`}>
        <div className="ad-slot__label">Publicidad</div>
        <div
          className="ad-slot__image-container"
          onClick={handleAdClick}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && handleAdClick()}
        >
          <img
            src={ad.image_url}
            alt={ad.image_alt || 'Anuncio'}
            className="ad-slot__image"
          />
        </div>
      </div>
    );
  }

  // Text banner
  if (ad.type === 'text_banner') {
    return (
      <div className={`ad-slot ad-slot--text ad-slot--${placement} ${className}`}>
        <div className="ad-slot__label">Publicidad</div>
        <div
          className="ad-slot__text-container"
          onClick={handleAdClick}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && handleAdClick()}
        >
          <h3 className="ad-slot__title">{ad.title}</h3>
          <p className="ad-slot__description">{ad.description}</p>
          <button className="ad-slot__cta">{ad.cta_text || 'Saber más'}</button>
        </div>
      </div>
    );
  }

  return null;
}
