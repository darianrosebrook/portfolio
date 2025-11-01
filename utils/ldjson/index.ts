/**
 * Author: Darian Rosebrook
 * Purpose: Generate LD+JSON for articles and foundation pages
 * Source: darianrosebrook.com/ldjson/index.ts
 */

import type { FoundationPageMetadata } from '@/types/foundationContent';

/**
 * Generate LD+JSON for standard articles
 */
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

/**
 * Generate BreadcrumbList schema for navigation
 */
export function generateBreadcrumbList({
  items,
}: {
  items: Array<{ name: string; url: string }>;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Generate Course schema for learning paths
 */
export function generateCourseSchema({
  name,
  description,
  url,
  learningLevel,
  teaches,
  prerequisites,
  timeRequired,
}: {
  name: string;
  description: string;
  url: string;
  learningLevel: string;
  teaches: string[];
  prerequisites: string[];
  timeRequired: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name,
    description,
    url,
    educationalLevel: learningLevel,
    teaches: teaches.map((topic) => ({
      '@type': 'DefinedTerm',
      name: topic,
    })),
    coursePrerequisites: prerequisites.map((prereq) => ({
      '@type': 'Course',
      name: prereq,
    })),
    timeRequired,
    provider: {
      '@type': 'Organization',
      name: 'Paths.design',
      url: 'https://paths.design',
    },
  };
}

/**
 * Generate LD+JSON for foundation education pages
 * Includes learning progression metadata, structured learning path data,
 * breadcrumbs, and course schema
 */
export function generateFoundationLDJson({
  metadata,
  canonical,
}: {
  metadata: FoundationPageMetadata;
  canonical: string;
}) {
  // Build breadcrumb list
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

  const baseArticle = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: metadata.title,
    description: metadata.description,
    datePublished: metadata.published_at,
    dateModified: metadata.modified_at || metadata.published_at,
    inLanguage: 'en',
    articleSection: 'Design Systems Foundations',
    keywords: metadata.keywords?.split(',').map((k) => k.trim()) || [],
    author: {
      '@type': 'Person',
      name: metadata.author.name,
      url: metadata.author.profileUrl || 'https://darianrosebrook.com/',
      image:
        metadata.author.imageUrl ||
        'https://darianrosebrook.com/darianrosebrook.jpg',
      jobTitle: metadata.author.role,
      worksFor: {
        '@type': 'Organization',
        name: 'Paths.design',
        url: 'https://paths.design',
      },
      sameAs: [
        'https://twitter.com/darianrosebrook',
        'https://www.linkedin.com/in/darianrosebrook/',
        'https://www.github.com/darianrosebrook',
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
      url: metadata.image,
      width: 1200,
      height: 630,
    },
    url: canonical,
  };

  // Add learning metadata
  const learningMetadata = {
    '@type': 'LearningResource',
    educationalLevel: metadata.learning.learning_level,
    learningResourceType: 'Tutorial',
    teaches: metadata.learning.role_relevance.map((role) => ({
      '@type': 'DefinedTerm',
      name: role,
    })),
    timeRequired: `PT${metadata.learning.estimated_reading_time}M`,
    prerequisite: metadata.learning.prerequisites.map((slug) => ({
      '@type': 'LearningResource',
      name: slug,
      url: `https://darianrosebrook.com/blueprints/foundations/${slug}`,
    })),
  };

  // Build the complete schema with all structured data
  const schemas: Array<Record<string, unknown>> = [
    // Main article with learning resource
    {
      ...baseArticle,
      ...learningMetadata,
      // Add course structure if prerequisites exist
      ...(metadata.learning.prerequisites.length > 0 ||
      metadata.learning.next_units.length > 0
        ? {
            coursePrerequisites: metadata.learning.prerequisites.map(
              (slug) => ({
                '@type': 'Course',
                name: slug,
                url: `https://darianrosebrook.com/blueprints/foundations/${slug}`,
              })
            ),
            hasPart: metadata.learning.next_units.map((slug) => ({
              '@type': 'LearningResource',
              name: slug,
              url: `https://darianrosebrook.com/blueprints/foundations/${slug}`,
            })),
          }
        : {}),
    },
    // Breadcrumb navigation
    generateBreadcrumbList({
      items: breadcrumbs,
    }),
  ];

  // Add course schema if this is part of a learning path
  if (
    metadata.learning.prerequisites.length > 0 ||
    metadata.learning.next_units.length > 0
  ) {
    schemas.push(
      generateCourseSchema({
        name: metadata.title,
        description: metadata.description,
        url: canonical,
        learningLevel: metadata.learning.learning_level,
        teaches: metadata.learning.role_relevance,
        prerequisites: metadata.learning.prerequisites,
        timeRequired: `PT${metadata.learning.estimated_reading_time}M`,
      })
    );
  }

  return schemas;
}
