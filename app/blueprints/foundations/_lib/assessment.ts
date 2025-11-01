/**
 * Assessment utilities and scoring logic
 */

import type {
  AssessmentQuestion,
  AssessmentResponse,
  AssessmentResult,
  AssessmentRubric,
  ProficiencyLevel,
} from '@/types/assessment';

/**
 * Calculate score for a single question
 */
export function calculateQuestionScore(
  question: AssessmentQuestion,
  response: AssessmentResponse,
  targetLevel: ProficiencyLevel
): number {
  if (
    question.type === 'multiple-choice' ||
    question.type === 'multiple-select'
  ) {
    if (!question.correctAnswers || !response.answer) return 0;

    const correctAnswers = Array.isArray(question.correctAnswers)
      ? question.correctAnswers
      : [question.correctAnswers];
    const userAnswers = Array.isArray(response.answer)
      ? response.answer
      : [response.answer];

    // Check if all correct answers are selected
    const allCorrect = correctAnswers.every((answer) =>
      userAnswers.includes(answer)
    );
    const noExtra = userAnswers.every((answer) =>
      correctAnswers.includes(answer)
    );

    if (allCorrect && noExtra) {
      return question.points[targetLevel];
    }

    // Partial credit for some correct answers
    const correctCount = userAnswers.filter((answer) =>
      correctAnswers.includes(answer)
    ).length;
    const partialScore =
      (correctCount / correctAnswers.length) * question.points[targetLevel];

    return Math.round(partialScore);
  }

  // For reflection/application questions, score based on length and quality
  if (question.type === 'reflection' || question.type === 'application') {
    if (!response.reflection || response.reflection.trim().length === 0) {
      return 0;
    }

    const wordCount = response.reflection.split(/\s+/).length;
    const minWords =
      targetLevel === 'beginner'
        ? 20
        : targetLevel === 'intermediate'
          ? 50
          : 100;

    if (wordCount < minWords) {
      return Math.round((wordCount / minWords) * question.points[targetLevel]);
    }

    return question.points[targetLevel];
  }

  return 0;
}

/**
 * Calculate overall assessment score
 */
export function calculateAssessmentScore(
  rubric: AssessmentRubric,
  responses: AssessmentResponse[],
  targetLevel: ProficiencyLevel
): {
  overall: number;
  byCategory: Record<string, number>;
  byQuestion: Record<string, number>;
} {
  const byQuestion: Record<string, number> = {};
  const byCategory: Record<string, number> = {};
  const categoryTotals: Record<string, number> = {};
  const categoryMaxScores: Record<string, number> = {};

  // Calculate scores for each question
  responses.forEach((response) => {
    const question = rubric.questions.find((q) => q.id === response.questionId);
    if (!question) return;

    const score = calculateQuestionScore(question, response, targetLevel);
    byQuestion[question.id] = score;

    // Accumulate category scores
    const category = question.rubric[targetLevel].split(':')[0] || 'general';
    categoryTotals[category] = (categoryTotals[category] || 0) + score;
    categoryMaxScores[category] =
      (categoryMaxScores[category] || 0) + question.points[targetLevel];
  });

  // Calculate percentage for each category
  Object.keys(categoryTotals).forEach((category) => {
    const total = categoryTotals[category];
    const max = categoryMaxScores[category];
    byCategory[category] = max > 0 ? Math.round((total / max) * 100) : 0;
  });

  // Calculate overall score (weighted by criteria)
  let totalWeightedScore = 0;
  let totalWeight = 0;

  rubric.criteria.forEach((criteria) => {
    const categoryScore = byCategory[criteria.category] || 0;
    totalWeightedScore += categoryScore * criteria.weight;
    totalWeight += criteria.weight;
  });

  const overall =
    totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;

  return {
    overall,
    byCategory,
    byQuestion,
  };
}

/**
 * Determine proficiency level from score
 */
export function determineProficiencyLevel(
  rubric: AssessmentRubric,
  score: number
): ProficiencyLevel {
  if (score >= rubric.thresholds.advanced) {
    return 'advanced';
  }
  if (score >= rubric.thresholds.intermediate) {
    return 'intermediate';
  }
  return 'beginner';
}

/**
 * Generate feedback based on assessment results
 */
