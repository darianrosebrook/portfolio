import Link from 'next/link';
import Button from '@/ui/components/Button';
import { createClient } from '@/utils/supabase/server';
import {
  countLibrary,
  filterLibrary,
  formatLibraryDate,
  loadAuthorLibrary,
} from '@/utils/editor/contentLibrary';
import styles from './page.module.css';

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
  const recent = filterLibrary(
    available.filter(
      (item) => item.status === 'draft' || item.hasUnpublishedChanges
    ),
    {}
  ).slice(0, 6);

  return (
    <div className={styles.workspace}>
      <header className={styles.pageHeader}>
        <div>
          <h1>Your writing workspace</h1>
          <p className={styles.muted}>
            Resume a draft, review changes, or start something new.
          </p>
        </div>
        <div className={styles.actions}>
          <Button as="a" href="/dashboard/articles/new">
            New Article
          </Button>
          <Link href="/dashboard/case-studies/new">New Case Study</Link>
        </div>
      </header>
      <div className={styles.libraryGrid}>
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
                  <p className={styles.muted}>
                    Unpublished changes are saved revisions to published
                    content.
                  </p>
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
      </div>
      <section aria-labelledby="continue-writing" className={styles.workspace}>
        <div>
          <h2 id="continue-writing">Continue writing</h2>
          <p className={styles.muted}>
            Your most recently edited drafts and unpublished changes.
          </p>
        </div>
        {!complete && (
          <p role="status" className={styles.notice}>
            Some content could not be loaded. This list only shows content from
            the available libraries.
          </p>
        )}
        {recent.length > 0 ? (
          <ul className={styles.contentList}>
            {recent.map((item) => (
              <li key={`${item.kind}:${item.id}`} className={styles.contentRow}>
                <div>
                  <h3 className={styles.contentTitle}>
                    <Link href={item.editHref}>
                      {item.headline || item.slug}
                    </Link>
                  </h3>
                  <p className={styles.itemMeta}>
                    <span>
                      {item.kind === 'articles' ? 'Article' : 'Case study'}
                    </span>
                    <span>
                      {item.hasUnpublishedChanges
                        ? 'Unpublished changes'
                        : 'Draft'}
                    </span>
                    <span>Edited {formatLibraryDate(item.modified_at)}</span>
                  </p>
                </div>
                <Link
                  href={item.editHref}
                  aria-label={`Continue writing ${item.headline || item.slug}`}
                >
                  Continue
                </Link>
              </li>
            ))}
          </ul>
        ) : complete ? (
          <p className={styles.notice}>
            No drafts or unpublished changes. Start a new article or case study
            when you are ready.
          </p>
        ) : null}
      </section>
    </div>
  );
}
