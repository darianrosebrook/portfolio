/**
 * Utilities for building conceptual graph and cross-references
 * Helps establish relationships between foundation concepts, components, and glossary terms
 */

import type {
  ConceptLink,
  ComponentReference,
  CrossReference,
  FoundationPageMetadata,
} from '@/types/foundationContent';
import { glossaryItems, type GlossaryItem } from '@/app/heroes/glossaryItems';
import type { ComponentItem } from '@/app/blueprints/component-standards/_lib/componentsData';

/**
 * Find glossary items by ID or name
 */
export function findGlossaryItem(idOrName: string): GlossaryItem | undefined {
  return glossaryItems.find(
    (item) =>
      item.id === idOrName || item.name.toLowerCase() === idOrName.toLowerCase()
  );
}

/**
 * Get glossary items referenced in cross-references
 */
export function getGlossaryItemsForReferences(
  glossaryIds: string[]
): GlossaryItem[] {
  return glossaryIds
    .map((id) => findGlossaryItem(id))
    .filter((item): item is GlossaryItem => item !== undefined);
}

/**
 * Build concept links from foundation page metadata
 */
export function buildConceptLinks(
  pages: FoundationPageMetadata[],
  excludeSlug?: string
): ConceptLink[] {
  return pages
    .filter((page) => page.slug !== excludeSlug)
    .map((page) => ({
      slug: page.slug,
      title: page.title,
      description: page.description,
      type: 'foundation' as const,
    }));
}

/**
 * Build component references from component data
 */
export function buildComponentReferences(
  components: ComponentItem[],
  relatedSlugs: string[] = []
): ComponentReference[] {
  return components
    .filter(
      (comp) => relatedSlugs.length === 0 || relatedSlugs.includes(comp.slug)
    )
    .map((comp) => ({
      slug: comp.slug,
      component: comp.component,
      description: comp.description,
      relatedConcepts: [], // Can be populated based on component metadata
    }));
}

/**
 * Find related foundation pages based on prerequisites and next_units
 */
export function findRelatedFoundationPages(
  currentSlug: string,
  allPages: FoundationPageMetadata[]
): ConceptLink[] {
  const currentPage = allPages.find((p) => p.slug === currentSlug);
  if (!currentPage) return [];

  const related: ConceptLink[] = [];

  // Add prerequisite pages
  currentPage.learning.prerequisites.forEach((slug) => {
    const page = allPages.find((p) => p.slug === slug);
    if (page) {
      related.push({
        slug: page.slug,
        title: page.title,
        description: `Prerequisite: ${page.description}`,
        type: 'foundation',
      });
    }
  });

  // Add next unit pages
  currentPage.learning.next_units.forEach((slug) => {
    const page = allPages.find((p) => p.slug === slug);
    if (page && !related.find((r) => r.slug === slug)) {
      related.push({
        slug: page.slug,
        title: page.title,
        description: `Continue learning: ${page.description}`,
        type: 'foundation',
      });
    }
  });

  // Add pages with overlapping role relevance
  const currentRoles = currentPage.learning.role_relevance;
  allPages
    .filter(
      (p) =>
        p.slug !== currentSlug &&
        p.learning.role_relevance.some((role) => currentRoles.includes(role)) &&
        !related.find((r) => r.slug === p.slug)
    )
    .forEach((page) => {
      related.push({
        slug: page.slug,
        title: page.title,
        description: page.description,
        type: 'foundation',
      });
    });

  return related;
}

/**
 * Build conceptual dependency graph
 * Returns pages that depend on the current page and pages the current page depends on
 */
export function buildDependencyGraph(
  currentSlug: string,
  allPages: FoundationPageMetadata[]
): {
  dependsOn: FoundationPageMetadata[];
  dependedOnBy: FoundationPageMetadata[];
} {
  const currentPage = allPages.find((p) => p.slug === currentSlug);
  if (!currentPage) {
    return { dependsOn: [], dependedOnBy: [] };
  }

  // Pages this page depends on (prerequisites)
  const dependsOn = currentPage.learning.prerequisites
    .map((slug) => allPages.find((p) => p.slug === slug))
    .filter((p): p is FoundationPageMetadata => p !== undefined);

  // Pages that depend on this page (where this is a prerequisite)
  const dependedOnBy = allPages.filter((p) =>
    p.learning.prerequisites.includes(currentSlug)
  );

  return { dependsOn, dependedOnBy };
}

/**
 * Extract glossary terms from content
 * Simple keyword matching - can be enhanced with NLP
 */
export function extractGlossaryTerms(text: string): string[] {
  const foundTerms: string[] = [];
  const lowerText = text.toLowerCase();

  glossaryItems.forEach((item) => {
    // Match exact term name (case-insensitive)
    const termRegex = new RegExp(`\\b${item.name.toLowerCase()}\\b`, 'i');
    if (termRegex.test(lowerText)) {
      foundTerms.push(item.id);
    }
  });

  return [...new Set(foundTerms)]; // Remove duplicates
}

/**
 * Build cross-references from foundation page content
 */
export function buildCrossReferences(
  currentSlug: string,
  allPages: FoundationPageMetadata[],
  components: ComponentItem[] = [],
  contentText?: string
): CrossReference {
  const concepts = findRelatedFoundationPages(currentSlug, allPages);

  // Extract glossary terms from content if provided
  const glossaryIds = contentText ? extractGlossaryTerms(contentText) : [];

  return {
    concepts,
    components: [], // Can be populated based on component relationships
    glossary: glossaryIds,
  };
}
