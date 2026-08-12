import type { Metadata } from 'next'
import { DM_Sans, Fraunces, Source_Serif_4 } from 'next/font/google'
import './globals.css'

const interfaceFont = DM_Sans({
  variable: '--font-interface',
  subsets: ['latin'],
  display: 'swap',
})

const displayFont = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
  display: 'swap',
})

const readingFont = Source_Serif_4({
  variable: '--font-reading',
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RAS.',
  description: 'Rien à signaler.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body
        className={`${interfaceFont.variable} ${displayFont.variable} ${readingFont.variable}`}
      >
        {children}
      </body>
    </html>
  )
}