export function generateFeedback(
  rubric: AssessmentRubric,
  scores: AssessmentResult['scores'],
  proficiencyLevel: ProficiencyLevel
): {
  strengths: string[];
  improvements: string[];
  nextSteps: string[];
} {
  const strengths: string[] = [];
  const improvements: string[] = [];
  const nextSteps: string[] = [];

  // Analyze category scores
  Object.entries(scores.byCategory).forEach(([category, score]) => {
    const criteria = rubric.criteria.find((c) => c.category === category);
    if (!criteria) return;

    if (score >= 80) {
      strengths.push(
        `Strong understanding of ${category}: ${criteria.description}`
      );
    } else if (score < 60) {
      improvements.push(
        `Needs improvement in ${category}: ${criteria.description}`
      );
      nextSteps.push(
        `Review ${criteria[proficiencyLevel]} to strengthen ${category} understanding`
      );
    }
  });

  // Add level-specific next steps
  if (proficiencyLevel === 'beginner') {
    nextSteps.push(
      'Continue practicing with exercises and reviewing foundation concepts'
    );
    nextSteps.push('Consider revisiting prerequisite pages');
  } else if (proficiencyLevel === 'intermediate') {
    nextSteps.push('Try more advanced exercises and real-world scenarios');
    nextSteps.push('Explore related concepts and component implementations');
  } else {
    nextSteps.push('Consider contributing to design system documentation');
    nextSteps.push('Help others learn by sharing your knowledge');
  }

  return {
    strengths: strengths.length > 0 ? strengths : ['Keep up the good work!'],
    improvements,
    nextSteps,
  };
}

/**
 * Create assessment result from rubric and responses
 */
export function createAssessmentResult(
  rubric: AssessmentRubric,
  responses: AssessmentResponse[]
): AssessmentResult {
  // Start with intermediate level, can be adjusted based on user's track or preference
  const targetLevel: ProficiencyLevel = 'intermediate';

  const scores = calculateAssessmentScore(rubric, responses, targetLevel);
  const proficiencyLevel = determineProficiencyLevel(rubric, scores.overall);
  const feedback = generateFeedback(rubric, scores, proficiencyLevel);

  return {
    assessmentId: rubric.id,
    foundationPageSlug: rubric.foundationPageSlug,
    completedAt: new Date().toISOString(),
    responses,
    scores,
    proficiencyLevel,
    feedback,
  };
}

/**
 * Save assessment result to localStorage
 */
export function saveAssessmentResult(result: AssessmentResult): void {
  if (typeof window === 'undefined') return;

  try {
    const stored = localStorage.getItem('foundation_assessments');
    const assessments = stored ? JSON.parse(stored) : {};
    assessments[result.foundationPageSlug] = assessments[
      result.foundationPageSlug
    ] || { completedAssessments: {}, attempts: 0 };

    assessments[result.foundationPageSlug].completedAssessments[
      result.assessmentId
    ] = result;
    assessments[result.foundationPageSlug].attempts =
      (assessments[result.foundationPageSlug].attempts || 0) + 1;
    assessments[result.foundationPageSlug].lastAttempt = result.completedAt;
    assessments[result.foundationPageSlug].currentProficiency =
      result.proficiencyLevel;

    localStorage.setItem('foundation_assessments', JSON.stringify(assessments));
  } catch (error) {
    console.error('Failed to save assessment result:', error);
  }
}

/**
 * Get assessment progress for a foundation page
 */
export function getAssessmentProgress(foundationPageSlug: string): {
  completedAssessments: Record<string, AssessmentResult>;
  currentProficiency: ProficiencyLevel | null;
  attempts: number;
  lastAttempt: string | null;
} | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem('foundation_assessments');
    if (!stored) return null;

    const assessments = JSON.parse(stored);
    const pageData = assessments[foundationPageSlug];

    if (!pageData) return null;

    return {
      completedAssessments: pageData.completedAssessments || {},
      currentProficiency: pageData.currentProficiency || null,
      attempts: pageData.attempts || 0,
      lastAttempt: pageData.lastAttempt || null,
    };
  } catch {
    return null;
  }
}

/**
 * Get all assessment progress
 */
export function getAllAssessmentProgress(): Record<
  string,
  {
    completedAssessments: Record<string, AssessmentResult>;
    currentProficiency: ProficiencyLevel | null;
    attempts: number;
    lastAttempt: string | null;
  }
> {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem('foundation_assessments');
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}
