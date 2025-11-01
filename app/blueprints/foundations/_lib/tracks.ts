/**
 * Role-specific track definitions and learning paths
 */

import type {
  TrackDefinition,
  TrackId,
  TrackPageMapping,
  TrackRole,
} from '@/types/tracks';

/**
 * Track definitions for Designer, Developer, and Cross-Functional roles
 */
export const trackDefinitions: Record<TrackId, TrackDefinition> = {
  designer: {
    id: 'designer',
    name: 'Designer Track',
    description:
      'For designers who want to understand how design systems work, how to use tokens effectively, and how to contribute to system evolution.',
    color: '#007bff',
    learningPath: [
      'philosophy',
      'tokens',
      'accessibility',
      'spacing',
      'component-architecture',
    ],
    focusAreas: [
      'Design token usage',
      'Accessibility standards',
      'Visual consistency',
      'Component design patterns',
    ],
    outcomes: [
      'Use design tokens effectively in design tools',
      'Understand accessibility requirements',
      'Design components that integrate with system architecture',
      'Contribute to design system evolution',
    ],
  },
  developer: {
    id: 'developer',
    name: 'Developer Track',
    description:
      'For developers who need to implement design systems, understand component architecture, and build scalable UI components.',
    color: '#28a745',
    learningPath: [
      'philosophy',
      'tokens',
      'component-architecture',
      'accessibility',
      'spacing',
    ],
    focusAreas: [
      'Component architecture',
      'Token implementation',
      'Accessibility in code',
      'System scalability',
    ],
    outcomes: [
      'Implement components following layered architecture',
      'Use design tokens in code',
      'Build accessible components',
      'Understand system governance',
    ],
  },
  'cross-functional': {
    id: 'cross-functional',
    name: 'Cross-Functional Track',
    description:
      'For product managers, design system maintainers, and those who work across design and engineering boundaries.',
    color: '#6f42c1',
    learningPath: [
      'philosophy',
      'tokens',
      'accessibility',
      'component-architecture',
      'spacing',
    ],
    focusAreas: [
      'Systems thinking',
      'Governance and processes',
      'Cross-team collaboration',
      'System metrics and health',
    ],
    outcomes: [
      'Understand design system philosophy',
      'Facilitate design-engineering collaboration',
      'Make informed decisions about system evolution',
      'Measure system success',
    ],
  },
};

/**
 * Map foundation pages to tracks and section relevance
 */
export const trackPageMappings: Record<string, TrackPageMapping> = {
  philosophy: {
    pageSlug: 'philosophy',
    trackRelevance: ['designer', 'developer', 'cross-functional'],
    sectionMappings: [
      {
        sectionId: 'why-matters',
        relevance: ['design', 'engineering', 'product'],
        importance: 'high',
      },
      {
        sectionId: 'core-concepts',
        relevance: ['design', 'engineering', 'product'],
        importance: 'high',
      },
      {
        sectionId: 'system-roles',
        relevance: ['product'],
        importance: 'high',
      },
      {
        sectionId: 'design-code-interplay',
        relevance: ['design', 'engineering'],
        importance: 'high',
      },
    ],
  },
  tokens: {
    pageSlug: 'tokens',
    trackRelevance: ['designer', 'developer', 'cross-functional'],
    sectionMappings: [
      {
        sectionId: 'why-matters',
        relevance: ['design', 'engineering'],
        importance: 'high',
      },
      {
        sectionId: 'core-concepts',
        relevance: ['design', 'engineering'],
        importance: 'high',
      },
      {
        sectionId: 'design-code-interplay',
        relevance: ['design', 'engineering'],
        importance: 'high',
      },
    ],
  },
  accessibility: {
    pageSlug: 'accessibility',
    trackRelevance: ['designer', 'developer', 'cross-functional'],
    sectionMappings: [
      {
        sectionId: 'why-matters',
        relevance: ['design', 'engineering', 'a11y'],
        importance: 'high',
      },
      {
        sectionId: 'core-concepts',
        relevance: ['design', 'engineering', 'a11y'],
        importance: 'high',
      },
      {
        sectionId: 'applied-example',
        relevance: ['engineering'],
        importance: 'medium',
      },
    ],
  },
  spacing: {
    pageSlug: 'spacing',
    trackRelevance: ['designer', 'developer'],
    sectionMappings: [
      {
        sectionId: 'why-matters',
        relevance: ['design'],
        importance: 'high',
      },
      {
        sectionId: 'core-concepts',
        relevance: ['design', 'engineering'],
        importance: 'high',
      },
    ],
  },
  'component-architecture': {
    pageSlug: 'component-architecture',
    trackRelevance: ['designer', 'developer', 'cross-functional'],
    sectionMappings: [
      {
        sectionId: 'why-matters',
        relevance: ['engineering', 'product'],
        importance: 'high',
      },
      {
        sectionId: 'core-concepts',
        relevance: ['engineering'],
        importance: 'high',
      },
      {
        sectionId: 'design-code-interplay',
        relevance: ['design', 'engineering'],
        importance: 'high',
      },
    ],
  },
};

