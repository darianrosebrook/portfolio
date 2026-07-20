import { describe, it, expect } from 'vitest';
import { sanitizeCmsHtml } from '@/utils/helpers/sanitizeHtml';

describe('sanitizeCmsHtml', () => {
  it('strips script tags', () => {
    const html = '<p>Hi</p><script>alert(1)</script><p>Bye</p>';
    expect(sanitizeCmsHtml(html)).toBe('<p>Hi</p><p>Bye</p>');
  });

  it('strips event handler attributes', () => {
    const html = '<p onclick="alert(1)">click</p>';
    expect(sanitizeCmsHtml(html)).toBe('<p>click</p>');
  });

  it('neutralizes javascript: URLs', () => {
    const html = '<a href="javascript:alert(1)">x</a>';
    expect(sanitizeCmsHtml(html)).toContain('href="#"');
    expect(sanitizeCmsHtml(html)).not.toContain('javascript:');
  });

  it('returns empty string for empty input', () => {
    expect(sanitizeCmsHtml('')).toBe('');
  });
});
