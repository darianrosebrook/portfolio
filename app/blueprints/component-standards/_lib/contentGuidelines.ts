export type ContentDesign = {
  voice?: string;
  tone?: string;
  examples?: {
    good: string;
    bad: string;
  }[];
  patterns?: string[];
};

/**
 * Get content design guidelines for a component (if available).
 * Returns null if no guidelines exist.
 */
export function getContentDesign(componentName: string): ContentDesign | null {
  // TODO: Implement actual content design data lookup
  // For now, return example data for common components
  const examples: Record<string, ContentDesign> = {
    Button: {
      voice: 'Action-oriented, clear, and concise',
      tone: 'Direct and confident',
      examples: [
        {
          good: 'Save changes',
          bad: 'Click here to save your changes',
        },
        {
          good: 'Delete',
          bad: 'Remove this item from the list',
        },
        {
          good: 'Sign in',
          bad: 'Sign in to your account',
        },
      ],
      patterns: [
        'Use verbs (Save, Delete, Submit)',
        'Keep labels short (1-2 words)',
        'Be specific about the action',
        'Avoid "Click here" or vague instructions',
      ],
    },
    Input: {
      voice: 'Helpful and guiding',
      tone: 'Clear and supportive',
      examples: [
        {
          good: 'Enter your email address',
          bad: 'Email',
        },
        {
          good: 'Password (minimum 8 characters)',
          bad: 'Pass',
        },
      ],
      patterns: [
        'Use descriptive labels, not placeholders',
        'Include format hints when needed',
        'Provide clear error messages',
        'Use helper text for complex inputs',
      ],
    },
    Alert: {
      voice: 'Informative and empathetic',
      tone: 'Varies by intent (calm for info, urgent for errors)',
      examples: [
        {
          good: 'Your changes have been saved successfully.',
          bad: 'OK',
        },
        {
          good: 'Unable to connect. Please check your internet connection and try again.',
          bad: 'Error occurred',
        },
      ],
      patterns: [
        'Explain what happened',
        'Suggest next steps when possible',
        'Use appropriate tone for intent',
        'Keep messages concise but complete',
      ],
    },
  };

  return examples[componentName] || null;
}






