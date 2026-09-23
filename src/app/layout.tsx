import type { Metadata, Viewport } from 'next'
import './globals.css'
import { QueryProvider }  from '@/components/providers/QueryProvider'
import { AuthProvider }   from '@/components/providers/AuthProvider'
import { ThemeProvider }  from '@/components/providers/ThemeProvider'
import { Toaster }        from 'react-hot-toast'
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'

export const metadata: Metadata = {
  title:       { default: 'JLPT Master Mongolia', template: '%s | JLPT Master' },
  description: 'Монгол хэл дээрх хамгийн дэлгэрэнгүй JLPT бэлтгэлийн платформ.',
  keywords:    ['JLPT', 'Japanese', 'Mongolia', 'N2', 'N1'],
  authors:     [{ name: 'JLPT Master Mongolia' }],
  icons:       { icon: '/favicon.ico' },
}

export const viewport: Viewport = {
  width:        'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [locale, messages] = await Promise.all([getLocale(), getMessages()])
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryProvider>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <AuthProvider>
                {children}
                <Toaster position="bottom-right" toastOptions={{ duration: 3000, style: { borderRadius: '12px' } }} />
              </AuthProvider>
            </NextIntlClientProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
