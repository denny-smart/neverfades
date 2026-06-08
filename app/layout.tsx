import type { Metadata } from 'next';
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
  title: 'NeverFades — A love that never does',
  description:
    'Create a digital moment that fades. For a love that never does. Share a cinematic, scarce keepsake that disappears after 10 views.',
  keywords: ['love message', 'digital keepsake', 'ephemeral', 'romantic'],
  openGraph: {
    title: 'NeverFades',
    description: 'Create a digital moment that fades. For a love that never does.',
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
      <body className="bg-void text-white antialiased">{children}</body>
    </html>
  );
}
