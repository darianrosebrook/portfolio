import { describe, it, expect } from 'vitest';
import { sanitizeIlikeQuery } from '@/utils/helpers/postgrestFilter';

describe('sanitizeIlikeQuery', () => {
  it('strips PostgREST structural metacharacters', () => {
    expect(sanitizeIlikeQuery('alice,or=true')).toBe('alice or=true');
    expect(sanitizeIlikeQuery('a.b(c)')).toBe('a b c');
  });

  it('escapes LIKE wildcards', () => {
    expect(sanitizeIlikeQuery('100%_done')).toBe('100\\%\\_done');
  });

  it('trims whitespace after stripping', () => {
    expect(sanitizeIlikeQuery('  ,foo,  ')).toBe('foo');
  });
});
