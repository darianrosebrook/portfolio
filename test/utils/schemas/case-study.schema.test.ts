import { describe, expect, it } from 'vitest';
import {
  patchCaseStudyDraftSchema,
  updateCaseStudySchema,
} from '@/utils/schemas/case-study.schema';

describe('patchCaseStudyDraftSchema', () => {
  it('accepts the word count emitted by the shared content editor', () => {
    expect(
      patchCaseStudyDraftSchema.safeParse({
        workingheadline: 'Working title',
        wordCount: 42,
      }).success
    ).toBe(true);
  });

  it('does not apply create-time defaults to a sparse update', () => {
    expect(updateCaseStudySchema.parse({ slug: 'renamed-case-study' })).toEqual(
      {
        slug: 'renamed-case-study',
      }
    );
  });
});

describe('updateCaseStudySchema — published_at survives parsing', () => {
  it('keeps the date the editor sent', () => {
    const publishedAt = '2026-05-18T08:37:00.000Z';
    const result = updateCaseStudySchema.safeParse({
      slug: 'fine-slug',
      status: 'published',
      published_at: publishedAt,
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.published_at).toBe(publishedAt);
  });

  it('stays optional so a first publish still falls back to now() in the route', () => {
    const result = updateCaseStudySchema.safeParse({
      slug: 'fine-slug',
      status: 'published',
    });
    expect(result.success).toBe(true);
    if (!result.success) return;
    expect(result.data.published_at).toBeUndefined();
  });
});
