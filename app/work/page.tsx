import type { Metadata } from 'next';
import WorkPageClient from './WorkPageClient';

export const metadata: Metadata = {
  title: 'Work & Case Studies | Darian Rosebrook',
  description:
    'Explore Darian Rosebrook\'s portfolio of design system work, custom tooling, and design ops projects at companies like Microsoft, Salesforce, Nike, eBay, Verizon, and Qualtrics.',
  openGraph: {
    title: 'Work & Case Studies | Darian Rosebrook',
    description:
      'Explore Darian Rosebrook\'s portfolio of design system work, custom tooling, and design ops projects at companies like Microsoft, Salesforce, Nike, eBay, Verizon, and Qualtrics.',
    url: 'https://darianrosebrook.com/work',
    siteName: 'Darian Rosebrook',
    images: [
      {
        url: 'https://darianrosebrook.com/darianrosebrook.jpg',
        width: 1200,
        height: 630,
        alt: 'Darian Rosebrook',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Work & Case Studies | Darian Rosebrook',
    description:
      'Explore Darian Rosebrook\'s portfolio of design system work, custom tooling, and design ops projects at companies like Microsoft, Salesforce, Nike, eBay, Verizon, and Qualtrics.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
    creator: '@darianrosebrook',
  },
  alternates: {
    canonical: 'https://darianrosebrook.com/work',
  },
};

export default function Page() {
  return <WorkPageClient />;
}
