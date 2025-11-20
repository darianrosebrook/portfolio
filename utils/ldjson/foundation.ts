/**
 * Generate LD+JSON for Foundation pages
 */

import type { FoundationPageMetadata } from '@/types/foundationContent';

export function generateFoundationLDJson({
  metadata,
  canonical,
}: {
  metadata: FoundationPageMetadata;
  canonical: string;
}) {
  const schemas = [];

  // BreadcrumbList schema
  const breadcrumbs = [
    { name: 'Home', url: 'https://darianrosebrook.com/' },
    { name: 'Blueprints', url: 'https://darianrosebrook.com/blueprints' },
    {
      name: 'Foundations',
      url: 'https://darianrosebrook.com/blueprints/foundations',
    },
    {
      name: metadata.title,
      url: canonical,
    },
  ];

  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  });

  // Course schema (foundation pages are educational content)
  schemas.push({
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: metadata.title,
    description: metadata.description,
    url: canonical,
    provider: {
      '@type': 'Organization',
      name: 'Paths.design',
      url: 'https://paths.design',
    },
  });

  return schemas;
}
