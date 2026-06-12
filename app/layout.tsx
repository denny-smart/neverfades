import type { Metadata } from 'next';
import { ViewTransition } from 'react';
import { Playfair_Display, Outfit } from 'next/font/google';
import './globals.css';

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-playfair',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-outfit',
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
    <html lang="en" className={`${playfair.variable} ${outfit.variable}`}>
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
