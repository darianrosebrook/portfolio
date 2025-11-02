/**
 * Utilities for learning progression tracking
 * Handles user progression, role-based filtering, and prerequisite checking
 */

import type {
  FoundationPageMetadata,
  RoleRelevance,
} from '@/types/foundationContent';

/**
 * Check if user has completed prerequisites
 */
export function hasCompletedPrerequisites(
  prerequisites: string[],
  completedPages: string[]
): boolean {
  return prerequisites.every((prereq) => completedPages.includes(prereq));
}

/**
 * Filter foundation pages by role relevance
 */
export function filterByRole(
  pages: FoundationPageMetadata[],
  role: RoleRelevance
): FoundationPageMetadata[] {
  return pages.filter((page) => page.learning.role_relevance.includes(role));
}

/**
 * Get recommended next pages based on completed pages
 */
export function getRecommendedNext(
  completedPages: string[],
  allPages: FoundationPageMetadata[]
): FoundationPageMetadata[] {
  return allPages.filter((page) => {
    // Skip if already completed
    if (completedPages.includes(page.slug)) {
      return false;
    }

    // Include if prerequisites are met
    return hasCompletedPrerequisites(
      page.learning.prerequisites,
      completedPages
    );
  });
}

/**
 * Calculate learning progress percentage
 */
export function calculateProgress(
  completedPages: string[],
  totalPages: number
): number {
  if (totalPages === 0) return 0;
  return Math.round((completedPages.length / totalPages) * 100);
}

/**
 * Get learning path recommendations
 * Returns pages in optimal learning order
 */
export function getLearningPath(
  pages: FoundationPageMetadata[],
  role?: RoleRelevance
): FoundationPageMetadata[] {
  const filteredPages = role ? filterByRole(pages, role) : pages;

  // Sort by learning level first (foundation -> intermediate -> advanced)
  const levelOrder: Record<string, number> = {
    foundation: 0,
    intermediate: 1,
    advanced: 2,
  };

  filteredPages.sort((a, b) => {
    const levelDiff =
      levelOrder[a.learning.learning_level] -
      levelOrder[b.learning.learning_level];
    if (levelDiff !== 0) return levelDiff;

    // Then by prerequisite count (fewer prerequisites first)
    return a.learning.prerequisites.length - b.learning.prerequisites.length;
  });

  return filteredPages;
}

/**
 * Validate learning path completeness
 * Checks if all prerequisites are satisfied in the path
 */
export function validateLearningPath(path: FoundationPageMetadata[]): {
  valid: boolean;
  issues: Array<{ page: string; missingPrereqs: string[] }>;
} {
  const completedSlugs = new Set<string>();
  const issues: Array<{ page: string; missingPrereqs: string[] }> = [];

  for (const page of path) {
    const missingPrereqs = page.learning.prerequisites.filter(
      (prereq) => !completedSlugs.has(prereq)
    );

    if (missingPrereqs.length > 0) {
      issues.push({
        page: page.slug,
        missingPrereqs,
      });
    }

    completedSlugs.add(page.slug);
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
