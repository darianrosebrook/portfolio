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

  it('neutralizes javascript: URLs obfuscated with tabs/newlines in the scheme', () => {
    const html = '<a href="jav\tascript:alert(1)">x</a>';
    const result = sanitizeCmsHtml(html);
    expect(result).toContain('href="#"');
    expect(result).not.toMatch(/javascript:/i);

    const withNewline = '<a href="java\nscript:alert(1)">x</a>';
    expect(sanitizeCmsHtml(withNewline)).toContain('href="#"');
  });

  it('neutralizes data:text/html URLs', () => {
    const html = '<a href="data:text/html,<script>alert(1)</script>">x</a>';
    expect(sanitizeCmsHtml(html)).toContain('href="#"');
  });

  it('leaves safe URLs untouched', () => {
    const html = '<a href="https://example.com/path?q=1">x</a>';
    expect(sanitizeCmsHtml(html)).toBe(html);
  });

  it('returns empty string for empty input', () => {
    expect(sanitizeCmsHtml('')).toBe('');
  });
});
