import type { Metadata } from 'next';
import { Fraunces, Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  axes: ['opsz', 'SOFT'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Avenue Eyewear - Matawan, NJ',
  description:
    'Independent optical boutique in Matawan, New Jersey. 351 Matawan Rd B · (732) 583-2800.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <Script id="scroll-restore" strategy="beforeInteractive">{`
          if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
          }
          window.scrollTo(0, 0);
        `}</Script>
        {children}
      </body>
    </html>
  );
}
