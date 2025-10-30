/**
 * Tests for TipTap HTML Generation Utilities
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { JSONContent } from '@tiptap/react';
import {
  isValidJSONContent,
  normalizeJSONContent,
  removeFirstHeading,
  removeFirstImage,
  extractFirstHeading,
  extractFirstImage,
  generateArticleHTML,
  processArticleContent,
  processCaseStudyContent,
} from '@/utils/tiptap/htmlGeneration';
import { generateHTML } from '@tiptap/html';

// Mock TipTap HTML generation
vi.mock('@tiptap/html', () => ({
  generateHTML: vi.fn((doc: JSONContent, extensions: unknown[]) => {
    if (!doc.content || !Array.isArray(doc.content)) {
      return '';
    }

    const htmlParts: string[] = [];
    doc.content.forEach((node) => {
      if (node.type === 'paragraph' && node.content) {
        const text = node.content
          .map((c) => (c.type === 'text' ? c.text : ''))
          .join('');
        htmlParts.push(`<p>${text}</p>`);
      } else if (node.type === 'heading' && node.content) {
        const level = (node.attrs as { level?: number })?.level || 1;
        const text = node.content
          .map((c) => (c.type === 'text' ? c.text : ''))
          .join('');
        htmlParts.push(`<h${level}>${text}</h${level}>`);
      } else if (node.type === 'image' && node.attrs) {
        const attrs = node.attrs as { src?: string; alt?: string };
        htmlParts.push(
          `<img src="${attrs.src || ''}" alt="${attrs.alt || ''}" />`
        );
      } else if (node.type === 'video' && node.attrs) {
        const attrs = node.attrs as { src?: string };
        htmlParts.push(`<video src="${attrs.src || ''}"></video>`);
      }
    });
    return htmlParts.join('');
  }),
}));

describe('TipTap HTML Generation Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('isValidJSONContent', () => {
    it('should validate correct JSONContent structure', () => {
      const valid: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello' }],
          },
        ],
      };

      expect(isValidJSONContent(valid)).toBe(true);
    });

    it('should reject invalid content', () => {
      expect(isValidJSONContent(null)).toBe(false);
      expect(isValidJSONContent(undefined)).toBe(false);
      expect(isValidJSONContent('string')).toBe(false);
      expect(isValidJSONContent(123)).toBe(false);
      expect(isValidJSONContent({})).toBe(false);
      expect(isValidJSONContent({ type: 'not-doc' })).toBe(false);
    });

    it('should accept empty doc', () => {
      const empty: JSONContent = {
        type: 'doc',
        content: [],
      };

      expect(isValidJSONContent(empty)).toBe(true);
    });

    it('should accept doc without content array', () => {
      const doc: JSONContent = {
        type: 'doc',
      };

      expect(isValidJSONContent(doc)).toBe(true);
    });

    it('should reject doc with invalid content', () => {
      const invalid: unknown = {
        type: 'doc',
        content: 'not an array',
      };

      expect(isValidJSONContent(invalid)).toBe(false);
    });
  });

  describe('normalizeJSONContent', () => {
    it('should return valid content unchanged', () => {
      const valid: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello' }],
          },
        ],
      };

      const result = normalizeJSONContent(valid);
      expect(result).toEqual(valid);
    });

    it('should return empty doc for null/undefined', () => {
      const nullResult = normalizeJSONContent(null);
      expect(nullResult).toEqual({
        type: 'doc',
        content: [],
      });

      const undefinedResult = normalizeJSONContent(undefined);
      expect(undefinedResult).toEqual({
        type: 'doc',
        content: [],
      });
    });

    it('should return empty doc for invalid content', () => {
      const invalid = { type: 'not-doc' };
      const result = normalizeJSONContent(invalid);
      expect(result).toEqual({
        type: 'doc',
        content: [],
      });
    });
  });

  describe('removeFirstHeading', () => {
    it('should remove first h1 heading', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'First H1' }],
          },
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'H2' }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Content' }],
          },
        ],
      };

      const result = removeFirstHeading(content, 1);
      expect(result.content).toHaveLength(2);
      expect(result.content?.[0]?.type).toBe('heading');
      expect((result.content?.[0]?.attrs as { level?: number })?.level).toBe(2);
    });

    it('should not remove non-h1 headings', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'H2' }],
          },
        ],
      };

      const result = removeFirstHeading(content, 1);
      expect(result.content).toHaveLength(1);
    });

    it('should handle content without headings', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Content' }],
          },
        ],
      };

      const result = removeFirstHeading(content, 1);
      expect(result.content).toHaveLength(1);
    });

    it('should handle content without content array', () => {
      const content: JSONContent = {
        type: 'doc',
      };

      const result = removeFirstHeading(content, 1);
      expect(result.content).toBeUndefined();
    });
  });

  describe('removeFirstImage', () => {
    it('should remove first image', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'image',
            attrs: { src: 'image1.jpg' },
          },
          {
            type: 'image',
            attrs: { src: 'image2.jpg' },
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Content' }],
          },
        ],
      };

      const result = removeFirstImage(content);
      expect(result.content).toHaveLength(2);
      expect(result.content?.[0]?.type).toBe('image');
      expect((result.content?.[0]?.attrs as { src?: string })?.src).toBe(
        'image2.jpg'
      );
    });

    it('should handle content without images', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Content' }],
          },
        ],
      };

      const result = removeFirstImage(content);
      expect(result.content).toHaveLength(1);
    });
  });

  describe('extractFirstHeading', () => {
    it('should extract text from first h1', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'First Title' }],
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Content' }],
          },
        ],
      };

      const result = extractFirstHeading(content, 1);
      expect(result).toBe('First Title');
    });

    it('should return null when no h1 found', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 2 },
            content: [{ type: 'text', text: 'H2' }],
          },
        ],
      };

      const result = extractFirstHeading(content, 1);
      expect(result).toBeNull();
    });

    it('should return null for empty content', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [],
      };

      const result = extractFirstHeading(content, 1);
      expect(result).toBeNull();
    });

    it('should handle multiple text nodes', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [
              { type: 'text', text: 'Hello ' },
              { type: 'text', text: 'World' },
            ],
          },
        ],
      };

      const result = extractFirstHeading(content, 1);
      expect(result).toBe('Hello World');
    });
  });

  describe('extractFirstImage', () => {
    it('should extract src from first image', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'image',
            attrs: { src: 'https://example.com/image.jpg' },
          },
        ],
      };

      const result = extractFirstImage(content);
      expect(result).toBe('https://example.com/image.jpg');
    });

    it('should return null when no image found', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Content' }],
          },
        ],
      };

      const result = extractFirstImage(content);
      expect(result).toBeNull();
    });

    it('should return null for image without src', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'image',
            attrs: {},
          },
        ],
      };

      const result = extractFirstImage(content);
      expect(result).toBeNull();
    });
  });

  describe('generateArticleHTML', () => {
    it('should generate HTML from valid JSONContent', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello World' }],
          },
        ],
      };

      const result = generateArticleHTML(content);
      expect(result).toBeTruthy();
      expect(generateHTML).toHaveBeenCalled();
    });

    it('should handle null content', () => {
      const result = generateArticleHTML(null);
      // Empty content generates empty HTML string, which is truthy but empty
      expect(typeof result).toBe('string');
      expect(generateHTML).toHaveBeenCalled();
    });

    it('should handle errors gracefully', () => {
      vi.mocked(generateHTML).mockImplementationOnce(() => {
        throw new Error('Generation failed');
      });

      const content: JSONContent = {
        type: 'doc',
        content: [],
      };

      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});
      const result = generateArticleHTML(content);

      expect(result).toBe('');
      expect(consoleSpy).toHaveBeenCalled();
      consoleSpy.mockRestore();
    });
  });

  describe('processArticleContent', () => {
    it('should process article content correctly', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Article Title' }],
          },
          {
            type: 'image',
            attrs: { src: 'https://example.com/cover.jpg' },
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Article content' }],
          },
        ],
      };

      const result = processArticleContent(content);

      expect(result.h1Text).toBe('Article Title');
      expect(result.imageSrc).toBe('https://example.com/cover.jpg');
      expect(result.html).toBeTruthy();
      expect(result.html).not.toContain('Article Title');
      expect(result.html).not.toContain('cover.jpg');
      expect(result.html).toContain('Article content');
    });

    it('should handle content without h1 or image', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Just content' }],
          },
        ],
      };

      const result = processArticleContent(content);

      expect(result.h1Text).toBeNull();
      expect(result.imageSrc).toBeNull();
      expect(result.html).toBeTruthy();
    });

    it('should handle null content', () => {
      const result = processArticleContent(null);

      expect(result.h1Text).toBeNull();
      expect(result.imageSrc).toBeNull();
      // Empty content generates empty HTML string
      expect(typeof result.html).toBe('string');
    });
  });

  describe('processCaseStudyContent', () => {
    it('should process case study content correctly', () => {
      const content: JSONContent = {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Case Study Title' }],
          },
          {
            type: 'image',
            attrs: { src: 'https://example.com/image.jpg' },
          },
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Case study content' }],
          },
        ],
      };

      const result = processCaseStudyContent(content);

      expect(result.html).toBeTruthy();
      expect(result.html).not.toContain('Case Study Title');
      expect(result.html).not.toContain('image.jpg');
      expect(result.html).toContain('Case study content');
    });

    it('should handle empty content', () => {
      const result = processCaseStudyContent(null);
      // Empty content generates empty HTML string
      expect(typeof result.html).toBe('string');
    });
  });
});
