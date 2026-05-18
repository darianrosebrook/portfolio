import { describe, it, expect } from 'vitest';
import { createArticleSchema } from '@/utils/schemas/article.schema';

/**
 * The autosave path on /dashboard/articles/new POSTs a minimal payload —
 * the user-editable fields, status, and wordCount. It does NOT pre-populate
 * the working_* mirror columns, working_modified_at, or is_dirty; the
 * server fills those in on insert.
 *
 * If the schema requires those fields, autosave returns 400 and the UI
 * silently stops working. These tests pin that contract.
 */
describe('createArticleSchema — autosave payload', () => {
  const autosavePayload = {
    slug: 'my-draft',
    headline: 'My Draft',
    description: 'A brief description',
    articleBody: { type: 'doc', content: [{ type: 'paragraph' }] },
    articleSection: 'Design Systems',
    keywords: 'design, systems',
    image: 'https://example.com/cover.jpg',
    status: 'draft' as const,
    wordCount: 42,
  };

  it('accepts the standard autosave payload (no working_* fields)', () => {
    const result = createArticleSchema.safeParse(autosavePayload);
    expect(result.success).toBe(true);
  });

  it('accepts the autosave payload with null content fields', () => {
    const result = createArticleSchema.safeParse({
      ...autosavePayload,
      headline: null,
      description: null,
      articleBody: null,
      articleSection: null,
      keywords: null,
      image: null,
    });
    expect(result.success).toBe(true);
  });

  it('still rejects a payload with an invalid slug', () => {
    const result = createArticleSchema.safeParse({
      ...autosavePayload,
      slug: 'Invalid Slug With Spaces',
    });
    expect(result.success).toBe(false);
  });

  it('still rejects a payload missing slug entirely', () => {
    const { slug: _slug, ...rest } = autosavePayload;
    void _slug;
    const result = createArticleSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it('accepts an empty image string and coerces it to null', () => {
    const result = createArticleSchema.safeParse({
      ...autosavePayload,
      image: '',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.image).toBeNull();
    }
  });
});
