/**
 * Utilities for collecting and managing feedback
 */

import type { FeedbackData, FeedbackType } from '../_components/FeedbackForm';

/**
 * Get all feedback submissions
 */
export function getAllFeedback(): FeedbackData[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem('foundation_feedback');
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Get feedback for a specific page
 */
export function getFeedbackForPage(pageSlug: string): FeedbackData[] {
  return getAllFeedback().filter((feedback) => feedback.page === pageSlug);
}

/**
 * Get feedback by type
 */
export function getFeedbackByType(type: FeedbackType): FeedbackData[] {
  return getAllFeedback().filter((feedback) => feedback.type === type);
}

/**
 * Analyze feedback trends
 */
export function analyzeFeedback(): {
  total: number;
  byType: Record<FeedbackType, number>;
  byPage: Record<string, number>;
  averageRating: number;
  recentFeedback: FeedbackData[];
} {
  const allFeedback = getAllFeedback();

  const byType: Record<FeedbackType, number> = {
    content: 0,
    format: 0,
    structure: 0,
    navigation: 0,
    other: 0,
  };

  const byPage: Record<string, number> = {};
  let totalRating = 0;
  let ratingCount = 0;

  allFeedback.forEach((feedback) => {
    byType[feedback.type] = (byType[feedback.type] || 0) + 1;
    byPage[feedback.page] = (byPage[feedback.page] || 0) + 1;

    if (feedback.rating) {
      totalRating += feedback.rating;
      ratingCount++;
    }
  });

  const recentFeedback = allFeedback
    .slice()
    .sort(
      (a, b) =>
        new Date((b as any).timestamp || 0).getTime() -
        new Date((a as any).timestamp || 0).getTime()
    )
    .slice(0, 10);

  return {
    total: allFeedback.length,
    byType,
    byPage,
    averageRating: ratingCount > 0 ? totalRating / ratingCount : 0,
    recentFeedback,
  };
}

/**
 * Export feedback as JSON
 */
export function exportFeedback(): string {
  return JSON.stringify(getAllFeedback(), null, 2);
}