/**
 * Get track definition by ID
 */
export function getTrack(id: TrackId): TrackDefinition {
  return trackDefinitions[id];
}

/**
 * Get all tracks
 */
export function getAllTracks(): TrackDefinition[] {
  return Object.values(trackDefinitions);
}

/**
 * Get track relevance for a foundation page
 */
export function getPageTrackRelevance(
  pageSlug: string
): TrackId[] {
  const mapping = trackPageMappings[pageSlug];
  return mapping?.trackRelevance || [];
}

/**
 * Get section relevance for a track
 */
export function getSectionRelevance(
  pageSlug: string,
  sectionId: string,
  track: TrackId
): 'high' | 'medium' | 'low' | null {
  const mapping = trackPageMappings[pageSlug];
  if (!mapping?.sectionMappings) return null;

  const sectionMapping = mapping.sectionMappings.find(
    (m) => m.sectionId === sectionId
  );
  if (!sectionMapping) return null;

  // Map track to roles
  const trackRoles: Record<TrackId, TrackRole[]> = {
    designer: ['design'],
    developer: ['engineering'],
    'cross-functional': ['design', 'engineering', 'product'],
  };

  const roles = trackRoles[track];
  const isRelevant = sectionMapping.relevance.some((role) =>
    roles.includes(role)
  );

  return isRelevant ? sectionMapping.importance : null;
}

/**
 * Get learning path for a track
 */
export function getTrackLearningPath(track: TrackId): string[] {
  const trackDef = getTrack(track);
  return trackDef.learningPath;
}

/**
 * Get next page in track learning path
 */
export function getNextPageInTrack(
  currentPageSlug: string,
  track: TrackId
): string | null {
  const path = getTrackLearningPath(track);
  const currentIndex = path.indexOf(currentPageSlug);

  if (currentIndex === -1 || currentIndex === path.length - 1) {
    return null;
  }

  return path[currentIndex + 1];
}

/**
 * Get previous page in track learning path
 */
export function getPreviousPageInTrack(
  currentPageSlug: string,
  track: TrackId
): string | null {
  const path = getTrackLearningPath(track);
  const currentIndex = path.indexOf(currentPageSlug);

  if (currentIndex <= 0) {
    return null;
  }

  return path[currentIndex - 1];
}

/**
 * Get track progress for a user
 */
export function getTrackProgress(
  track: TrackId,
  completedPages: string[]
): {
  completed: number;
  total: number;
  percentage: number;
  nextPage: string | null;
  completedPages: string[];
} {
  const path = getTrackLearningPath(track);
  const completed = path.filter((slug) => completedPages.includes(slug));
  const nextPage = path.find((slug) => !completedPages.includes(slug)) || null;

  return {
    completed: completed.length,
    total: path.length,
    percentage: Math.round((completed.length / path.length) * 100),
    nextPage,
    completedPages: completed,
  };
}

