/**
 * Slug generation utility
 * Converts text to URL-safe slugs
 */

/**
 * Converts a string to a URL-safe slug
 * @param text - The text to convert to a slug
 * @returns A URL-safe slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '') // Trim hyphens from start
    .replace(/-+$/, ''); // Trim hyphens from end
}

/**
 * Converts a string to a slug while it is being typed.
 *
 * Identical to {@link slugify} except that one trailing hyphen is preserved. The
 * dashboard slug field is a controlled input whose value is re-slugified on
 * every keystroke; full normalization trims a trailing hyphen before the next
 * character arrives, so typing "a-b" collapses to "ab". Persistence normalizes
 * with {@link slugify}, which trims the trailing hyphen, so the stored slug is
 * always a fully valid slug.
 *
 * @param text - The partial text the author has typed
 * @returns A slug-shaped value that may end in a single hyphen
 */
export function slugifyInput(text: string): string {
  const source = text.toString();
  const normalized = slugify(source);
  if (!normalized) return '';
  return /[\s-]$/.test(source) ? `${normalized}-` : normalized;
}

/**
 * Generates a unique slug by appending a number if needed
 * @param baseSlug - The base slug to make unique
 * @param existingSlugs - Array of existing slugs to check against
 * @returns A unique slug
 */
export function generateUniqueSlug(
  baseSlug: string,
  existingSlugs: string[]
): string {
  if (!existingSlugs.includes(baseSlug)) {
    return baseSlug;
  }

  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;

  while (existingSlugs.includes(uniqueSlug)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}
