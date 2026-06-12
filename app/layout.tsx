import type { Metadata } from 'next';
import { ViewTransition } from 'react';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-cormorant',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'NeverFades',
  description: 'NeverFades',
  openGraph: {
    title: 'NeverFades',
    description: 'NeverFades',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable}`}>
      <body className="bg-void text-white antialiased">
        <ViewTransition
          enter={{
            'nav-forward': 'moment-forward',
            'nav-back': 'moment-back',
            default: 'moment-soft',
          }}
          exit={{
            'nav-forward': 'moment-forward',
            'nav-back': 'moment-back',
            default: 'moment-soft',
          }}
          default="moment-soft"
        >
          {children}
        </ViewTransition>
      </body>
    </html>
  );
}
