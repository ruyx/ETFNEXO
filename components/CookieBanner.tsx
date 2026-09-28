'use client';

import { useState, useEffect } from 'react';

type ConsentStatus = 'pending' | 'accepted' | 'rejected';

export default function CookieBanner() {
  const [consentStatus, setConsentStatus] = useState<ConsentStatus>('pending');
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Verificar si ya hay una elección guardada
    const savedConsent = localStorage.getItem('cookie-consent');
    if (savedConsent) {
      setConsentStatus(savedConsent as ConsentStatus);
    } else {
      // Mostrar banner después de 1 segundo (evitar flash en carga)
      const timer = setTimeout(() => setShowBanner(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setConsentStatus('accepted');
    setShowBanner(false);

    // Activar Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
      });
    }
  };

  const handleReject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setConsentStatus('rejected');
    setShowBanner(false);

    // Desactivar Google Analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
      });
    }
  };

  if (!showBanner || consentStatus !== 'pending') {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div className="cookie-banner-backdrop" />

      {/* Banner */}
      <div className="cookie-banner">
        <div className="cookie-banner__container">
          <div className="cookie-banner__content">
            <h3 className="cookie-banner__title">
              🍪 Usamos cookies
            </h3>
            <p className="cookie-banner__text">
              Utilizamos cookies propias y de terceros para mejorar tu experiencia,
              analizar el tráfico del sitio y mostrar publicidad personalizada.
              Puedes aceptar todas las cookies o rechazarlas.
            </p>
            <p className="cookie-banner__links">
              <a href="/terminos-y-privacidad" className="cookie-banner__link">
                Política de privacidad
              </a>
            </p>
          </div>

          <div className="cookie-banner__actions">
            <button
              onClick={handleReject}
              className="cookie-banner__button cookie-banner__button--secondary"
            >
              Rechazar
            </button>
            <button
              onClick={handleAccept}
              className="cookie-banner__button cookie-banner__button--primary"
            >
              Aceptar todas
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cookie-banner-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.4);
          z-index: 9998;
          animation: fadeIn 0.3s ease-in-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .cookie-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          background: white;
          border-top: 1px solid #e2e8f0;
          box-shadow: 0 -4px 6px -1px rgba(0, 0, 0, 0.1);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }

        .cookie-banner__container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        @media (min-width: 768px) {
          .cookie-banner__container {
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
          }
        }

        .cookie-banner__content {
          flex: 1;
        }

        .cookie-banner__title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .cookie-banner__text {
          font-size: 0.875rem;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 0.5rem;
        }

        .cookie-banner__links {
          font-size: 0.875rem;
        }

        .cookie-banner__link {
          color: #3b82f6;
          text-decoration: underline;
          transition: color 0.2s;
        }

        .cookie-banner__link:hover {
          color: #2563eb;
        }

        .cookie-banner__actions {
          display: flex;
          gap: 0.75rem;
          flex-shrink: 0;
        }

        .cookie-banner__button {
          padding: 0.625rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          border-radius: 0.5rem;
          transition: all 0.2s;
          border: none;
          cursor: pointer;
          /* Touch target: min 48px altura */
          min-height: 48px;
        }

        .cookie-banner__button--primary {
          background-color: #3b82f6;
          color: white;
        }

        .cookie-banner__button--primary:hover {
          background-color: #2563eb;
        }

        .cookie-banner__button--secondary {
          background-color: white;
          color: #64748b;
          border: 1px solid #e2e8f0;
        }

        .cookie-banner__button--secondary:hover {
          background-color: #f8fafc;
          border-color: #cbd5e1;
        }

        /* Mobile: botones full width */
        @media (max-width: 640px) {
          .cookie-banner__actions {
            flex-direction: column-reverse;
          }

          .cookie-banner__button {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
}
