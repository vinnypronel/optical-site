import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { BUSINESS, SCHEMA_HOURS } from '@/lib/business';
import '@fontsource/playfair-display/400.css';
import '@fontsource/playfair-display/400-italic.css';
import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/inter/300.css';
import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';
import '@fontsource/lora/400.css';
import '@fontsource/lora/400-italic.css';
import '@fontsource/lora/500.css';
import '@fontsource/lora/500-italic.css';
import './globals.css';

const DESC =
  'Independent optical boutique in Matawan, New Jersey. Hand-selected frames, expert eye exams, and bespoke lens fittings. 351 Matawan Rd B · (732) 583-2800.';

export const metadata: Metadata = {
  metadataBase: new URL(BUSINESS.url),
  title: {
    default: 'Avenue Eyewear | Independent Optical · Matawan, NJ',
    template: '%s · Avenue Eyewear',
  },
  description: DESC,
  keywords: [
    'optical Matawan NJ',
    'eyewear Matawan',
    'eye exam Matawan',
    'independent optician New Jersey',
    'designer glasses NJ',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: BUSINESS.url,
    siteName: 'Avenue Eyewear',
    title: 'Avenue Eyewear | Independent Optical · Matawan, NJ',
    description: DESC,
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Avenue Eyewear | Independent Optical · Matawan, NJ',
    description: DESC,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ddc7a0',
};

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'Optician',
  name: BUSINESS.name,
  image: `${BUSINESS.url}/og.jpg`,
  '@id': BUSINESS.url,
  url: BUSINESS.url,
  telephone: BUSINESS.phone,
  priceRange: '$$',
  address: {
    '@type': 'PostalAddress',
    streetAddress: BUSINESS.street,
    addressLocality: BUSINESS.city,
    addressRegion: BUSINESS.region,
    postalCode: BUSINESS.postal,
    addressCountry: 'US',
  },
  geo: {
    '@type': 'GeoCoordinates',
    latitude: BUSINESS.geo.lat,
    longitude: BUSINESS.geo.lng,
  },
  openingHoursSpecification: SCHEMA_HOURS.map((h) => {
    const [days, range] = h.split(' ');
    const [opens, closes] = range.split('-');
    const map: Record<string, string> = {
      Mo: 'Monday', Tu: 'Tuesday', We: 'Wednesday', Th: 'Thursday',
      Fr: 'Friday', Sa: 'Saturday', Su: 'Sunday',
    };
    return {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: map[days],
      opens,
      closes,
    };
  }),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script id="scroll-restore" strategy="beforeInteractive">{`
          if ('scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
          }
          window.scrollTo(0, 0);
        `}</Script>
        <Script
          id="ld-json"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <a href="#main" className="skip-link">Skip to content</a>
        {children}
      </body>
    </html>
  );
}
