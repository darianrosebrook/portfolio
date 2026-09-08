import Link from 'next/link';
import type {
  LibraryCounts,
  LibraryFilters,
} from '@/utils/editor/contentLibrary';
import styles from '../../page.module.css';

interface ArticleFiltersProps {
  counts: LibraryCounts;
  filters: LibraryFilters;
  basePath?: '/dashboard/articles' | '/dashboard/case-studies';
}

/** A GET form keeps filters bookmarkable and usable before JavaScript loads. */
export function ArticleFilters({
  counts,
  filters,
  basePath = '/dashboard/articles',
}: ArticleFiltersProps) {
  return (
    <form
      action={basePath}
      method="get"
      className={styles.filterForm}
      aria-label="Filter content"
    >
      <div className={styles.filterFields}>
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
        <label>
          Status
          <select
            key={filters.status}
            name="status"
            defaultValue={filters.status}
          >
            <option value="all">All ({counts.all})</option>
            <option value="draft">Drafts ({counts.draft})</option>
            <option value="changes">
              Unpublished changes ({counts.changes})
            </option>
            <option value="published">Published ({counts.published})</option>
            <option value="archived">Archived ({counts.archived})</option>
          </select>
        </label>
        <label>
          Sort by
          <select key={filters.sort} name="sort" defaultValue={filters.sort}>
            <option value="recent">Recently edited</option>
            <option value="title">Title A–Z</option>
          </select>
        </label>
      </div>
      <div className={styles.actions}>
        <button type="submit" className={styles.applyButton}>
          Apply filters
        </button>
        {(filters.q ||
          filters.status !== 'all' ||
          filters.sort !== 'recent') && (
          <Link href={basePath}>Clear filters</Link>
        )}
      </div>
    </form>
  );
}
