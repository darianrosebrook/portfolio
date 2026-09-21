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
import { ContentCard } from '../_components/ContentCard';
import { PageHeader } from '../_components/PageHeader';
import styles from '../page.module.css';

type PillStatus = 'draft' | 'published' | 'archived' | 'scheduled';

/** Library rows carry a loose status string; the pill has a closed set. */
function statusOf(value: string | null): PillStatus {
  return value === 'published' || value === 'archived' || value === 'scheduled'
    ? value
    : 'draft';
}

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
      <PageHeader
        title="Case Studies"
        description="Develop your project stories and review unpublished changes."
        actions={
          <Button as="a" href="/dashboard/case-studies/new">
            New Case Study
          </Button>
        }
      />
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
            <div className={styles.libraryGrid}>
              {items.map((item) => (
                <ContentCard
                  key={item.id}
                  href={item.editHref}
                  title={item.headline || item.slug}
                  description={item.description}
                  status={statusOf(item.status)}
                  changes={item.hasUnpublishedChanges}
                  kind="Case study"
                  section={item.articleSection ?? null}
                  image={item.image ?? null}
                  date={
                    item.modified_at
                      ? formatLibraryDate(item.modified_at)
                      : null
                  }
                  wordCount={item.wordCount}
                  actions={
                    <Button as="a" href={item.editHref}>
                      Edit
                    </Button>
                  }
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
