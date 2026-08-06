import { describe, it, expect } from 'vitest';
import { getSafeRedirectPath } from '@/utils/supabase/redirect';

describe('getSafeRedirectPath', () => {
  it('allows same-origin absolute paths with query and hash', () => {
    expect(getSafeRedirectPath('/dashboard')).toBe('/dashboard');
    expect(getSafeRedirectPath('/dashboard/articles?status=draft')).toBe(
      '/dashboard/articles?status=draft'
    );
    expect(getSafeRedirectPath('/path#section')).toBe('/path#section');
  });

  it('rejects null, empty, and non-path values', () => {
    expect(getSafeRedirectPath(null)).toBe('/');
    expect(getSafeRedirectPath('')).toBe('/');
    expect(getSafeRedirectPath('dashboard')).toBe('/');
    expect(getSafeRedirectPath('https://evil.com')).toBe('/');
    expect(getSafeRedirectPath('javascript:alert(1)')).toBe('/');
  });

  it('rejects protocol-relative URLs', () => {
    expect(getSafeRedirectPath('//evil.com')).toBe('/');
    expect(getSafeRedirectPath('//evil.com/path')).toBe('/');
  });

  it('rejects backslash open-redirect shapes that WHATWG normalizes', () => {
    // String.raw keeps a real backslash; URL(base) would resolve to evil.com.
    expect(getSafeRedirectPath(String.raw`/\evil.com`)).toBe('/');
    expect(getSafeRedirectPath(String.raw`/\evil.com/path`)).toBe('/');
  });

  it('rejects tab/CR/LF smuggling that collapses into protocol-relative URLs', () => {
    expect(getSafeRedirectPath('/\t/evil.com')).toBe('/');
    expect(getSafeRedirectPath('/\r/evil.com')).toBe('/');
    expect(getSafeRedirectPath('/\n/evil.com')).toBe('/');
  });

  it('never returns a value that new URL() would resolve off-origin', () => {
    const hostile = [
      String.raw`/\evil.com`,
      '/\t/evil.com',
      '//evil.com',
      'https://evil.com',
      'http://evil.com/x',
    ];

    for (const input of hostile) {
      const safe = getSafeRedirectPath(input);
      const resolved = new URL(safe, 'https://site.example');
      expect(resolved.origin).toBe('https://site.example');
    }
  });
});
