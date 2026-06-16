'use client';

import { useEffect, useState } from 'react';
import '../app/styles/components/ads.css';

interface Ad {
  id: string;
  type: 'image_banner' | 'text_banner' | 'script';
  name: string;

  // Image banner fields
  image_url?: string;
  image_alt?: string;

  // Text banner fields
  title?: string;
  description?: string;
  cta_text?: string;

  // Script fields
  script_code?: string;

  // Common fields
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
  const [impressionTracked, setImpressionTracked] = useState(false);

  useEffect(() => {
    fetchAd();
  }, [placement]);

  useEffect(() => {
    if (ad && !impressionTracked) {
      trackImpression();
      setImpressionTracked(true);
    }
  }, [ad, impressionTracked]);

  const fetchAd = async () => {
    try {
      const pageUrl = window.location.pathname;
      const apiUrl = `/api/ads/active?placement=${placement}&page_url=${encodeURIComponent(pageUrl)}`;
      console.log('[AdSlot] Fetching ad from:', apiUrl);

      const response = await fetch(apiUrl);

      if (!response.ok) {
        console.error('[AdSlot] Error fetching ad:', response.statusText);
        setLoading(false);
        return;
      }

      const data = await response.json();
      console.log('[AdSlot] Response data:', data);

      if (data.ad) {
        console.log('[AdSlot] Ad loaded successfully:', data.ad.name);
        setAd(data.ad);
      } else {
        console.log('[AdSlot] No ad available for placement:', placement);
      }

      setLoading(false);
    } catch (error) {
      console.error('[AdSlot] Error fetching ad:', error);
      setLoading(false);
    }
  };

  const trackImpression = async () => {
    if (!ad) return;

    try {
      await fetch('/api/ads/impression', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad_id: ad.id,
          page_url: window.location.pathname
        })
      });
    } catch (error) {
      console.error('Error tracking impression:', error);
    }
  };

  const trackClick = async () => {
    if (!ad) return;

    try {
      await fetch('/api/ads/click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ad_id: ad.id,
          page_url: window.location.pathname
        })
      });
    } catch (error) {
      console.error('Error tracking click:', error);
    }
  };

  const handleAdClick = () => {
    trackClick();

    if (ad?.link_url) {
      if (ad.target === '_blank') {
        window.open(ad.link_url, '_blank', 'noopener,noreferrer');
      } else {
        window.location.href = ad.link_url;
      }
    }
  };

  // No mostrar nada durante la carga
  if (loading || !ad) {
    console.log('[AdSlot] Not rendering - loading:', loading, 'ad:', ad);
    return null;
  }

  console.log('[AdSlot] Rendering ad type:', ad.type, 'with data:', {
    title: ad.title,
    description: ad.description,
    cta_text: ad.cta_text,
    image_url: ad.image_url,
    script_code: ad.script_code ? 'exists' : 'missing'
  });

  // Renderizar según el tipo de anuncio
  if (ad.type === 'script') {
    console.log('[AdSlot] Rendering script ad');
    return (
      <div
        className={`ad-slot ad-slot--script ad-slot--${placement} ${className}`}
        dangerouslySetInnerHTML={{ __html: ad.script_code || '' }}
      />
    );
  }

  if (ad.type === 'image_banner') {
    console.log('[AdSlot] Rendering image_banner ad');
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

  if (ad.type === 'text_banner') {
    console.log('[AdSlot] Rendering text_banner ad');
    return (
      <div
        className={`ad-slot ad-slot--text ad-slot--${placement} ${className}`}
        style={{
          border: '5px solid red',
          padding: '20px',
          margin: '20px 0',
          backgroundColor: '#ffeb3b',
          minHeight: '100px'
        }}
      >
        <div className="ad-slot__label">Publicidad</div>
        <div
          className="ad-slot__text-container"
          onClick={handleAdClick}
          role="button"
          tabIndex={0}
          onKeyPress={(e) => e.key === 'Enter' && handleAdClick()}
        >
          {ad.title && <h3 className="ad-slot__title">{ad.title}</h3>}
          {ad.description && <p className="ad-slot__description">{ad.description}</p>}
          {ad.cta_text && (
            <button className="ad-slot__cta">
              {ad.cta_text}
            </button>
          )}
        </div>
      </div>
    );
  }

  console.log('[AdSlot] No matching ad type, returning null');
  return null;
}
