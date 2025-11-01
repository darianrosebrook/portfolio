/**
 * Helper function to create foundation page content structure
 * Simplifies the process of creating FoundationPageContent objects
 */

import type {
  FoundationPageContent,
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';

export function createFoundationContent(
  metadata: FoundationPageMetadata,
  sections: FoundationSection[]
): FoundationPageContent {
  // Sort sections by order
  const sortedSections = [...sections].sort((a, b) => a.order - b.order);

  return {
    metadata,
    sections: sortedSections,
    crossReferences: {
      concepts: [],
      components: [],
      glossary: [],
    },
    verificationChecklist: [],
    assessmentPrompts: [],
  };
}
