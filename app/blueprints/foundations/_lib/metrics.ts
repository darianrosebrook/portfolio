/**
 * Utilities for metrics instrumentation
 * Tracks education impact on system health
 */

/**
 * Track foundation page view
 */
export function trackFoundationPageView(slug: string): void {
  if (typeof window === 'undefined') return;

  // Track page view
  const event = {
    event: 'foundation_page_view',
    slug,
    timestamp: new Date().toISOString(),
    path: window.location.pathname,
  };

  // In production, send to analytics service
  // For now, log to console or localStorage
  if (process.env.NODE_ENV === 'development') {
    console.log('Foundation page view:', event);
  }

  // Store in localStorage for analytics
  try {
    const views = JSON.parse(localStorage.getItem('foundation_views') || '[]');
    views.push(event);
    // Keep only last 100 views
    const recentViews = views.slice(-100);
    localStorage.setItem('foundation_views', JSON.stringify(recentViews));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Track cross-reference click
 */
export function trackCrossReferenceClick(
  fromSlug: string,
  toSlug: string,
  type: 'concept' | 'component' | 'glossary'
): void {
  if (typeof window === 'undefined') return;

  const event = {
    event: 'cross_reference_click',
    fromSlug,
    toSlug,
    type,
    timestamp: new Date().toISOString(),
  };

  if (process.env.NODE_ENV === 'development') {
    console.log('Cross-reference click:', event);
  }

  try {
    const clicks = JSON.parse(
      localStorage.getItem('foundation_cross_refs') || '[]'
    );
    clicks.push(event);
    const recentClicks = clicks.slice(-100);
    localStorage.setItem('foundation_cross_refs', JSON.stringify(recentClicks));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Track reading progress
 */
export function trackReadingProgress(slug: string, progress: number): void {
  if (typeof window === 'undefined') return;

  try {
    const progressData = JSON.parse(
      localStorage.getItem('foundation_progress') || '{}'
    );
    progressData[slug] = {
      progress,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem('foundation_progress', JSON.stringify(progressData));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Track assessment completion
 */
export function trackAssessmentCompletion(
  slug: string,
  assessmentId: string,
  completed: boolean
): void {
  if (typeof window === 'undefined') return;

  try {
    const assessments = JSON.parse(
      localStorage.getItem('foundation_assessments') || '{}'
    );
    if (!assessments[slug]) {
      assessments[slug] = {};
    }
    assessments[slug][assessmentId] = completed;
    localStorage.setItem('foundation_assessments', JSON.stringify(assessments));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Get reading progress for a page
 */
export function getReadingProgress(slug: string): number {
  if (typeof window === 'undefined') return 0;

  try {
    const progressData = JSON.parse(
      localStorage.getItem('foundation_progress') || '{}'
    );
    return progressData[slug]?.progress || 0;
  } catch {
    return 0;
  }
}

/**
 * Get completion status for all pages
 */
export function getCompletionStatus(): Record<string, boolean> {
  if (typeof window === 'undefined') return {};

  try {
    const progressData = JSON.parse(
      localStorage.getItem('foundation_progress') || '{}'
    );
    const status: Record<string, boolean> = {};

    Object.keys(progressData).forEach((slug) => {
      status[slug] = progressData[slug].progress >= 90; // 90% = complete
    });

    return status;
  } catch {
    return {};
  }
}

/**
 * Analyze metrics for dashboard
 */
export function analyzeMetrics(): {
  totalViews: number;
  uniquePages: number;
  averageProgress: number;
  completionRate: number;
  topReferencedPages: Array<{ slug: string; count: number }>;
} {
  if (typeof window === 'undefined') {
    return {
      totalViews: 0,
      uniquePages: 0,
      averageProgress: 0,
      completionRate: 0,
      topReferencedPages: [],
    };
  }

  try {
    const views = JSON.parse(localStorage.getItem('foundation_views') || '[]');
    const progressData = JSON.parse(
      localStorage.getItem('foundation_progress') || '{}'
    );
    const crossRefs = JSON.parse(
      localStorage.getItem('foundation_cross_refs') || '[]'
    );

    // Count views per page
    const viewCounts: Record<string, number> = {};
    views.forEach((view: { slug: string }) => {
      viewCounts[view.slug] = (viewCounts[view.slug] || 0) + 1;
    });

    // Count cross-references
    const refCounts: Record<string, number> = {};
    crossRefs.forEach((ref: { toSlug: string }) => {
      refCounts[ref.toSlug] = (refCounts[ref.toSlug] || 0) + 1;
    });

    // Calculate average progress
    const slugs = Object.keys(progressData);
    const averageProgress =
      slugs.length > 0
        ? slugs.reduce((sum, slug) => sum + progressData[slug].progress, 0) /
          slugs.length
        : 0;

    // Calculate completion rate
    const completed = slugs.filter(
      (slug) => progressData[slug].progress >= 90
    ).length;
    const completionRate = slugs.length > 0 ? completed / slugs.length : 0;

    // Top referenced pages
    const topReferencedPages = Object.entries(refCounts)
      .map(([slug, count]) => ({ slug, count: count as number }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalViews: views.length,
      uniquePages: Object.keys(viewCounts).length,
      averageProgress,
      completionRate,
      topReferencedPages,
    };
  } catch {
    return {
      totalViews: 0,
      uniquePages: 0,
      averageProgress: 0,
      completionRate: 0,
      topReferencedPages: [],
    };
  }
}
