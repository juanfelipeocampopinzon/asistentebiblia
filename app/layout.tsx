import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/lib/auth/google-auth'
import './globals.css'

const geist = Geist({ 
  subsets: ['latin'],
  variable: '--font-geist-sans'
})

const geistMono = Geist_Mono({ 
  subsets: ['latin'],
  variable: '--font-geist-mono'
})

const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT || ''

export const metadata: Metadata = {
  title: 'Biblia IA',
  description: 'Lectura bíblica en español con búsqueda, guardados e IA para explicar y comparar versículos.',
  keywords: ['Biblia', 'Escritura', 'RVR', 'IA bíblica', 'Fe'],
  authors: [{ name: 'Biblia IA' }],
  openGraph: {
    title: 'Biblia IA',
    description: 'Lee y estudia la Biblia en español con ayuda de IA',
    type: 'website',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fdfcfa' },
    { media: '(prefers-color-scheme: dark)', color: '#1a1a2e' },
  ],
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es" suppressHydrationWarning className="bg-background">
      <body className={`${geist.variable} ${geistMono.variable} font-sans antialiased`}>
        {adsenseClient && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
