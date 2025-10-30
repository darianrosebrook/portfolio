import type { JSONContent } from '@tiptap/react';
import { processCaseStudyContent } from '@/utils/tiptap/htmlGeneration';

/**
 * Process case study content by removing the first h1 and first image,
 * then converting to HTML
 *
 * @deprecated Use processCaseStudyContent from '@/utils/tiptap/htmlGeneration' directly
 */
export function getCaseStudyContent(data: JSONContent | unknown): {
  html: string;
} {
  return processCaseStudyContent(data);
}
