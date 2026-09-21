import Link from 'next/link';
import Button from '@/ui/components/Button';
import { createClient } from '@/utils/supabase/server';
import {
  countLibrary,
  filterLibrary,
  formatLibraryDate,
  loadAuthorLibrary,
} from '@/utils/editor/contentLibrary';
import { ContentCard } from './_components/ContentCard';
import { PageHeader } from './_components/PageHeader';
import styles from './page.module.css';

type PillStatus = 'draft' | 'published' | 'archived' | 'scheduled';

/** Library rows carry a loose status string; the pill has a closed set. */
function statusOf(value: string | null): PillStatus {
  return value === 'published' || value === 'archived' || value === 'scheduled'
    ? value
    : 'draft';
}

function kindLabel(kind: string): string {
  return kind === 'articles' ? 'Article' : 'Case study';
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const [articles, caseStudies] = await Promise.all([
    loadAuthorLibrary(supabase, user.id, 'articles'),
    loadAuthorLibrary(supabase, user.id, 'case-studies'),
  ]);
  const libraries = [
    { title: 'Articles', href: '/dashboard/articles', result: articles },
    {
      title: 'Case Studies',
      href: '/dashboard/case-studies',
      result: caseStudies,
    },
  ];
  const complete = articles.ok && caseStudies.ok;
  const available = [
    ...(articles.ok ? articles.items : []),
    ...(caseStudies.ok ? caseStudies.items : []),
  ];

  // Two different questions, two different lists: what still needs work, and
  // what is live. The previous single "recent" list answered neither.
  const needsAttention = filterLibrary(
    available.filter(
      (item) => item.status === 'draft' || item.hasUnpublishedChanges
    ),
    {}
  ).slice(0, 6);
  const recentActivity = filterLibrary(
    available.filter(
      (item) => item.status === 'published' && !item.hasUnpublishedChanges
    ),
    {}
  ).slice(0, 5);

  return (
    <>
      <PageHeader
        title="Your writing workspace"
        description="Pick up a draft, review unpublished changes, or see what is live."
        actions={
          <>
            <Button as="a" href="/dashboard/articles/new">
              New Article
            </Button>
            <Button
              as="a"
              variant="secondary"
              href="/dashboard/case-studies/new"
            >
              New Case Study
            </Button>
          </>
        }
      />

      <section aria-label="Library status" className={styles.libraryGrid}>
        {libraries.map(({ title, href, result }) => {
          const counts = result.ok ? countLibrary(result.items) : null;
          return (
            <section
              key={href}
              className={styles.libraryCard}
              aria-label={title}
            >
              <h2>
                <Link href={href}>{title}</Link>
              </h2>
              {!result.ok || !counts ? (
                <div role="alert">
                  <p>{title} could not be loaded.</p>
                  <form action="/dashboard" method="get">
                    <button type="submit" className={styles.applyButton}>
                      Retry loading dashboard
                    </button>
                  </form>
                </div>
              ) : (
                <>
                  <div className={styles.libraryCounts}>
                    <Link href={`${href}?status=draft`}>
                      <strong>{counts.draft}</strong>
                      <span>Drafts</span>
                    </Link>
                    <Link href={`${href}?status=changes`}>
                      <strong>{counts.changes}</strong>
                      <span>Unpublished changes</span>
                    </Link>
                    <Link href={`${href}?status=published`}>
                      <strong>{counts.published}</strong>
                      <span>Published</span>
                    </Link>
                  </div>
                  <Link href={href}>
                    View all {result.items.length} {title.toLowerCase()}
                  </Link>
                  {result.invalidCount > 0 && (
                    <p role="alert">
                      {result.invalidCount} record(s) need a valid slug and are
                      excluded from these counts.{' '}
                      <Link href={href}>Open library</Link>
                    </p>
                  )}
                </>
              )}
            </section>
          );
        })}
      </section>

      <section aria-labelledby="needs-attention">
        <div>
          <h2 id="needs-attention">Needs attention</h2>
          <p className={styles.muted}>
            Drafts and published items with unsaved revisions, most recent
            first.
          </p>
        </div>
        {!complete && (
          <p role="status" className={styles.notice}>
            Some content could not be loaded. This list only shows content from
            the available libraries.
          </p>
        )}
        {needsAttention.length > 0 ? (
          <div className={styles.libraryGrid}>
            {needsAttention.map((item) => {
              const title = item.headline || item.slug;
              return (
                <ContentCard
                  key={`${item.kind}:${item.id}`}
                  href={item.editHref}
                  title={title}
                  description={item.description}
                  status={statusOf(item.status)}
                  changes={item.hasUnpublishedChanges}
                  kind={kindLabel(item.kind)}
                  section={item.articleSection ?? null}
                  image={item.image ?? null}
                  date={
                    item.modified_at
                      ? formatLibraryDate(item.modified_at)
                      : null
                  }
                  wordCount={item.wordCount}
                  actions={
                    <Button
                      as="a"
                      href={item.editHref}
                      aria-label={`Continue writing ${title}`}
                    >
                      Continue
                    </Button>
                  }
                />
              );
            })}
          </div>
        ) : complete ? (
          <p className={styles.notice}>
            No drafts or unpublished changes. Start a new article or case study
            when you are ready.
          </p>
        ) : null}
      </section>

      <section aria-labelledby="recent-activity">
        <div>
          <h2 id="recent-activity">Recent activity</h2>
          <p className={styles.muted}>
            Published work, most recently updated first.
          </p>
        </div>
        {recentActivity.length > 0 ? (
          <ul className={styles.contentList}>
            {recentActivity.map((item) => (
              <li key={`${item.kind}:${item.id}`} className={styles.contentRow}>
                <div>
                  <h3 className={styles.contentTitle}>
                    <Link href={item.editHref}>
                      {item.headline || item.slug}
                    </Link>
                  </h3>
                  <p className={styles.itemMeta}>
                    <span>{kindLabel(item.kind)}</span>
                    {item.articleSection && <span>{item.articleSection}</span>}
                    <span>Updated {formatLibraryDate(item.modified_at)}</span>
                  </p>
                </div>
                <Link href={`/${item.kind}/${item.slug}`}>View live</Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.notice}>
            Nothing is published yet. Published articles and case studies will
            appear here.
          </p>
        )}
      </section>
    </>
  );
}
