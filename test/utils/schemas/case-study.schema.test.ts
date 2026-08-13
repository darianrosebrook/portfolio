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
