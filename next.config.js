/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.unsplash.com'],
  },
  // ── Ignorer ESLint pendant le build Vercel ──────────────────────────────
  eslint: {
    ignoreDuringBuilds: true,
  },

  // ── Ignorer les erreurs TypeScript pendant le build ─────────────────────
  typescript: {
    ignoreBuildErrors: true,
  },

  // ── Optimisation images Supabase ──────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [375, 640, 750, 828, 1080, 1200],
    imageSizes: [64, 128, 256, 384],
    minimumCacheTTL: 604800,
  },

  compress: true,

  experimental: {
    missingSuspenseWithCSRBailout: false,
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
      {
        source: '/(.*)\\.(ico|jpg|jpeg|png|webp|avif|svg|woff|woff2)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
        ],
      },
    ]
  },

}

module.exports = nextConfig
