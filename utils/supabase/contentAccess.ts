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
