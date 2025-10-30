/**
 * Helper utilities for working with working draft columns
 * Provides utilities to merge working and published content
 */

import type { Article, CaseStudy } from '@/types';
import type { JSONContent } from '@tiptap/react';

type RecordType = Article | CaseStudy;

/**
 * Gets the effective content for editing
 * Returns working draft if is_dirty is true, otherwise published content
 */
export function getEffectiveContent(record: RecordType): {
  articleBody: JSONContent | null;
  headline: string | null;
  description: string | null;
  image: string | null;
  keywords: string | null;
  articleSection: string | null;
} {
  const isDirty = record.is_dirty ?? false;
  
  // Database uses snake_case for working columns
  const workingBody = (record as unknown as { workingbody?: unknown })
    .workingbody as JSONContent | null | undefined;
  const workingHeadline = (record as unknown as { workingheadline?: string | null })
    .workingheadline;
  const workingDescription = (record as unknown as { workingdescription?: string | null })
    .workingdescription;
  const workingImage = (record as unknown as { workingimage?: string | null })
    .workingimage;
  const workingKeywords = (record as unknown as { workingkeywords?: string | null })
    .workingkeywords;
  const workingArticleSection = (record as unknown as { workingarticlesection?: string | null })
    .workingarticlesection;

  if (isDirty) {
    return {
      articleBody: workingBody ?? record.articleBody,
      headline: workingHeadline ?? record.headline,
      description: workingDescription ?? record.description,
      image: workingImage ?? record.image,
      keywords: workingKeywords ?? record.keywords,
      articleSection: workingArticleSection ?? record.articleSection,
    };
  }

  return {
    articleBody: record.articleBody,
    headline: record.headline,
    description: record.description,
    image: record.image,
    keywords: record.keywords,
    articleSection: record.articleSection,
  };
}

/**
 * Prepares record for publishing by copying working columns to published columns
 */
export function prepareForPublish(record: RecordType): Partial<RecordType> {
  const isDirty = record.is_dirty ?? false;
  
  if (!isDirty) {
    // No working draft, just return current published content
    return {};
  }

  // Copy working columns to published columns
  const workingBody = (record as unknown as { workingbody?: unknown })
    .workingbody as JSONContent | null | undefined;
  const workingHeadline = (record as unknown as { workingheadline?: string | null })
    .workingheadline;
  const workingDescription = (record as unknown as { workingdescription?: string | null })
    .workingdescription;
  const workingImage = (record as unknown as { workingimage?: string | null })
    .workingimage;
  const workingKeywords = (record as unknown as { workingkeywords?: string | null })
    .workingkeywords;
  const workingArticleSection = (record as unknown as { workingarticlesection?: string | null })
    .workingarticlesection;

  return {
    articleBody: workingBody ?? record.articleBody,
    headline: workingHeadline ?? record.headline,
    description: workingDescription ?? record.description,
    image: workingImage ?? record.image,
    keywords: workingKeywords ?? record.keywords,
    articleSection: workingArticleSection ?? record.articleSection,
    // Clear working columns and dirty flag
    is_dirty: false,
  } as Partial<RecordType>;
}

/**
 * Checks if record has unsaved working draft
 */
export function hasWorkingDraft(record: RecordType): boolean {
  return record.is_dirty ?? false;
}

