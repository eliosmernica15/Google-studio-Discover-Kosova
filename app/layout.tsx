import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'Discover Kosovo — Travel Guide, Trails & Digital Passport',
  description: 'The country-wide guide, trails explorer, cultural passport, and diaspora companion for exploring Kosovo.',
  openGraph: {
    title: 'Discover Kosovo — Travel Guide, Trails & Digital Passport',
    description: 'The country-wide guide, trails explorer, cultural passport, and diaspora companion for exploring Kosovo.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Discover Kosovo — Travel Guide, Trails & Digital Passport',
    description: 'The country-wide guide, trails explorer, cultural passport, and diaspora companion for exploring Kosovo.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
