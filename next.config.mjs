/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utvioubcqkwwzvufhups.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      // News sources
      {
        protocol: 'https',
        hostname: 'www.rankia.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'rankia.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.finect.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'finect.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.fundssociety.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'fundssociety.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'global.morningstar.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cincodias.elpais.com',
        port: '',
        pathname: '/**',
      },
      // CDN Expansión
      {
        protocol: 'https',
        hostname: '**.uecdn.es',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'expansion.uecdn.es',
        port: '',
        pathname: '/**',
      },
      // Catch-all for any other news sources
      {
        protocol: 'https',
        hostname: '**.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.es',
        port: '',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

export default nextConfig
