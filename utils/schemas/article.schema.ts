import { z } from 'zod';

const articleStatusEnum = z.enum(['draft', 'published', 'archived']);

/**
 * Accepts a value as either a full URL, a relative path (starts with `/`),
 * or null/empty. Empty strings coerce to null. The DB stores both forms
 * (uploads start with `/`, external assets are full URLs), so a strict
 * `.url()` rejects valid persisted state on every subsequent update.
 */
const imageField = z
  .union([
    z.literal(''),
    z.null(),
    z.string().refine(
      (val) => {
        if (val.startsWith('/')) return true;
        try {
          new URL(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: 'Must be a full URL or a relative path starting with /' }
    ),
  ])
  .nullable()
  .transform((val) => (val === '' ? null : val));

/**
 * Accepts either a strict ISO 8601 datetime or a Postgres-style timestamp
 * (e.g. "2026-05-18 01:00:00+00"). Supabase returns the latter from some
 * queries, and rejecting it makes round-trip update payloads fail.
 */
const timestampField = z
  .union([
    z.string().datetime(),
    z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(\.\d+)?([+-]\d{2}(:?\d{2})?|Z)?$/,
        { message: 'Must be an ISO 8601 or Postgres timestamp' }
      ),
  ])
  .nullable();

export const articleSchema = z.object({
  id: z.number(),
  created_at: timestampField,
  modified_at: timestampField,
  published_at: timestampField,
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
  image: imageField,
  wordCount: z.number().nullable(),
  index: z.number().nullable(),
  // Working draft columns (lowercase per DB)
  workingbody: z.any().nullable(),
  workingheadline: z.string().nullable(),
  workingdescription: z.string().nullable(),
  workingimage: z.string().nullable(),
  workingkeywords: z.string().nullable(),
  workingarticlesection: z.string().nullable(),
  working_modified_at: timestampField,
  is_dirty: z.boolean().nullable().default(false),
});

export const createArticleSchema = articleSchema
  .omit({
    id: true,
    created_at: true,
    modified_at: true,
    published_at: true,
  })
  .partial({
    // These fields are optional when creating - the server fills them in.
    author: true,
    editor: true,
    alternativeHeadline: true,
    index: true,
    // The working_* draft mirror is initialized server-side from the main
    // fields on insert (see POST /api/articles). Clients should not be
    // required to send these on first save.
    workingbody: true,
    workingheadline: true,
    workingdescription: true,
    workingimage: true,
    workingkeywords: true,
    workingarticlesection: true,
    working_modified_at: true,
    is_dirty: true,
  });

export const updateArticleSchema = createArticleSchema.partial();

export const patchArticleDraftSchema = z.object({
  workingbody: z.any().optional(),
  workingheadline: z.string().nullable().optional(),
  workingdescription: z.string().nullable().optional(),
  workingimage: z.string().nullable().optional(),
  workingkeywords: z.string().nullable().optional(),
  workingarticlesection: z.string().nullable().optional(),
  is_dirty: z.boolean().optional(),
});
