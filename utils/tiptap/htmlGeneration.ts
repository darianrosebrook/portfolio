/**
 * Unified TipTap HTML Generation Utilities
 * 
 * Provides consistent HTML generation for articles and case studies
 * using the centralized extension registry.
 * 
 * @author @darianrosebrook
 */

import type { JSONContent } from '@tiptap/react';
import { generateHTML } from '@tiptap/html';
import { createServerExtensions } from '@/ui/modules/Tiptap/extensionsRegistry';

/**
 * Validates JSONContent structure
 */
export function isValidJSONContent(
  content: unknown
): content is JSONContent {
  if (!content || typeof content !== 'object') {
    return false;
  }

  const doc = content as Record<string, unknown>;

  // Must have type 'doc'
  if (doc.type !== 'doc') {
    return false;
  }

  // Content should be an array (even if empty)
  if (doc.content !== undefined && !Array.isArray(doc.content)) {
    return false;
  }

  return true;
}

/**
 * Normalizes JSONContent to ensure it has the correct structure
 */
export function normalizeJSONContent(
  content: unknown
): JSONContent {
  if (isValidJSONContent(content)) {
    return content;
  }

  // If content is null/undefined or invalid, return empty doc
  return {
    type: 'doc',
    content: [],
  };
}

/**
 * Removes the first heading of a specific level from JSONContent
 */
export function removeFirstHeading(
  content: JSONContent,
  level: number = 1
): JSONContent {
  if (!content.content || !Array.isArray(content.content)) {
    return content;
  }

  const contentArray = [...content.content];
  const firstH1Index = contentArray.findIndex(
    (node) => node.type === 'heading' && node.attrs?.level === level
  );

  if (firstH1Index !== -1) {
    contentArray.splice(firstH1Index, 1);
  }

  return {
    ...content,
    content: contentArray,
  };
}

/**
 * Removes the first image from JSONContent
 */
export function removeFirstImage(content: JSONContent): JSONContent {
  if (!content.content || !Array.isArray(content.content)) {
    return content;
  }

  const contentArray = [...content.content];
  const firstImageIndex = contentArray.findIndex(
    (node) => node.type === 'image'
  );

  if (firstImageIndex !== -1) {
    contentArray.splice(firstImageIndex, 1);
  }

  return {
    ...content,
    content: contentArray,
  };
}

/**
 * Extracts the first heading of a specific level from JSONContent
 */
export function extractFirstHeading(
  content: JSONContent,
  level: number = 1
): string | null {
  if (!content.content || !Array.isArray(content.content)) {
    return null;
  }

  const headingNode = content.content.find(
    (node) => node.type === 'heading' && node.attrs?.level === level
  );

  if (!headingNode || !headingNode.content || !Array.isArray(headingNode.content)) {
    return null;
  }

  // Extract text from heading content
  const textParts: string[] = [];
  headingNode.content.forEach((node) => {
    if (node.type === 'text' && node.text) {
      textParts.push(node.text);
    }
  });

  return textParts.join('') || null;
}

/**
 * Extracts the first image src from JSONContent
 */
export function extractFirstImage(content: JSONContent): string | null {
  if (!content.content || !Array.isArray(content.content)) {
    return null;
  }

  const imageNode = content.content.find((node) => node.type === 'image');

  if (!imageNode || !imageNode.attrs) {
    return null;
  }

  const src = (imageNode.attrs as Record<string, unknown>).src as string | undefined;
  return src ?? null;
}

/**
 * Generates HTML from JSONContent using server-safe extensions
 */
export function generateArticleHTML(content: unknown): string {
  const normalized = normalizeJSONContent(content);
  const extensions = createServerExtensions();

  try {
    return generateHTML(normalized, extensions);
  } catch (error) {
    console.error('Failed to generate HTML from JSONContent:', error);
    return '';
  }
}

/**
 * Processes article content: removes first h1 and image, generates HTML
 * Returns both the processed HTML and extracted metadata
 */
export interface ArticleContentResult {
  html: string;
  h1Text: string | null;
  imageSrc: string | null;
}

export function processArticleContent(
  content: unknown
): ArticleContentResult {
  const normalized = normalizeJSONContent(content);

  // Extract metadata before removing nodes
  const h1Text = extractFirstHeading(normalized, 1);
  const imageSrc = extractFirstImage(normalized);

  // Remove first h1 and image for rendering
  let processed = removeFirstHeading(normalized, 1);
  processed = removeFirstImage(processed);

  const html = generateArticleHTML(processed);

  return {
    html,
    h1Text,
    imageSrc,
  };
}

/**
 * Processes case study content: removes first h1 and image, generates HTML
 */
export function processCaseStudyContent(
  content: unknown
): { html: string } {
  const normalized = normalizeJSONContent(content);

  // Remove first h1 and image for rendering
  let processed = removeFirstHeading(normalized, 1);
  processed = removeFirstImage(processed);

  const html = generateArticleHTML(processed);

  return { html };
}

