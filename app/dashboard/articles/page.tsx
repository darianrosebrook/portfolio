import Button from '@/ui/components/Button';
import { createClient } from '@/utils/supabase/server';
import { Suspense } from 'react';
import { ArticleCard, ArticleFilters, EmptyState } from './_components';
import styles from './articles.module.scss';

interface ArticlesPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function ArticlesPage({ searchParams }: ArticlesPageProps) {
  const params = await searchParams;
  const statusFilter = params.status as 'published' | 'draft' | undefined;
  
  const supabase = await createClient();
  
  // Fetch all articles to get counts
  const { data: allArticles } = await supabase
    .from('articles')
    .select('id, slug, headline, description, status, modified_at, published_at, wordCount')
    .order('modified_at', { ascending: false });

  // Filter out articles with empty slugs (data integrity issue)
  const articles = (allArticles ?? []).filter((a) => a.slug && a.slug.trim() !== '');
  const articlesWithEmptySlugs = (allArticles ?? []).filter((a) => !a.slug || a.slug.trim() === '');
  
  // Calculate counts
  const counts = {
    all: articles.length,
    published: articles.filter((a) => a.status === 'published').length,
    draft: articles.filter((a) => a.status === 'draft').length,
  };

  // Filter articles based on status
  const filteredArticles = statusFilter
    ? articles.filter((a) => a.status === statusFilter)
    : articles;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>Articles</h1>
          <p className={styles.subtitle}>
            Manage your blog posts and articles
          </p>
        </div>
        <Button as="a" href="/dashboard/articles/new">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ marginRight: '8px' }}
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Article
        </Button>
      </header>

      <Suspense fallback={<div>Loading filters...</div>}>
        <ArticleFilters counts={counts} />
      </Suspense>

      {articlesWithEmptySlugs.length > 0 && (
        <div style={{
          padding: '12px 16px',
          marginBottom: '16px',
          backgroundColor: 'var(--semantic-color-background-warning-subtle, #fef3c7)',
          border: '1px solid var(--semantic-color-border-warning, #f59e0b)',
          borderRadius: '8px',
          color: 'var(--semantic-color-foreground-warning, #92400e)',
        }}>
          <strong>Warning:</strong> {articlesWithEmptySlugs.length} article(s) have empty slugs and cannot be managed. 
          These need to be fixed directly in the database (IDs: {articlesWithEmptySlugs.map(a => a.id).join(', ')}).
        </div>
      )}

      <div className={styles.articlesList}>
        {filteredArticles.length === 0 ? (
          <EmptyState filter={statusFilter || 'all'} />
        ) : (
          filteredArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={{
                id: article.id,
                slug: article.slug,
                headline: article.headline,
                description: article.description,
                status: article.status as 'draft' | 'published' | 'archived',
                modified_at: article.modified_at,
                published_at: article.published_at,
                wordCount: article.wordCount,
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}
