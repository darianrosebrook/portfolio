/**
 * Author: Darian Rosebrook
 * Purpose: Generate LD+JSON for InEx
 * Source: darianrosebrook.com/ldjson/index.ts
 * @param article - The article object
 * @param canonical - The canonical URL
 * @returns The LD+JSON object
 */

export { generateFoundationLDJson } from './foundation';

export function generateLDJson({
  article,
  canonical,
}: {
  article: {
    headline: string;
    alternativeHeadline?: string;
    description: string;
    published_at: string;
    modified_at?: string;
    image: string;
    keywords?: string;
    articleSection?: string;
  };
  canonical: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.headline,
    alternativeHeadline: article.alternativeHeadline,
    description: article.description,
    datePublished: article.published_at,
    dateModified: article.modified_at || article.published_at,
    inLanguage: 'en',
    articleSection: article.articleSection || 'Design Systems',
    keywords: article.keywords?.split(',').map((k) => k.trim()),
    author: {
      '@type': 'Person',
      name: 'Darian Rosebrook',
      url: 'https://darianrosebrook.com/',
      image: 'https://darianrosebrook.com/darianrosebrook.jpg',
      jobTitle: 'Staff Design Technologist, Design Systems Architect',
      worksFor: {
        '@type': 'Organization',
        name: 'Paths.design',
        url: 'https://paths.design',
      },
      sameAs: [
        'https://twitter.com/darianrosebrook',
        'https://www.linkedin.com/in/darianrosebrook/',
        'https://www.github.com/darianrosebrook',
        'https://www.instagram.com/darianrosebrook/',
        'https://www.youtube.com/@darian.rosebrook',
        'https://read.compassofdesign.com/@darianrosebrook',
      ],
    },
    publisher: {
      '@type': 'Organization',
      name: 'Paths.design',
      logo: {
        '@type': 'ImageObject',
        url: 'https://darianrosebrook.com/darianrosebrook.jpg',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
    image: {
      '@type': 'ImageObject',
      url: article.image,
    },
    url: canonical,
  };
}
