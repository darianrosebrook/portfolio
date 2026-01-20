import type { Metadata } from 'next';
import HomeClient from './HomeClient';

/**
 * Metadata for the main page (Home).
 * Provides SEO, Open Graph, and Twitter card information for the homepage.
 */
export const metadata: Metadata = {
  title:
    'Darian Rosebrook: Staff Design Technologist | Design Systems, Seattle Washington',
  description:
    "Hey! I'm Darian Rosebrook 👋🏼 I am a staff design technologist in the Seattle, Washington area. I make design systems, custom design tooling, Figma plugins, and design ops stuff for product teams.",
  openGraph: {
    title:
      'Darian Rosebrook: Staff Design Technologist | Design Systems, Seattle Washington',
    description:
      "Hey! I'm Darian Rosebrook 👋🏼 I am a staff design technologist in the Seattle, Washington area. I make design systems, custom design tooling, Figma plugins, and design ops stuff for product teams.",
    url: 'https://darianrosebrook.com',
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
    title:
      'Darian Rosebrook: Staff Design Technologist | Design Systems, Seattle Washington',
    description:
      "Hey! I'm Darian Rosebrook 👋🏼 I am a staff design technologist in the Seattle, Washington area. I make design systems, custom design tooling, Figma plugins, and design ops stuff for product teams.",
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
    creator: '@darianrosebrook',
  },
  alternates: {
    canonical: 'https://darianrosebrook.com',
  },
};

export default function Home() {
  const ldJson = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Darian Rosebrook',
    url: 'https://darianrosebrook.com/',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': 'https://darianrosebrook.com/',
    },
    image: 'https://darianrosebrook.com/darianrosebrook.jpg',
    jobTitle: 'Staff Design Technologist, Design Systems',
    description:
      'Staff Design Technologist and Design Systems Architect focused on scalable UI component libraries, accessibility, and cross-platform tooling for web, iOS, and Android.',
    worksFor: {
      '@type': 'Organization',
      name: 'Qualtrics',
    },
    knowsAbout: [
      'Design Systems',
      'Component Libraries',
      'Design Tokens',
      'Accessibility',
      'UX Engineering',
      'Cross-platform Design',
      'Radix UI',
      'Figma Plugins',
    ],
    sameAs: [
      'https://twitter.com/darianrosebrook',
      'https://www.linkedin.com/in/darianrosebrook/',
      'https://www.github.com/darianrosebrook',
      'https://www.instagram.com/darianrosebrook/',
      'https://www.youtube.com/@darian.rosebrook',
      'https://read.compassofdesign.com/@darianrosebrook',
      'https://darianrosebrook.com/docs/design-system',
      'https://github.com/darianrosebrook/component-blueprints',
    ],
  };

  return <HomeClient ldJson={ldJson} />;
}
