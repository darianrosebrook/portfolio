import { z } from 'zod';

const articleStatusEnum = z.enum(['draft', 'published', 'archived']);

export const articleSchema = z.object({
  id: z.number(),
  created_at: z.string().datetime().nullable(),
  modified_at: z.string().datetime().nullable(),
  published_at: z.string().datetime().nullable(),
  status: articleStatusEnum.default('draft'),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be url-safe and contain no spaces',
  }),
  headline: z
    .string()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  alternativeHeadline: z
    .string()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  description: z
    .string()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  keywords: z
    .string()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  author: z.string().uuid().nullable(),
  editor: z.string().uuid().nullable(),
  articleBody: z.any().nullable(), // Corresponds to JSONContent
  articleSection: z
    .string()
    .nullable()
    .transform((val) => (val === '' ? null : val)),
  image: z
    .string()
    .url()
    .nullable()
    .or(z.literal(''))
    .transform((val) => (val === '' ? null : val)),
  wordCount: z.number().nullable(),
  index: z.number().nullable(),
});

export const createArticleSchema = articleSchema
  .omit({
    id: true,
    created_at: true,
    modified_at: true,
    published_at: true,
  })
  .partial({
    // These fields are optional when creating - they have sensible defaults
    author: true,
    editor: true,
    alternativeHeadline: true,
    index: true,
  });

export const updateArticleSchema = createArticleSchema.partial();
