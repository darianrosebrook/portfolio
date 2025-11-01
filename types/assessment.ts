/**
 * Types for assessment framework
 */

export type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced';

export type QuestionType =
  | 'multiple-choice'
  | 'multiple-select'
  | 'reflection'
  | 'application'
  | 'code-review';

export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  question: string;
  description?: string;
  options?: string[];
  correctAnswers?: string[]; // For multiple-choice/select
  rubric: {
    beginner: string;
    intermediate: string;
    advanced: string;
  };
  points: {
    beginner: number;
    intermediate: number;
    advanced: number;
  };
}

export interface AssessmentCriteria {
  id: string;
  category: string;
  description: string;
  beginner: string;
  intermediate: string;
  advanced: string;
  weight: number; // 0-1, how much this criteria contributes to overall score
}

export interface AssessmentRubric {
  id: string;
  foundationPageSlug: string;
  title: string;
  description: string;
  criteria: AssessmentCriteria[];
  questions: AssessmentQuestion[];
  thresholds: {
    beginner: number; // Minimum score (0-100) to achieve beginner
    intermediate: number; // Minimum score to achieve intermediate
    advanced: number; // Minimum score to achieve advanced
  };
}

export interface AssessmentResponse {
  questionId: string;
  answer: string | string[];
  reflection?: string; // For reflection/application questions
}

export interface AssessmentResult {
  assessmentId: string;
  foundationPageSlug: string;
  completedAt: string;
  responses: AssessmentResponse[];
  scores: {
    overall: number;
    byCategory: Record<string, number>;
    byQuestion: Record<string, number>;
  };
  proficiencyLevel: ProficiencyLevel;
  feedback: {
    strengths: string[];
    improvements: string[];
    nextSteps: string[];
  };
}

export interface AssessmentProgress {
  foundationPageSlug: string;
  completedAssessments: Record<string, AssessmentResult>;
  currentProficiency: ProficiencyLevel | null;
  attempts: number;
  lastAttempt: string | null;
}
