import { Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';
import { SITE_URL } from '@/lib/utils';

const sans = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });
const serif = Playfair_Display({ subsets: ['latin'], variable: '--font-serif', display: 'swap' });

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Aarvi Property | Real Estate Consultants', template: '%s | Aarvi Property' },
  description: 'Residential, commercial and plotted properties in Gurugram and Delhi-NCR.',
};

export const viewport = { width: 'device-width', initialScale: 1, themeColor: '#0f3d36' };

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${sans.variable} ${serif.variable}`}>
      <body>{children}</body>
    </html>
  );
}
