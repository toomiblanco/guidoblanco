import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import { Analytics } from '@vercel/analytics/next'
import WhatsAppButton from '@/components/whatsapp-button'
import NextAuthSessionProvider from '@/components/providers/session-provider'
import './globals.css'

export const metadata: Metadata = {
  title: 'Guido Blanco - Periodista Político y Económico',
  description: 'Análisis político, económico y periodismo de investigación. Cobertura especializada en temas de actualidad argentina.',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: '/favicon.png',
    apple: '/favicon.png',
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
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-1KWNH1MRPL"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-1KWNH1MRPL');
            `,
          }}
        />
        
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
        <link rel="shortcut icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/favicon.png" />
      </head>
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable} bg-[#dadbd5] text-[#1f201b]`}>
        <NextAuthSessionProvider>
          {children}
          <WhatsAppButton />
        </NextAuthSessionProvider>
        <Analytics />
      </body>
    </html>
  )
}
