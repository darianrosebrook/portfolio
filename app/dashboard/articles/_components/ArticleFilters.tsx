import Link from 'next/link';
import type {
  LibraryCounts,
  LibraryFilters,
  LibraryStatus,
  LibrarySort,
} from '@/utils/editor/contentLibrary';
import styles from '../../page.module.css';
import Button from '@/ui/components/Button';

interface ArticleFiltersProps {
  counts: LibraryCounts;
  filters: LibraryFilters;
  basePath?: '/dashboard/articles' | '/dashboard/case-studies';
}

const STATUS_CHIPS: { value: LibraryStatus; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Drafts' },
  { value: 'changes', label: 'Unpublished changes' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
];

const SORTS: { value: LibrarySort; label: string }[] = [
  { value: 'recent', label: 'Recently edited' },
  { value: 'title', label: 'Title A–Z' },
];

/**
 * Builds a filter URL, keeping every parameter the author has not overridden
 * and dropping defaults so the URLs stay short and bookmarkable.
 */
function filterHref(
  basePath: string,
  filters: LibraryFilters,
  overrides: { status?: LibraryStatus; sort?: LibrarySort }
): string {
  const status = overrides.status ?? filters.status;
  const sort = overrides.sort ?? filters.sort;
  const params = new URLSearchParams();
  if (filters.q) params.set('q', filters.q);
  if (status !== 'all') params.set('status', status);
  if (sort !== 'recent') params.set('sort', sort);
  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

/**
 * Status and sort are links, so filtering works without JavaScript and every
 * filtered view is a URL you can keep. Only the free-text search needs a form.
 */
export function ArticleFilters({
  counts,
  filters,
  basePath = '/dashboard/articles',
}: ArticleFiltersProps) {
  const hasFilters =
    Boolean(filters.q) || filters.status !== 'all' || filters.sort !== 'recent';

  return (
    <div className={styles.filterBar}>
      <nav className={styles.chips} aria-label="Filter by status">
        {STATUS_CHIPS.map((chip) => {
          const active = filters.status === chip.value;
          return (
            <Link
              key={chip.value}
              href={filterHref(basePath, filters, { status: chip.value })}
              className={styles.chip}
              data-active={active}
              aria-current={active ? 'true' : undefined}
            >
              {chip.label}
              {/* explicit space: the count must not fuse into the label's
                  accessible name ("Unpublished changes 2", not "...changes2") */}{' '}
              <strong>{counts[chip.value]}</strong>
            </Link>
          );
        })}
      </nav>

      <form
        action={basePath}
        method="get"
        className={styles.filterForm}
        aria-label="Filter content"
      >
        {filters.status !== 'all' && (
          <input type="hidden" name="status" value={filters.status} />
        )}
        {filters.sort !== 'recent' && (
          <input type="hidden" name="sort" value={filters.sort} />
        )}

        <div className={styles.filterFields}>
          {/* The submit control sits outside the label: nesting it inside made
              the input's accessible name "Search Search". */}
          <span className={styles.searchRow}>
            <label className={styles.searchField}>
              Search
              <input
                key={filters.q}
                type="search"
                name="q"
                defaultValue={filters.q}
                placeholder="Title, description, or slug"
              />
            </label>
            <Button type="submit" variant="secondary">
              Search
            </Button>
          </span>

          <div className={styles.sortLinks} aria-label="Sort by">
            {SORTS.map((option) => {
              const active = filters.sort === option.value;
              return (
                <Link
                  key={option.value}
                  href={filterHref(basePath, filters, { sort: option.value })}
                  className={styles.sortLink}
                  data-active={active}
                  aria-current={active ? 'true' : undefined}
                >
                  {option.label}
                </Link>
              );
            })}
          </div>
        </div>

        {hasFilters && <Link href={basePath}>Clear filters</Link>}
      </form>
    </div>
  );
}
