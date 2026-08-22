import type { Metadata, Viewport } from 'next'
import { Fraunces, Instrument_Sans } from 'next/font/google'
import { cookies } from 'next/headers'
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

const getIsDarkTheme = async () => {
  const cookieStore = await cookies()

  return cookieStore.get('ras-theme')?.value === 'dark'
}

export const generateViewport = async (): Promise<Viewport> => {
  const isDark = await getIsDarkTheme()

  return {
    width: 'device-width',
    initialScale: 1,
    viewportFit: 'cover',
    themeColor: isDark ? '#323339' : '#fbfbfb',
    colorScheme: 'light dark',
  }
}

const RootLayout = async ({
  children,
}: Readonly<{
  children: React.ReactNode
}>) => {
  const isDark = await getIsDarkTheme()

  return (
    <html lang='fr' className={isDark ? 'dark' : undefined} suppressHydrationWarning>
      <body
        className={`${interfaceFont.variable} ${displayFont.variable}`}
      >
        {children}
      </body>
    </html>
  )
}

export default RootLayout
