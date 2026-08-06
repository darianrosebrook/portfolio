/**
 * Helpers for published-only public reads vs author draft access.
 */

export const WORKING_FIELD_KEYS = [
  'workingbody',
  'workingheadline',
  'workingdescription',
  'workingimage',
  'workingkeywords',
  'workingarticlesection',
  'working_modified_at',
  'is_dirty',
] as const;

export type WorkingFieldKey = (typeof WORKING_FIELD_KEYS)[number];

/**
 * Profile columns a public content page may expose about an author.
 *
 * `profiles` also holds account_status, privacy, settings, metrics and
 * spacial_location — none of which belong in an anonymous page payload.
 */
export const PUBLIC_AUTHOR_COLUMNS = [
  'full_name',
  'username',
  'avatar_url',
] as const;

/**
 * Article columns a published, publicly readable article page may select.
 *
 * Public pages spread the fetched row into props for client components, so
 * the row itself is the payload boundary — `select('*')` would ship every
 * working* draft column to anonymous visitors even though RLS permits the
 * read. Select-list narrowing, not post-hoc stripping, is the enforcement.
 */
export const PUBLIC_ARTICLE_COLUMNS = [
  'headline',
  'alternativeHeadline',
  'description',
  'articleSection',
  'keywords',
  'image',
  'published_at',
  'modified_at',
  'articleBody',
] as const;

/** Case study equivalent of {@link PUBLIC_ARTICLE_COLUMNS}. */
export const PUBLIC_CASE_STUDY_COLUMNS = [
  'headline',
  'alternativeHeadline',
  'description',
  'image',
  'published_at',
  'modified_at',
  'articleBody',
] as const;

/**
 * PostgREST select lists for the public content pages.
 *
 * These are `as const` literals rather than values joined at runtime because
 * supabase-js infers the returned row type from the *literal type* of the
 * select argument — a computed `string` collapses the result to
 * `GenericStringError`. The contentAccess tests assert each literal matches
 * its column array, so the two cannot drift apart silently.
 */
export const PUBLIC_ARTICLE_SELECT =
  'headline, alternativeHeadline, description, articleSection, keywords, image, published_at, modified_at, articleBody, author(full_name, username, avatar_url)' as const;

/** Case study equivalent of {@link PUBLIC_ARTICLE_SELECT}. */
export const PUBLIC_CASE_STUDY_SELECT =
  'headline, alternativeHeadline, description, image, published_at, modified_at, articleBody' as const;

/**
 * Strip working-draft columns from a content row for non-author callers.
 */
export function stripWorkingFields<T extends Record<string, unknown>>(
  row: T
): Omit<T, WorkingFieldKey> {
  const copy = { ...row };
  for (const key of WORKING_FIELD_KEYS) {
    delete copy[key];
  }
  return copy;
}

/**
 * Whether the authenticated user owns the content row.
 */
export function isContentAuthor(
  row: { author?: string | null },
  userId: string | undefined
): boolean {
  return Boolean(userId && row.author && row.author === userId);
}

/**
 * Project a content row for the caller: authors get the full row;
 * everyone else gets published fields only (working* stripped).
 * Callers must still enforce status=published for non-authors at query time.
 */
export function projectContentForCaller<T extends Record<string, unknown>>(
  row: T & { author?: string | null },
  userId: string | undefined
): T | Omit<T, WorkingFieldKey> {
  if (isContentAuthor(row, userId)) {
    return row;
  }
  return stripWorkingFields(row);
}
