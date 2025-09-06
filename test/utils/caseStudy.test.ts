// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { getCaseStudyContent } from '@/utils/caseStudy';

describe('getCaseStudyContent', () => {
  it('returns HTML without first h1 and first img', () => {
    const data = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Title' }],
        },
        { type: 'paragraph', content: [{ type: 'text', text: 'Hello world' }] },
        {
          type: 'image',
          attrs: { src: 'https://example.com/image.jpg', alt: 'alt' },
        },
        { type: 'paragraph', content: [{ type: 'text', text: 'More text' }] },
      ],
    } as any;

    const { html } = getCaseStudyContent(data);
    expect(html).not.toContain('<h1>Title</h1>');
    expect(html).toContain('<p>');
    expect(html).toContain('Hello world');
  });
});
