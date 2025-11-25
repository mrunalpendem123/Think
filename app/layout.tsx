import type { Metadata, Viewport } from 'next'
import { Inter as FontSans } from 'next/font/google'

import { Analytics } from '@vercel/analytics/next'

import { cn } from '../lib/utils/index'

import AppSidebar from '../src/components/Sidebar'
import ThemeProvider from '../src/components/theme/Provider'

import './globals.css'

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans'
})

const title = 'Private Search AI'
const description =
  'A privacy-focused AI search engine with Venice AI and Parallel AI integration.'

export const metadata: Metadata = {
  metadataBase: new URL('http://localhost:3001'),
  title,
  description,
  openGraph: {
    title,
    description
  },
  twitter: {
    title,
    description,
    card: 'summary_large_image',
    creator: ''
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen flex flex-col font-sans antialiased',
          fontSans.variable
        )}
      >
        <ThemeProvider>
          <AppSidebar>
            <main className="flex flex-1 min-h-0">
              {children}
            </main>
          </AppSidebar>
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  )
}
