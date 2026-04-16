import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import { Header, Footer } from '@/components/layout'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'HeritageKart - Authentic Historical & Cultural Artifacts',
    template: '%s | HeritageKart',
  },
  description:
    'Discover and collect authenticated historical and cultural artifacts. From ancient statues to rare manuscripts, find unique pieces of heritage at HeritageKart.',
  keywords: [
    'artifacts',
    'antiques',
    'cultural heritage',
    'historical items',
    'collectibles',
    'ancient artifacts',
    'indian art',
    'heritage marketplace',
  ],
  authors: [{ name: 'HeritageKart' }],
  creator: 'HeritageKart',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: 'https://heritagekart.com',
    siteName: 'HeritageKart',
    title: 'HeritageKart - Authentic Historical & Cultural Artifacts',
    description:
      'Discover and collect authenticated historical and cultural artifacts.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'HeritageKart',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HeritageKart - Authentic Historical & Cultural Artifacts',
    description:
      'Discover and collect authenticated historical and cultural artifacts.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-white text-stone-900 antialiased dark:bg-stone-950 dark:text-stone-100">
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1c1917',
              color: '#fff',
              borderRadius: '12px',
              padding: '16px',
            },
            success: {
              iconTheme: {
                primary: '#d97706',
                secondary: '#fff',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
