import type { Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SmoothScroll from '../components/SmoothScroll';
import { Toaster } from 'react-hot-toast';
import NextTopLoader from 'nextjs-toploader';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://corstack.dev'),
  title: {
    default: 'Corstack | Top Web Design Agency in Lagos, Nigeria',
    template: '%s | Corstack'
  },
  description: 'Corstack is a premium web design and development agency in Lagos, Nigeria. We build stunning, fast, and conversion-driven websites tailored for modern brands. Hire the best frontend developers and web designers.',
  keywords: [
    "web design in nigeria",
    "web agency in nigeria",
    "top 5 web agency in nigeria",
    "top web design agency",
    "best web design company in lagos",
    "frontend developer company nigeria",
    "website agency nigeria",
    "web designers in lagos",
    "web developers in nigeria",
    "software development agency nigeria",
    "premium website design",
    "corstack",
    "corstack.dev",
    "creative web agency",
    "custom web development lagos",
    "ecommerce website design nigeria",
    "ui ux design agency nigeria",
    "react nextjs developers nigeria",
    "seo optimized website developers"
  ],
  authors: [{ name: 'Corstack' }],
  creator: 'Corstack',
  publisher: 'Corstack',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Corstack | Top Web Design Agency in Lagos, Nigeria',
    description: 'Elevate your online presence with Corstack. Stunning, fast, and conversion-driven websites tailored for modern brands.',
    url: 'https://corstack.dev',
    siteName: 'Corstack',
    locale: 'en_NG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corstack | Top Web Design Agency in Lagos, Nigeria',
    description: 'Elevate your online presence with Corstack. Stunning, fast, and conversion-driven websites tailored for modern brands.',
    creator: '@corstackdev',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/icon.png',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${plusJakartaSans.variable}`}>
      <body className="overflow-x-hidden">
        <NextTopLoader 
          color="#0055cc" 
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          showSpinner={false} 
          shadow="0 0 10px #0055cc, 0 0 5px #0055cc" 
        />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#13131A',
              color: '#FFFFFF',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '12px',
              padding: '1rem 1.5rem',
              fontWeight: 600,
              fontSize: '0.95rem',
            },
            success: {
              iconTheme: {
                primary: '#10B981', 
                secondary: '#FFFFFF', 
              },
            },
            error: {
              iconTheme: {
                primary: '#EF4444', 
                secondary: '#FFFFFF',
              },
            },
          }}
        />
        <SmoothScroll>
          <div className="flex flex-col min-h-screen overflow-x-hidden w-full">
            <Header />
            {children}
            <Footer />
          </div>
        </SmoothScroll>
      </body>
      {/* Google Analytics */}
      <GoogleAnalytics gaId="G-3KPVEQ91R0" />
    </html>
  );
}