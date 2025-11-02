/**
 * Utility to enhance component references with foundation relationships
 * Maps components to related foundation concepts based on layer and category
 */

import type { ComponentReference } from '@/types/foundationContent';
import type { ComponentItem } from '@/app/blueprints/component-standards/_lib/componentsData';

/**
 * Map component layers to foundation concepts
 */
const layerToFoundationMap: Record<string, string[]> = {
  primitives: ['component-architecture', 'tokens', 'accessibility'],
  compounds: ['component-architecture', 'tokens', 'spacing'],
  composers: ['component-architecture', 'accessibility', 'spacing'],
};

/**
 * Map component categories to foundation concepts
 */
const categoryToFoundationMap: Record<string, string[]> = {
  form: ['component-architecture', 'accessibility'],
  navigation: ['component-architecture', 'accessibility', 'spacing'],
  feedback: ['component-architecture', 'tokens', 'accessibility'],
  layout: ['spacing', 'component-architecture'],
  data: ['component-architecture', 'tokens'],
};

/**
 * Build component references with related foundation concepts
 */
export function buildComponentReferencesWithConcepts(
  components: ComponentItem[],
  relatedSlugs: string[] = []
): ComponentReference[] {
  return components
    .filter(
      (comp) => relatedSlugs.length === 0 || relatedSlugs.includes(comp.slug)
    )
    .map((comp) => {
      const relatedConcepts: string[] = [];

      // Add concepts based on layer
      if (comp.layer && layerToFoundationMap[comp.layer]) {
        relatedConcepts.push(...layerToFoundationMap[comp.layer]);
      }

      // Add concepts based on category
      if (comp.category && categoryToFoundationMap[comp.category]) {
        relatedConcepts.push(...categoryToFoundationMap[comp.category]);
      }

      // Always include component-architecture if not already present
      if (!relatedConcepts.includes('component-architecture')) {
        relatedConcepts.push('component-architecture');
      }

      // Remove duplicates
      const uniqueConcepts = [...new Set(relatedConcepts)];

      return {
        slug: comp.slug,
        component: comp.component,
        description: comp.description,
        relatedConcepts: uniqueConcepts,
      };
    });
}
