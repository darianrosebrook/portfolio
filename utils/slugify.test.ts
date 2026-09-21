import { describe, expect, it } from 'vitest';
import { slugify, slugifyInput } from './slugify';

describe('slugify', () => {
  it('lowercases, hyphenates spaces, and drops non-word characters', () => {
    expect(slugify('Can You Induce a Domain?')).toBe('can-you-induce-a-domain');
  });

  it('keeps interior hyphens and trims leading and trailing ones', () => {
    expect(slugify('  --two-truths-- ')).toBe('two-truths');
  });

  it('collapses runs of separators', () => {
    expect(slugify('a -- b')).toBe('a-b');
  });

  it('returns an empty string when nothing survives', () => {
    expect(slugify('???')).toBe('');
    expect(slugify('-')).toBe('');
  });
});

describe('slugifyInput', () => {
  it('matches slugify on values with no trailing separator', () => {
    expect(slugifyInput('Two Truths')).toBe('two-truths');
    expect(slugifyInput('type-the-failure')).toBe('type-the-failure');
  });

  it('keeps a single trailing hyphen so the next typed character joins it', () => {
    expect(slugifyInput('two-')).toBe('two-');
  });

  it('collapses a trailing separator run to one hyphen', () => {
    expect(slugifyInput('two - - ')).toBe('two-');
  });

  it('still strips leading hyphens and invalid characters', () => {
    expect(slugifyInput('-two-truths?')).toBe('two-truths');
  });

  it('stays empty rather than holding a bare separator', () => {
    expect(slugifyInput('-')).toBe('');
    expect(slugifyInput('   ')).toBe('');
  });

  // The regression this fix exists for: the dashboard slug field is controlled
  // by this transform on every keystroke, so a trailing hyphen that is trimmed
  // immediately is never available for the next character to join.
  it('survives a character-by-character typing sequence', () => {
    const keystrokes = [
      'd',
      'do',
      'dom',
      'doma',
      'domai',
      'domain',
      'domain-',
      'domain-i',
      'domain-in',
      'domain-ind',
    ];
    const seen = keystrokes.map((value) => slugifyInput(value));
    expect(seen[seen.length - 1]).toBe('domain-ind');
    expect(seen).not.toContain('domainind');
    expect(seen[6]).toBe('domain-');
  });
});
