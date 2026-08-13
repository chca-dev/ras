import type { MetadataRoute } from 'next'

const manifest = (): MetadataRoute.Manifest => {
  return {
    name: 'RAS.',
    short_name: 'RAS.',
    description: 'Rien à signaler.',
    start_url: '/journal',
    display: 'standalone',
    background_color: '#F3F0E7',
    theme_color: '#F3F0E7',
    lang: 'fr',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/icon/192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon/512',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}

export default manifest
