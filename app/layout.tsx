import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SmoothScroll from '../components/SmoothScroll';
import { Toaster } from 'react-hot-toast';


const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'CorStack | Web Design & Development',
  description: 'Stunning, fast, and conversion-driven websites tailored for modern brands. Elevate your online presence with CorStack.',
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
      <body>
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
          <Header />
          {children}
          <Footer />
        </SmoothScroll>
      </body>
    </html>
  );
}