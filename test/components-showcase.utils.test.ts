import { describe, it, expect } from 'vitest';
import {
  normalizeCategory,
  ORDERED_GROUPS,
  type GroupKey,
} from '@/app/blueprints/components/utils';

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
