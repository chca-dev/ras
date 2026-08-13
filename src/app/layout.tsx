import type { Metadata, Viewport } from 'next'
import { Fraunces, Instrument_Sans } from 'next/font/google'
import './design2.css'

const interfaceFont = Instrument_Sans({
  variable: '--font-instrument-sans',
  subsets: ['latin'],
  display: 'swap',
})

const displayFont = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RAS.',
  description: 'Rien à signaler.',
  applicationName: 'RAS.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'RAS.',
    statusBarStyle: 'default',
  },
  formatDetection: {
    telephone: false,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#F3F0E7',
  colorScheme: 'light',
}

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  return (
    <html lang="fr">
      <body
        className={`${interfaceFont.variable} ${displayFont.variable}`}
      >
        {children}
      </body>
    </html>
  )
}

export default RootLayout
