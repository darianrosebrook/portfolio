import { z } from 'zod';

const caseStudyStatusEnum = z.enum([
  'draft',
  'published',
  'archived',
  'scheduled',
]);

export const caseStudySchema = z.object({
  id: z.number(),
  created_at: z.string().datetime().nullable(),
  modified_at: z.string().datetime().nullable(),
  published_at: z.string().datetime().nullable(),
  scheduled_at: z.string().datetime().nullable(),
  status: caseStudyStatusEnum.default('draft'),
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
  articleBody: z.any().nullable(),
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
  // Working draft columns (lowercase per DB)
  workingbody: z.any().nullable(),
  workingheadline: z.string().nullable(),
  workingdescription: z.string().nullable(),
  workingimage: z.string().nullable(),
  workingkeywords: z.string().nullable(),
  workingarticlesection: z.string().nullable(),
  working_modified_at: z.string().datetime().nullable(),
  is_dirty: z.boolean().nullable().default(false),
});

export const createCaseStudySchema = caseStudySchema
  .omit({
    id: true,
    created_at: true,
    modified_at: true,
    published_at: true,
    scheduled_at: true,
  })
  .partial({
    author: true,
    editor: true,
    alternativeHeadline: true,
    index: true,
    workingbody: true,
    workingheadline: true,
    workingdescription: true,
    workingimage: true,
    workingkeywords: true,
    workingarticlesection: true,
    working_modified_at: true,
    is_dirty: true,
  });

export const updateCaseStudySchema = createCaseStudySchema.partial().extend({
  status: caseStudyStatusEnum.optional(),
  is_dirty: z.boolean().nullable().optional(),
  // createCaseStudySchema omits published_at, so zod silently dropped the date
  // the editor sent and the publish route's `?? nowIso` fallback re-stamped every
  // publish with the current time. Optional and default-free: a first publish
  // still sends no date, so the route's now() fallback stays reachable.
  published_at: caseStudySchema.shape.published_at.optional(),
  // Scheduling carries the moment the executor will publish at; it has to be
  // accepted here or zod strips it, exactly as published_at was.
  scheduled_at: caseStudySchema.shape.scheduled_at.optional(),
});

export const patchCaseStudyDraftSchema = z.object({
  slug: caseStudySchema.shape.slug.optional(),
  workingbody: z.any().optional(),
  workingheadline: z.string().nullable().optional(),
  workingdescription: z.string().nullable().optional(),
  workingimage: z.string().nullable().optional(),
  workingkeywords: z.string().nullable().optional(),
  workingarticlesection: z.string().nullable().optional(),
  wordCount: z.number().int().nonnegative().nullable().optional(),
  is_dirty: z.boolean().optional(),
});
