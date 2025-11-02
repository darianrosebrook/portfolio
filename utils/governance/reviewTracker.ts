/**
 * Governance utilities for tracking foundation page reviews
 * Flags pages needing review, checks alignment status, and manages deprecation lifecycle
 */

import type {
  ChangeLogEntry,
  FoundationPageMetadata,
  GovernanceMetadata,
} from '@/types/foundationContent';

/**
 * Check if page needs review based on review date and alignment status
 */
export function needsReview(governance: GovernanceMetadata): boolean {
  const now = new Date();
  const nextReview = new Date(governance.next_review_date);
  return now >= nextReview || governance.alignment_status === 'needs-review';
}

/**
 * Get all pages that need review
 */
export function getPagesNeedingReview(
  pages: FoundationPageMetadata[]
): FoundationPageMetadata[] {
  return pages.filter((page) => needsReview(page.governance));
}

/**
 * Check alignment status against current system version
 */
export function checkAlignmentStatus(
  currentVersion: string,
  pageVersion: string
): 'aligned' | 'needs-review' {
  return currentVersion === pageVersion ? 'aligned' : 'needs-review';
}

/**
 * Generate review dashboard data
 */
export function generateReviewDashboard(pages: FoundationPageMetadata[]): {
  needingReview: FoundationPageMetadata[];
  aligned: FoundationPageMetadata[];
  deprecated: FoundationPageMetadata[];
  upcomingReviews: Array<{
    page: FoundationPageMetadata;
    daysUntilReview: number;
  }>;
} {
  const now = new Date();
  const needingReview: FoundationPageMetadata[] = [];
  const aligned: FoundationPageMetadata[] = [];
  const deprecated: FoundationPageMetadata[] = [];
  const upcomingReviews: Array<{
    page: FoundationPageMetadata;
    daysUntilReview: number;
  }> = [];

  for (const page of pages) {
    if (page.governance.alignment_status === 'deprecated') {
      deprecated.push(page);
    } else if (needsReview(page.governance)) {
      needingReview.push(page);
    } else {
      aligned.push(page);
    }

    // Calculate days until next review
    const nextReview = new Date(page.governance.next_review_date);
    const daysUntilReview = Math.ceil(
      (nextReview.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilReview > 0 && daysUntilReview <= 30) {
      upcomingReviews.push({
        page,
        daysUntilReview,
      });
    }
  }

  // Sort upcoming reviews by days until review
  upcomingReviews.sort((a, b) => a.daysUntilReview - b.daysUntilReview);

  return {
    needingReview,
    aligned,
    deprecated,
    upcomingReviews,
  };
}

/**
 * Add system change entry to governance metadata
 */
export function addSystemChange(
  governance: GovernanceMetadata,
  change: ChangeLogEntry
): GovernanceMetadata {
  return {
    ...governance,
    system_changes: [...(governance.system_changes || []), change],
  };
}

/**
 * Update governance status after review
 */
export function updateGovernanceAfterReview(
  governance: GovernanceMetadata,
  newStatus: 'aligned' | 'needs-review',
  reviewDate: string = new Date().toISOString(),
  daysUntilNextReview: number = 90
): GovernanceMetadata {
  const nextReview = new Date(reviewDate);
  nextReview.setDate(nextReview.getDate() + daysUntilNextReview);

  return {
    ...governance,
    alignment_status: newStatus,
    last_review_date: reviewDate,
    next_review_date: nextReview.toISOString(),
  };
}
