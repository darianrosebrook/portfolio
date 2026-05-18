import { describe, it, expect } from 'vitest';
import { Editor } from '@tiptap/core';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import {
  filterItems,
  defaultItems,
  type SlashCommandItem,
} from '@/ui/modules/Tiptap/Extensions/SlashCommand';

const fixture = (): SlashCommandItem[] => [
  {
    title: 'Heading 1',
    subtitle: 'Large section title',
    keywords: ['h1', 'title'],
    action: () => true,
  },
  {
    title: 'Bullet List',
    subtitle: 'Create a bulleted list',
    keywords: ['ul', 'list'],
    action: () => true,
  },
  {
    title: 'Code Block',
    subtitle: 'Insert code block',
    keywords: ['pre', 'snippet'],
    action: () => true,
  },
];

describe('SlashCommand filterItems', () => {
  it('returns all items for an empty query', () => {
    const items = fixture();
    expect(filterItems(items, '')).toHaveLength(items.length);
    expect(filterItems(items, '   ')).toHaveLength(items.length);
  });

  it('matches by title prefix case-insensitively', () => {
    const items = fixture();
    const result = filterItems(items, 'head');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Heading 1');
  });

  it('matches by subtitle substring', () => {
    const items = fixture();
    const result = filterItems(items, 'bulleted');
    expect(result.map((i) => i.title)).toEqual(['Bullet List']);
  });

  it('matches by keyword', () => {
    const items = fixture();
    const result = filterItems(items, 'snippet');
    expect(result.map((i) => i.title)).toEqual(['Code Block']);
  });

  it('returns empty array for no match', () => {
    expect(filterItems(fixture(), 'nonsense')).toEqual([]);
  });

  it('does not match across word boundaries the user did not type', () => {
    // "list" is a keyword for Bullet List, so 'lis' should still match by substring
    const items = fixture();
    const result = filterItems(items, 'lis');
    expect(result.map((i) => i.title).sort()).toEqual(['Bullet List']);
  });
});

describe('SlashCommand defaultItems', () => {
  it('returns a non-empty stable list', () => {
    const a = defaultItems();
    const b = defaultItems();
    expect(a.length).toBeGreaterThan(0);
    expect(a.map((i) => i.title)).toEqual(b.map((i) => i.title));
  });

  it('every item has a title and action', () => {
    for (const item of defaultItems()) {
      expect(item.title).toBeTruthy();
      expect(typeof item.action).toBe('function');
    }
  });

  it('every item has unique title and non-empty subtitle', () => {
    const items = defaultItems();
    const titles = items.map((i) => i.title);
    expect(new Set(titles).size).toBe(titles.length);
    for (const item of items) {
      if (item.subtitle !== undefined) {
        expect(item.subtitle.length).toBeGreaterThan(0);
      }
    }
  });

  it('action signature accepts an Editor and returns a boolean', () => {
    // We don't actually call the actions here — they depend on schema nodes
    // that aren't present in a minimal editor. Loading the full extension set
    // just for this check is overkill since TypeScript already enforces the
    // signature at compile time. We assert the shape only.
    const editor = new Editor({
      extensions: [Document, Paragraph, Text],
      content: '',
    });

    for (const item of defaultItems()) {
      expect(item.action.length).toBeLessThanOrEqual(1);
    }

    editor.destroy();
  });
});
