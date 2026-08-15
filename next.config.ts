import type { NextConfig } from 'next'

const isDevelopment = process.env.NODE_ENV === 'development'

const contentSecurityPolicy = [
  'default-src \'self\'',
  'base-uri \'self\'',
  'form-action \'self\'',
  'frame-ancestors \'none\'',
  'object-src \'none\'',
  `script-src 'self' 'unsafe-inline'${isDevelopment ? ' \'unsafe-eval\'' : ''}`,
  'style-src \'self\' \'unsafe-inline\'',
  'img-src \'self\' blob: data:',
  'font-src \'self\'',
  `connect-src 'self'${isDevelopment ? ' ws: wss:' : ''}`,
  'manifest-src \'self\'',
  'media-src \'self\'',
  'worker-src \'self\' blob:',
  ...(isDevelopment ? [] : ['upgrade-insecure-requests']),
].join('; ')

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: contentSecurityPolicy,
  },
  {
    key: 'Referrer-Policy',
    value: 'no-referrer',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  },
  {
    key: 'Cross-Origin-Resource-Policy',
    value: 'same-origin',
  },
  {
    key: 'X-Permitted-Cross-Domain-Policies',
    value: 'none',
  },
  ...(
    isDevelopment
      ? []
      : [{
          key: 'Strict-Transport-Security',
          value: 'max-age=31536000',
        }]
  ),
]

const nextConfig: NextConfig = {
  reactCompiler: true,
  poweredByHeader: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb',
    },
  },
  headers: async () => [
    {
      source: '/:path*',
      headers: securityHeaders,
    },
  ],
}

export default nextConfig
