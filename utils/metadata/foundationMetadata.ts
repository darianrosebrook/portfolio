/**
 * Utilities for generating foundation page metadata
 * Handles reading time calculation, update logs, and SEO optimization
 */

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import type {
  FoundationPageMetadata,
  GovernanceMetadata,
} from '@/types/foundationContent';

/**
 * Calculate reading time based on word count
 * Average reading speed: 200-250 words per minute
 */
export function calculateReadingTime(wordCount: number): number {
  const wordsPerMinute = 225; // Average reading speed
  return Math.ceil(wordCount / wordsPerMinute);
}

/**
 * Count words in a string or React node content
 */
export function countWords(content: string | ReactNode): number {
  if (typeof content === 'string') {
    return content.trim().split(/\s+/).filter(Boolean).length;
  }

  // For React nodes, convert to string representation
  // This is a simplified version - in practice, you might want to extract text recursively
  return 0; // Placeholder - would need more sophisticated text extraction
}

/**
 * Calculate next review date (default: 90 days from last review)
 */
export function calculateNextReviewDate(
  lastReviewDate: string,
  daysAhead: number = 90
): string {
  const date = new Date(lastReviewDate);
  date.setDate(date.getDate() + daysAhead);
  return date.toISOString();
}

/**
 * Check if a page needs review based on next_review_date
 */
export function needsReview(governance: GovernanceMetadata): boolean {
  const now = new Date();
  const nextReview = new Date(governance.next_review_date);
  return now >= nextReview || governance.alignment_status === 'needs-review';
}

/**
 * Generate SEO-friendly metadata for foundation pages
 * Returns Next.js Metadata format
 */
export function generateFoundationMetadata(
  metadata: FoundationPageMetadata
): Metadata {
  const keywords = [
    'design systems',
    'design tokens',
    'foundation',
    ...metadata.learning.role_relevance.map((role) => role),
    ...(metadata.keywords?.split(',').map((k) => k.trim()) || []),
  ];

  return {
    title: `${metadata.title} | Darian Rosebrook`,
    description: metadata.description,
    keywords: keywords.join(', '),
    authors: [
      {
        name: metadata.author.name,
        url: metadata.author.profileUrl || 'https://darianrosebrook.com/',
      },
    ],
    creator: metadata.author.name,
    publisher: 'Paths.design',
    category: 'Design Systems Education',
    openGraph: {
      title: metadata.title,
      description: metadata.description,
      url: metadata.canonicalUrl,
      siteName: 'Darian Rosebrook | Design Systems',
      images: [
        {
          url: metadata.image,
          width: 1200,
          height: 630,
          alt: metadata.title,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: metadata.published_at,
      modifiedTime: metadata.modified_at || metadata.published_at,
      authors: [metadata.author.name],
      tags: keywords,
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description,
      creator: '@darianrosebrook',
      images: [metadata.image],
    },
    alternates: {
      canonical: metadata.canonicalUrl,
    },
    other: {
      'article:published_time': metadata.published_at,
      'article:modified_time': metadata.modified_at || metadata.published_at,
      'article:author': metadata.author.name,
      'article:section': 'Design Systems Foundations',
      'article:tag': keywords.join(', '),
      'learning:level': metadata.learning.learning_level,
      'learning:reading_time': `${metadata.learning.estimated_reading_time} minutes`,
    },
  };
}

/**
 * Generate update log entry
 */
export function generateUpdateLog(
  version: string,
  description: string,
  type: 'breaking' | 'feature' | 'update' | 'deprecation' = 'update'
): {
  date: string;
  version: string;
  description: string;
  type: 'breaking' | 'feature' | 'update' | 'deprecation';
} {
  return {
    date: new Date().toISOString(),
    version,
    description,
    type,
  };
}
