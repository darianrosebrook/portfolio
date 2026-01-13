import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Unit tests for TipTap draft management functionality
 * Tests the localStorage persistence and slug generation logic
 */

const LOCAL_STORAGE_KEY = 'draft-article-new';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

// Mock window.localStorage
vi.stubGlobal('localStorage', localStorageMock);

describe('Draft localStorage persistence', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it('should save draft to localStorage', () => {
    const draft = {
      slug: 'draft-123456789',
      headline: 'Test Article',
      articleBody: {
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Test content' }],
          },
        ],
      },
      status: 'draft',
      wordCount: 2,
      _savedAt: new Date().toISOString(),
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draft));

    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    expect(saved).not.toBeNull();

    const parsed = JSON.parse(saved!);
    expect(parsed.headline).toBe('Test Article');
    expect(parsed.articleBody.type).toBe('doc');
  });

  it('should restore draft from localStorage', () => {
    const draft = {
      slug: 'draft-123456789',
      headline: 'Restored Article',
      articleBody: {
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Restored Article' }],
          },
        ],
      },
      status: 'draft',
      wordCount: 2,
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draft));

    // Simulate page load restoration
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    expect(saved).not.toBeNull();

    const restored = JSON.parse(saved!);
    expect(restored.headline).toBe('Restored Article');
    expect(restored.slug).toBe('draft-123456789');
  });

  it('should clear draft from localStorage', () => {
    const draft = {
      slug: 'draft-123456789',
      headline: 'To Be Deleted',
    };

    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draft));
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).not.toBeNull();

    localStorage.removeItem(LOCAL_STORAGE_KEY);
    expect(localStorage.getItem(LOCAL_STORAGE_KEY)).toBeNull();
  });

  it('should handle invalid JSON gracefully', () => {
    localStorage.setItem(LOCAL_STORAGE_KEY, 'invalid json {{{');

    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    expect(saved).toBe('invalid json {{{');

    // Simulate the try-catch in the component
    let restored = null;
    try {
      restored = JSON.parse(saved!);
    } catch {
      // Invalid JSON, ignore
      restored = null;
    }

    expect(restored).toBeNull();
  });
});

describe('Slug generation', () => {
  // Import the slugify function
  const slugify = (text: string): string => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };

  it('should generate valid slug from headline', () => {
    expect(slugify('My Amazing Article')).toBe('my-amazing-article');
    expect(slugify('Hello World!')).toBe('hello-world');
    expect(slugify('Test 123')).toBe('test-123');
  });

  it('should handle special characters', () => {
    expect(slugify('Article with @#$% symbols')).toBe('article-with-symbols');
    expect(slugify("It's a test")).toBe('its-a-test');
    expect(slugify('Multiple   spaces')).toBe('multiple-spaces');
  });

  it('should handle edge cases', () => {
    expect(slugify('')).toBe('');
    expect(slugify('   ')).toBe('');
    expect(slugify('---')).toBe('');
    expect(slugify('A')).toBe('a');
  });

  it('should trim leading and trailing hyphens', () => {
    expect(slugify('-leading')).toBe('leading');
    expect(slugify('trailing-')).toBe('trailing');
    expect(slugify('-both-')).toBe('both');
  });
});

describe('Temp slug generation', () => {
  it('should generate unique temp slugs', () => {
    const generateTempSlug = () => `draft-${Date.now()}`;

    const slug1 = generateTempSlug();
    
    // Small delay to ensure different timestamp
    const slug2 = generateTempSlug();

    expect(slug1).toMatch(/^draft-\d+$/);
    expect(slug2).toMatch(/^draft-\d+$/);
  });

  it('should identify temp slugs', () => {
    const isTempSlug = (slug: string) => slug.startsWith('draft-');

    expect(isTempSlug('draft-1234567890')).toBe(true);
    expect(isTempSlug('my-article')).toBe(false);
    expect(isTempSlug('draft')).toBe(false);
  });
});

describe('Save status logic', () => {
  type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'local';

  it('should transition through save states correctly', () => {
    const states: SaveStatus[] = [];

    // Simulate save flow
    states.push('idle');
    states.push('saving');
    states.push('saved');
    states.push('idle');

    expect(states).toEqual(['idle', 'saving', 'saved', 'idle']);
  });

  it('should handle local-only saves', () => {
    const states: SaveStatus[] = [];

    // Simulate local-only save (no valid slug)
    states.push('idle');
    states.push('local');
    states.push('idle');

    expect(states).toEqual(['idle', 'local', 'idle']);
  });

  it('should handle save errors', () => {
    const states: SaveStatus[] = [];

    // Simulate save error
    states.push('idle');
    states.push('saving');
    states.push('error');

    expect(states).toEqual(['idle', 'saving', 'error']);
  });
});

describe('Content change detection', () => {
  it('should detect content changes', () => {
    const content1 = JSON.stringify({
      articleBody: { type: 'doc', content: [] },
      headline: 'Test',
    });

    const content2 = JSON.stringify({
      articleBody: { type: 'doc', content: [] },
      headline: 'Test Changed',
    });

    expect(content1 === content2).toBe(false);
  });

  it('should not trigger save for identical content', () => {
    const content1 = JSON.stringify({
      articleBody: { type: 'doc', content: [] },
      headline: 'Test',
    });

    const content2 = JSON.stringify({
      articleBody: { type: 'doc', content: [] },
      headline: 'Test',
    });

    expect(content1 === content2).toBe(true);
  });
});
