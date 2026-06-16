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
      const response = await fetch(`/api/ads/active?placement=${placement}&page_url=${encodeURIComponent(pageUrl)}`);

      if (!response.ok) {
        console.error('Error fetching ad:', response.statusText);
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.ad) {
        setAd(data.ad);
      }

      setLoading(false);
    } catch (error) {
      console.error('Error fetching ad:', error);
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
    return null;
  }

  // Renderizar según el tipo de anuncio
  if (ad.type === 'script') {
    return (
      <div
        className={`ad-slot ad-slot--script ad-slot--${placement} ${className}`}
        dangerouslySetInnerHTML={{ __html: ad.script_code || '' }}
      />
    );
  }

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

  return null;
}
