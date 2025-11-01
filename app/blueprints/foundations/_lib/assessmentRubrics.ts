/**
 * Assessment rubrics for foundation pages
 * Each foundation page should have a corresponding rubric
 */

import type { AssessmentRubric } from '@/types/assessment';

export const philosophyAssessmentRubric: AssessmentRubric = {
  id: 'philosophy-assessment-1',
  foundationPageSlug: 'philosophy',
  title: 'Philosophy of Design Systems Assessment',
  description:
    'Assess your understanding of design systems philosophy, systems thinking, and the tradeoffs that shape system evolution.',
  criteria: [
    {
      id: 'systems-thinking',
      category: 'Systems Thinking',
      description: 'Understanding of systems thinking principles',
      beginner: 'Can identify basic system components and relationships',
      intermediate:
        'Can analyze system interactions and recognize emergent properties',
      advanced:
        'Can design systems with intentional tradeoffs and predict long-term evolution',
      weight: 0.3,
    },
    {
      id: 'socio-technical',
      category: 'Socio-Technical Infrastructure',
      description: 'Understanding of design systems as socio-technical systems',
      beginner:
        'Recognizes that design systems involve both people and technology',
      intermediate:
        'Understands how governance, culture, and technical architecture interact',
      advanced:
        'Can design governance structures that scale with system complexity',
      weight: 0.25,
    },
    {
      id: 'tradeoffs',
      category: 'Tradeoffs & Evolution',
      description: 'Understanding of system tradeoffs and evolution patterns',
      beginner: 'Can identify common tradeoffs (consistency vs flexibility)',
      intermediate:
        'Can make informed decisions about tradeoffs in specific contexts',
      advanced:
        'Can design systems that evolve gracefully and manage tradeoffs strategically',
      weight: 0.25,
    },
    {
      id: 'application',
      category: 'Practical Application',
      description: 'Ability to apply philosophical concepts to real situations',
      beginner: 'Can relate concepts to simple examples',
      intermediate: 'Can analyze real-world system challenges',
      advanced:
        'Can design and implement systems guided by philosophical principles',
      weight: 0.2,
    },
  ],
  questions: [
    {
      id: 'q1',
      type: 'multiple-choice',
      question:
        'What is the primary difference between a pattern library and a design system?',
      options: [
        'A pattern library is just code, while a design system includes governance',
        'A design system is larger than a pattern library',
        'Pattern libraries are for designers, design systems are for developers',
        'There is no difference; they are the same thing',
      ],
      correctAnswers: [
        'A pattern library is just code, while a design system includes governance',
      ],
      rubric: {
        beginner:
          'Systems Thinking: Recognizes that design systems involve more than code',
        intermediate:
          'Systems Thinking: Understands governance as a key differentiator',
        advanced:
          'Systems Thinking: Can articulate how governance enables system evolution',
      },
      points: {
        beginner: 10,
        intermediate: 15,
        advanced: 20,
      },
    },
    {
      id: 'q2',
      type: 'multiple-select',
      question:
        'Which of the following are characteristics of systems thinking? (Select all that apply)',
      options: [
        'Focusing on individual components in isolation',
        'Understanding relationships and interactions',
        'Recognizing emergent properties',
        'Ignoring context and environment',
        'Considering feedback loops',
      ],
      correctAnswers: [
        'Understanding relationships and interactions',
        'Recognizing emergent properties',
        'Considering feedback loops',
      ],
      rubric: {
        beginner:
          'Systems Thinking: Can identify basic systems thinking concepts',
        intermediate:
          'Systems Thinking: Understands key systems thinking principles',
        advanced:
          'Systems Thinking: Can apply systems thinking to complex problems',
      },
      points: {
        beginner: 15,
        intermediate: 20,
        advanced: 25,
      },
    },
    {
      id: 'q3',
      type: 'reflection',
      question:
        'Describe a real-world example where you witnessed the tradeoff between consistency and flexibility in a design system. What were the consequences?',
      rubric: {
        beginner:
          'Tradeoffs & Evolution: Can identify tradeoffs in simple scenarios',
        intermediate:
          'Tradeoffs & Evolution: Can analyze tradeoffs and their consequences',
        advanced:
          'Tradeoffs & Evolution: Can design strategies to manage tradeoffs',
      },
      points: {
        beginner: 20,
        intermediate: 30,
        advanced: 40,
      },
    },
    {
      id: 'q4',
      type: 'application',
      question:
        'Imagine you are starting a design system for a new product. What governance structures would you put in place? How would you balance immediate needs with long-term evolution?',
      rubric: {
        beginner:
          'Socio-Technical Infrastructure: Can identify basic governance needs',
        intermediate:
          'Socio-Technical Infrastructure: Can design practical governance structures',
        advanced:
          'Socio-Technical Infrastructure: Can design scalable governance that evolves',
      },
      points: {
        beginner: 25,
        intermediate: 35,
        advanced: 50,
      },
    },
    {
      id: 'q5',
      type: 'multiple-choice',
      question:
        'What does "emergent properties" mean in the context of design systems?',
      options: [
        'Properties that emerge from combining components',
        'Properties that are explicitly defined',
        'Properties that only exist in code',
        'Properties that designers create',
      ],
      correctAnswers: ['Properties that emerge from combining components'],
      rubric: {
        beginner:
          'Systems Thinking: Recognizes that systems have properties beyond components',
        intermediate:
          'Systems Thinking: Understands how emergent properties arise',
        advanced:
          'Systems Thinking: Can design for desired emergent properties',
      },
      points: {
        beginner: 10,
        intermediate: 15,
        advanced: 20,
      },
    },
  ],
  thresholds: {
    beginner: 50,
    intermediate: 70,
    advanced: 85,
  },
};

// Export all rubrics
export const assessmentRubrics: Record<string, AssessmentRubric> = {
  philosophy: philosophyAssessmentRubric,
  // Add more rubrics as we create assessments for other pages
};

/**
 * Get assessment rubric for a foundation page
 */
export function getAssessmentRubric(
  foundationPageSlug: string
): AssessmentRubric | null {
  return assessmentRubrics[foundationPageSlug] || null;
}
