/**
 * Types for role-specific learning tracks
 */

export type TrackId = 'designer' | 'developer' | 'cross-functional';

export type TrackRole = 'design' | 'engineering' | 'a11y' | 'product';

export interface TrackDefinition {
  id: TrackId;
  name: string;
  description: string;
  icon?: string;
  color?: string;
  learningPath: string[]; // Ordered list of foundation page slugs
  focusAreas: string[];
  outcomes: string[];
}

export interface TrackSectionMapping {
  sectionId: string;
  relevance: TrackRole[];
  importance: 'high' | 'medium' | 'low';
}

export interface TrackPageMapping {
  pageSlug: string;
  trackRelevance: TrackId[];
  sectionMappings?: TrackSectionMapping[];
}

