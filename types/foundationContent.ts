/**
 * Type definitions for foundation education pages
 * Supports learning progression, governance, and content structure
 */

export type LearningLevel = 'foundation' | 'intermediate' | 'advanced';

export type RoleRelevance =
  | 'design'
  | 'engineering'
  | 'a11y'
  | 'governance'
  | 'content';

export type AlignmentStatus = 'aligned' | 'needs-review' | 'deprecated';

export interface ChangeLogEntry {
  date: string;
  version: string;
  description: string;
  type: 'breaking' | 'feature' | 'update' | 'deprecation';
}

export interface LearningMetadata {
  learning_level: LearningLevel;
  role_relevance: RoleRelevance[];
  prerequisites: string[]; // slugs of required foundation pages
  next_units: string[]; // recommended next pages
  assessment_required: boolean;
  estimated_reading_time: number; // minutes
}

export interface GovernanceMetadata {
  canonical_version: string; // e.g., "System v4", "Token Architecture v3"
  alignment_status: AlignmentStatus;
  last_review_date: string; // ISO date string
  next_review_date: string; // ISO date string (auto-calculated, e.g., +90 days)
  system_changes?: ChangeLogEntry[];
}

export interface AuthorMetadata {
  name: string;
  role: string;
  expertise: string[];
  profileUrl?: string;
  imageUrl?: string;
}

export interface FoundationPageMetadata {
  title: string;
  description: string;
  slug: string;
  canonicalUrl: string;
  published_at: string;
  modified_at?: string;
  image: string;
  keywords?: string;
  learning: LearningMetadata;
  governance: GovernanceMetadata;
  author: AuthorMetadata;
}

export type SectionType =
  | 'meta-header'
  | 'alignment-notice'
  | 'why-matters'
  | 'core-concepts'
  | 'system-roles'
  | 'design-code-interplay'
  | 'applied-example'
  | 'constraints-tradeoffs'
  | 'verification-checklist'
  | 'cross-references'
  | 'assessment-prompt'
  | 'additional-resources';

import type { ReactNode } from 'react';

export interface FoundationSection {
  type: SectionType;
  id: string;
  title?: string;
  content: ReactNode;
  order: number;
}

export interface ConceptLink {
  slug: string;
  title: string;
  description?: string;
  type: 'foundation' | 'component' | 'pattern' | 'glossary';
}

export interface ComponentReference {
  slug: string;
  component: string;
  description: string;
  relatedConcepts?: string[];
}

export interface CrossReference {
  concepts: ConceptLink[];
  components: ComponentReference[];
  glossary?: string[]; // glossary term IDs
}

export interface VerificationChecklistItem {
  id: string;
  label: string;
  description?: string;
  required: boolean;
}

export interface AssessmentPrompt {
  question: string;
  type: 'reflection' | 'application' | 'multiple-choice';
  options?: string[];
  correctAnswer?: string | number;
}

export interface FoundationPageContent {
  metadata: FoundationPageMetadata;
  sections: FoundationSection[];
  crossReferences: CrossReference;
  verificationChecklist: VerificationChecklistItem[];
  assessmentPrompts: AssessmentPrompt[];
}
