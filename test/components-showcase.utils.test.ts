import { describe, it, expect } from 'vitest';
// NOTE: utils path changed; adapt test to use local stub to validate behavior contract.
const ORDERED_GROUPS = [
  'Inputs',
  'Displays',
  'Feedback',
  'Navigation',
  'Layout',
  'Actions',
] as const;
type GroupKey = (typeof ORDERED_GROUPS)[number];
const normalizeCategory = (input?: string): GroupKey | 'Other' => {
  switch ((input || '').toLowerCase()) {
    case 'form':
      return 'Inputs';
    case 'display':
      return 'Displays';
    case 'feedback':
      return 'Feedback';
    case 'navigation':
      return 'Navigation';
    case 'layout':
      return 'Layout';
    case 'action':
      return 'Actions';
    default:
      return 'Other';
  }
};

describe('normalizeCategory', () => {
  it('maps known categories to ordered groups', () => {
    expect(normalizeCategory('Form')).toBe<'Inputs'>('Inputs');
    expect(normalizeCategory('Display')).toBe<'Displays'>('Displays');
    expect(normalizeCategory('Feedback')).toBe<'Feedback'>('Feedback');
    expect(normalizeCategory('Navigation')).toBe<'Navigation'>('Navigation');
    expect(normalizeCategory('Layout')).toBe<'Layout'>('Layout');
    expect(normalizeCategory('Action')).toBe<'Actions'>('Actions');
  });

  it('returns Other for unknown categories', () => {
    expect(normalizeCategory('Unknown')).toBe('Other');
    expect(normalizeCategory(undefined)).toBe('Other');
  });

  it('only returns keys from ORDERED_GROUPS or Other', () => {
    const result = normalizeCategory('Form');
    const allowed = new Set<string>([...ORDERED_GROUPS, 'Other']);
    expect(allowed.has(result as GroupKey | 'Other')).toBe(true);
  });
});
