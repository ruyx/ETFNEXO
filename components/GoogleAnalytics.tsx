'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'

export default function GoogleAnalytics() {
  const GA_ID = 'G-ZM104ZWBP1'
  const [loadAnalytics, setLoadAnalytics] = useState(false)

  useEffect(() => {
    // Verificar consentimiento guardado
    const consent = localStorage.getItem('cookie-consent')
    if (consent === 'accepted') {
      setLoadAnalytics(true)
    }
  }, [])

  if (!loadAnalytics) {
    return (
      <Script
        id="google-analytics-consent"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'analytics_storage': 'denied',
              'ad_storage': 'denied',
              'wait_for_update': 500
            });
          `,
        }}
      />
    )
  }

  return (
    <>
      <Script
        id="google-analytics-consent"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              'analytics_storage': 'granted',
              'ad_storage': 'granted'
            });
          `,
        }}
      />
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            gtag('js', new Date());
            gtag('config', '${GA_ID}', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <Script
        id="google-analytics-events"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: \`
            // Scroll Depth Tracking (25%, 50%, 75%, 100%)
            (function() {
              let scrollDepths = { 25: false, 50: false, 75: false, 100: false };

              function trackScrollDepth() {
                const scrollPercent = Math.round(
                  (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
                );

                Object.keys(scrollDepths).forEach(depth => {
                  if (!scrollDepths[depth] && scrollPercent >= depth) {
                    scrollDepths[depth] = true;
                    gtag('event', 'scroll_depth', {
                      depth: depth + '%',
                      page: window.location.pathname
                    });
                  }
                });
              }

              // Throttle scroll handler (max 2 checks/second)
              let scrollTimeout;
              window.addEventListener('scroll', () => {
                if (!scrollTimeout) {
                  scrollTimeout = setTimeout(() => {
                    trackScrollDepth();
                    scrollTimeout = null;
                  }, 500);
                }
              }, { passive: true });
            })();

            // Time on Page Tracking (30s, 1min, 2min)
            (function() {
              const timeMarks = [
                { seconds: 30, fired: false },
                { seconds: 60, fired: false },
                { seconds: 120, fired: false }
              ];

              let startTime = Date.now();

              setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);

                timeMarks.forEach(mark => {
                  if (!mark.fired && elapsed >= mark.seconds) {
                    mark.fired = true;
                    gtag('event', 'time_on_page', {
                      duration: mark.seconds + 's',
                      page: window.location.pathname
                    });
                  }
                });
              }, 5000); // Check every 5 seconds
            })();

            // CTA Click Tracking
            document.addEventListener('click', (e) => {
              const target = e.target.closest('a');
              if (!target) return;

              const href = target.getAttribute('href');
              const text = target.textContent.trim();

              // Track "Ver Rankings" CTAs
              if (href === '/rankings' || text.includes('Rankings')) {
                gtag('event', 'cta_click', {
                  cta_name: 'Ver Rankings',
                  cta_location: window.location.pathname,
                  cta_text: text
                });
              }

              // Track Newsletter CTAs
              if (href === '/newsletter' || text.includes('Newsletter') || text.includes('Suscri')) {
                gtag('event', 'cta_click', {
                  cta_name: 'Newsletter',
                  cta_location: window.location.pathname,
                  cta_text: text
                });
              }
            }, { passive: true });
          \`,
        }}
      />
    </>
  )
}
