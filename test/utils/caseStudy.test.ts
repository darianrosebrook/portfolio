import { getCaseStudyContent } from '@/utils/caseStudy';
import type { JSONContent } from '@tiptap/react';
import { processCaseStudyContent } from '@/utils/tiptap/htmlGeneration';

// Mock TipTap HTML generation
vi.mock('@tiptap/html', () => ({
  generateHTML: vi.fn((doc: any, extensions: any) => {
    // Simple mock that returns basic HTML structure
    const content = doc.content || [];
    const htmlParts = content.map((node: any) => {
      if (node.type === 'paragraph' && node.content) {
        return `<p>${node.content.map((c: any) => c.text || '').join('')}</p>`;
      }
      if (node.type === 'heading' && node.content) {
        const level = node.attrs?.level || 1;
        return `<h${level}>${node.content.map((c: any) => c.text || '').join('')}</h${level}>`;
      }
      if (node.type === 'image') {
        return '';
      }
      return '';
    });
    return htmlParts.join('');
  }),
}));

describe('getCaseStudyContent', () => {
  it('should handle content with image nodes without throwing an error', () => {
    const mockContent: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Test Title' }],
        },
        {
          type: 'image',
          attrs: { src: 'https://example.com/image.jpg', alt: 'Test image' },
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'This is a test paragraph.' }],
        },
      ],
    };

    expect(() => getCaseStudyContent(mockContent)).not.toThrow();
  });

  it('should remove the first h1 and first image from content', () => {
    const mockContent: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Test Title' }],
        },
        {
          type: 'image',
          attrs: { src: 'https://example.com/image.jpg', alt: 'Test image' },
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'This is a test paragraph.' }],
        },
        {
          type: 'heading',
          attrs: { level: 2 },
          content: [{ type: 'text', text: 'Second Heading' }],
        },
      ],
    };

    const result = getCaseStudyContent(mockContent);

    // Should return HTML without the first h1 and first image
    expect(result.html).toContain('This is a test paragraph.');
    expect(result.html).toContain('Second Heading');
    expect(result.html).not.toContain('Test Title');
    expect(result.html).not.toContain('https://example.com/image.jpg');
  });

  it('should handle empty content gracefully', () => {
    const result = getCaseStudyContent({});
    expect(result.html).toBe('');
  });

  it('should handle content with no h1 or image', () => {
    const mockContent: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Just a paragraph.' }],
        },
      ],
    };

    const result = getCaseStudyContent(mockContent);
    expect(result.html).toContain('Just a paragraph.');
  });

  it('should match processCaseStudyContent behavior', () => {
    const mockContent: JSONContent = {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'Title' }],
        },
        {
          type: 'image',
          attrs: { src: 'image.jpg' },
        },
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Content' }],
        },
      ],
    };

    const legacyResult = getCaseStudyContent(mockContent);
    const newResult = processCaseStudyContent(mockContent);

    // Both should produce same result
    expect(legacyResult.html).toBe(newResult.html);
  });
});
