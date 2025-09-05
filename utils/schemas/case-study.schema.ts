import { z } from 'zod';

const caseStudyStatusEnum = z.enum(['draft', 'published', 'archived']);

export const caseStudySchema = z.object({
  id: z.number(),
  created_at: z.string().datetime().nullable(),
  modified_at: z.string().datetime().nullable(),
  published_at: z.string().datetime().nullable(),
  status: caseStudyStatusEnum.default('draft'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be url-safe and contain no spaces',
  }),
  headline: z.string().nullable(),
  alternativeHeadline: z.string().nullable(),
  description: z.string().nullable(),
  keywords: z.string().nullable(),
  author: z.string().uuid().nullable(),
  editor: z.string().uuid().nullable(),
  articleBody: z.any().nullable(),
  articleSection: z.string().nullable(),
  image: z.string().url().nullable(),
  wordCount: z.number().nullable(),
  index: z.number().nullable(),
});

export const createCaseStudySchema = caseStudySchema.omit({
  id: true,
  created_at: true,
  modified_at: true,
  published_at: true,
});

export const updateCaseStudySchema = createCaseStudySchema.partial();


