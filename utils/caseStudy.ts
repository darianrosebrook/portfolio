import { processCaseStudyContent } from '@/utils/tiptap/htmlGeneration';
import type { JSONContent } from '@tiptap/react';

/**
 * Process case study content by removing the first h1 and first image,
 * then converting to HTML.
 *
 * Delegates to the registry-based pipeline so case studies render with the
 * same extension set as articles (including content links, tables, etc.)
 * instead of a divergent local extension list.
 */
export function getCaseStudyContent(data: JSONContent): { html: string } {
  if (!data || !data.content) {
    return { html: '' };
  }

  return processCaseStudyContent(data);
}
