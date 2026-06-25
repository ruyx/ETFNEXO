import type { Metadata } from 'next'
import './globals.css'
import GoogleAnalytics from '@/components/GoogleAnalytics'

export const metadata: Metadata = {
  title: 'ETF Nexo - Comunidad y Rankings de ETF',
  description: 'Plataforma profesional de análisis y rankings de ETFs. Conocimiento democratizado, comunidad de inversores y herramientas de inversión inteligente.',
  keywords: ['ETF', 'inversión', 'finanzas', 'rankings', 'análisis', 'comunidad'],
  authors: [{ name: 'ETF Nexo' }],
  creator: 'ETF Nexo',
  publisher: 'ETF Nexo',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    shortcut: ['/favicon.svg'],
    apple: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://etfnexo.com',
    title: 'ETF Nexo - Comunidad y Rankings de ETF',
    description: 'Plataforma profesional de análisis y rankings de ETFs',
    siteName: 'ETF Nexo',
    images: [
      {
        url: '/logo.svg',
        width: 1200,
        height: 630,
        alt: 'ETF Nexo Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ETF Nexo - Comunidad y Rankings de ETF',
    description: 'Plataforma profesional de análisis y rankings de ETFs',
    images: ['/logo.svg'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <head>
        <GoogleAnalytics />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
