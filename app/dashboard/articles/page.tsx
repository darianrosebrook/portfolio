import Link from 'next/link';
import Button from '@/ui/components/Button';
import { createClient } from '@/utils/supabase/server';
import {
  countLibrary,
  filterLibrary,
  loadAuthorLibrary,
  parseLibraryFilters,
  type LibrarySearchParams,
} from '@/utils/editor/contentLibrary';
import { ArticleCard, ArticleFilters, EmptyState } from './_components';
import styles from './articles.module.css';
import dashboardStyles from '../page.module.css';

interface ArticlesPageProps {
  searchParams: Promise<LibrarySearchParams>;
}

export default async function ArticlesPage({
  searchParams,
}: ArticlesPageProps) {
  const filters = parseLibraryFilters(await searchParams);
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) return null;

  const library = await loadAuthorLibrary(supabase, user.id, 'articles');
  const articles = library.ok ? filterLibrary(library.items, filters) : [];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Articles</h1>
          <p className={styles.subtitle}>
            Pick up a draft or review changes before publishing.
          </p>
        </div>
        <Button as="a" href="/dashboard/articles/new">
          New Article
        </Button>
      </header>
      {!library.ok ? (
        <div role="alert" className={dashboardStyles.notice}>
          <p>Your articles could not be loaded. Please try again.</p>
          <form action="/dashboard/articles" method="get">
            <button type="submit" className={dashboardStyles.applyButton}>
              Retry loading articles
            </button>
          </form>
        </div>
      ) : (
        <>
          <ArticleFilters
            counts={countLibrary(library.items)}
            filters={filters}
          />
          {library.invalidCount > 0 && (
            <p role="alert" className={dashboardStyles.notice}>
              {library.invalidCount} article(s) need a valid slug before they
              can be opened. They are excluded from these results and counts.
            </p>
          )}
          <p className={dashboardStyles.muted}>
            {articles.length} of {library.items.length} articles
          </p>
          <div className={styles.articlesList}>
            {articles.length === 0 ? (
              library.items.length === 0 && library.invalidCount === 0 ? (
                <EmptyState />
              ) : (
                <div className={dashboardStyles.notice}>
                  <p>No articles match these filters.</p>
                  <Link href="/dashboard/articles">Clear filters</Link>
                </div>
              )
            ) : (
              articles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={{
                    ...article,
                    status: article.status as
                      | 'draft'
                      | 'published'
                      | 'archived',
                  }}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
