'use client';

import type { FoundationPageContent } from '@/types/foundationContent';
import { generateFoundationLDJson } from '@/utils/ldjson';
import { EducationPageTemplate } from '../_components/EducationPageTemplate';

interface FoundationPageProps {
  content: FoundationPageContent;
}

/**
 * Client component wrapper for foundation pages
 * Handles JSON-LD generation
 * Note: JSON-LD schemas are returned as an array to support multiple schemas
 */
export function FoundationPage({ content }: FoundationPageProps) {
  const canonical = content.metadata.canonicalUrl;
  const jsonLdSchemas = generateFoundationLDJson({
    metadata: content.metadata,
    canonical,
  });

  // JSON-LD can be an array of schemas or a single schema
  // EducationPageTemplate will handle rendering multiple schemas
  return <EducationPageTemplate content={content} jsonLd={jsonLdSchemas} />;
}
