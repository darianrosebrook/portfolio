import Link from 'next/link';
import Button from '@/ui/components/Button';
import { createClient } from '@/utils/supabase/server';
import {
  countLibrary,
  filterLibrary,
  formatLibraryDate,
  loadAuthorLibrary,
  parseLibraryFilters,
  type LibrarySearchParams,
} from '@/utils/editor/contentLibrary';
import { ArticleFilters } from '../articles/_components/ArticleFilters';
import styles from '../page.module.css';

export default async function CaseStudiesPage({
  searchParams,
}: {
  searchParams: Promise<LibrarySearchParams>;
}) {
  const filters = parseLibraryFilters(await searchParams);
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const library = await loadAuthorLibrary(supabase, user.id, 'case-studies');
  const items = library.ok ? filterLibrary(library.items, filters) : [];

  return (
    <div className={styles.workspace}>
      <header className={styles.pageHeader}>
        <div>
          <h1>Case Studies</h1>
          <p className={styles.muted}>
            Develop your project stories and review unpublished changes.
          </p>
        </div>
        <Button as="a" href="/dashboard/case-studies/new">
          New Case Study
        </Button>
      </header>
      {!library.ok ? (
        <div role="alert" className={styles.notice}>
          <p>Your case studies could not be loaded. Please try again.</p>
          <form action="/dashboard/case-studies" method="get">
            <button type="submit" className={styles.applyButton}>
              Retry loading case studies
            </button>
          </form>
        </div>
      ) : (
        <>
          <ArticleFilters
            counts={countLibrary(library.items)}
            filters={filters}
            basePath="/dashboard/case-studies"
          />
          {library.invalidCount > 0 && (
            <p role="alert" className={styles.notice}>
              {library.invalidCount} case study record(s) need a valid slug
              before they can be opened. They are excluded from these results
              and counts.
            </p>
          )}
          <p className={styles.muted}>
            {items.length} of {library.items.length} case studies
          </p>
          {items.length === 0 ? (
            <div className={styles.notice}>
              <p>
                {library.items.length === 0 && library.invalidCount === 0
                  ? 'No case studies yet. Start with a project you want to share.'
                  : 'No case studies match these filters.'}
              </p>
              <Link
                href={
                  library.items.length === 0
                    ? '/dashboard/case-studies/new'
                    : '/dashboard/case-studies'
                }
              >
                {library.items.length === 0
                  ? 'Create a case study'
                  : 'Clear filters'}
              </Link>
            </div>
          ) : (
            <ul className={styles.contentList}>
              {items.map((item) => (
                <li key={item.id} className={styles.contentRow}>
                  <div>
                    <h2 className={styles.contentTitle}>
                      <Link href={item.editHref}>
                        {item.headline || item.slug}
                      </Link>
                    </h2>
                    {item.description && (
                      <p className={styles.muted}>{item.description}</p>
                    )}
                    <p className={styles.itemMeta}>
                      <span>{item.status ?? 'Unknown status'}</span>
                      {item.hasUnpublishedChanges && (
                        <span>Unpublished changes</span>
                      )}
                      <span>Edited {formatLibraryDate(item.modified_at)}</span>
                    </p>
                  </div>
                  <Link
                    href={item.editHref}
                    aria-label={`Edit ${item.headline || item.slug}`}
                  >
                    Edit
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
