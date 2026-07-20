import { describe, it, expect } from 'vitest';
import {
  projectContentForCaller,
  stripWorkingFields,
} from '@/utils/supabase/contentAccess';

describe('contentAccess', () => {
  const row = {
    id: 1,
    slug: 'demo',
    author: 'author-1',
    status: 'draft',
    headline: 'Published title',
    workingheadline: 'Draft title',
    workingbody: { type: 'doc', content: [] },
    is_dirty: true,
  };

  it('strips working fields for non-authors', () => {
    const projected = projectContentForCaller(row, 'other-user');
    expect(projected).not.toHaveProperty('workingheadline');
    expect(projected).not.toHaveProperty('workingbody');
    expect(projected).not.toHaveProperty('is_dirty');
    expect(projected.headline).toBe('Published title');
  });

  it('returns full row for the author', () => {
    expect(projectContentForCaller(row, 'author-1')).toEqual(row);
  });

  it('stripWorkingFields removes known draft columns', () => {
    const stripped = stripWorkingFields(row);
    expect(stripped).not.toHaveProperty('workingheadline');
    expect(stripped.slug).toBe('demo');
  });
});
