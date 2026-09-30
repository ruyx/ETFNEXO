import type { Metadata } from 'next'
import './globals.css'
import GoogleAnalytics from '@/components/GoogleAnalytics'
import CookieBanner from '@/components/CookieBanner'
import { WebMCPProvider } from '@/components/webmcp/WebMCPProvider'
import { SearchResultsPanel } from '@/components/webmcp/SearchResultsPanel'
import { TermExplanationTooltip } from '@/components/webmcp/TermExplanationTooltip'
import { PortfolioAnalysisPanel } from '@/components/webmcp/PortfolioAnalysisPanel'
import { ETFComparisonPanel } from '@/components/webmcp/ETFComparisonPanel'

export const metadata: Metadata = {
  metadataBase: new URL('https://etfnexo.com'),

  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5
  },

  title: {
    default: 'ETF Nexo - Rankings, Noticias y Academia de ETFs',
    template: '%s | ETF Nexo'
  },

  description: 'Plataforma líder de análisis de ETFs en España. Rankings actualizados, noticias diarias, entrevistas con expertos y academia educativa. Información transparente para inversores inteligentes.',

  keywords: [
    'ETF',
    'ETFs España',
    'ranking ETF',
    'análisis ETF',
    'inversión ETF',
    'mejores ETF',
    'ETF Nexo Score',
    'fondos cotizados',
    'academia ETF',
    'noticias ETF'
  ],

  authors: [{ name: 'ETF Nexo', url: 'https://etfnexo.com' }],
  creator: 'ETF Nexo',
  publisher: 'ETF Nexo',

  alternates: {
    canonical: 'https://etfnexo.com'
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },

  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
    shortcut: ['/favicon.svg'],
    apple: [{ url: '/favicon.svg', type: 'image/svg+xml' }]
  },

  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://etfnexo.com',
    siteName: 'ETF Nexo',
    title: 'ETF Nexo - Rankings, Noticias y Academia de ETFs',
    description: 'Rankings actualizados de 170+ ETFs, noticias diarias y contenido educativo sobre inversión en fondos cotizados.',
    images: [
      {
        url: '/og-image-home.png',
        width: 1200,
        height: 630,
        alt: 'ETF Nexo - Plataforma de análisis de ETFs',
        type: 'image/png'
      }
    ]
  },

  twitter: {
    card: 'summary_large_image',
    site: '@etfnexo',
    creator: '@etfnexo',
    title: 'ETF Nexo - Rankings, Noticias y Academia de ETFs',
    description: 'Rankings actualizados de 170+ ETFs, noticias diarias y contenido educativo sobre inversión en fondos cotizados.',
    images: ['/og-image-home.png']
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        {/* Google Search Console Verification */}
        <meta name="google-site-verification" content="3BAN5-FdZRADxgwEaDAvjXWAit0gGyKzoa1mFBKnA9o" />

        <GoogleAnalytics />
        {/* Schema.org Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'ETF Nexo',
              url: 'https://etfnexo.com',
              logo: 'https://etfnexo.com/logo.png',
              sameAs: [
                'https://twitter.com/etfnexo',
                'https://linkedin.com/company/etfnexo'
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'Customer Service',
                availableLanguage: 'Spanish'
              }
            })
          }}
        />
      </head>
      <body className="antialiased">
        <WebMCPProvider>
          {children}
          <CookieBanner />

          {/* WebMCP UI Components */}
          <SearchResultsPanel />
          <TermExplanationTooltip />
          <PortfolioAnalysisPanel />
          <ETFComparisonPanel />
        </WebMCPProvider>
      </body>
    </html>
  )
}
