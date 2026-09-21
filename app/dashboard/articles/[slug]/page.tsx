'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Article } from '@/types';
import ContentEditor from '../../_components/ContentEditor';
import Button from '@/ui/components/Button';
import styles from './page.module.css';

export default function EditArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { slug } = await params;
        const res = await fetch(`/api/articles/${slug}`);

        if (!res.ok) {
          if (res.status === 404) {
            setError('Article not found');
          } else {
            setError('Failed to load article');
          }
          return;
        }

        const data = await res.json();
        setArticle(data);
      } catch (err) {
        setError('Failed to load article');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [params]);

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Loading article...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <svg
          className={styles.errorIcon}
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--semantic-color-foreground-tertiary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <h2 className={styles.errorTitle}>{error}</h2>
          <p className={styles.errorBody}>
            The article you&apos;re looking for doesn&apos;t exist or you
            don&apos;t have permission to edit it.
          </p>
        </div>
        <Button onClick={() => router.push('/dashboard/articles')}>
          Back to Articles
        </Button>
      </div>
    );
  }

  if (!article) return null;

  return (
    <div>
      <div className={styles.header}>
        <button
          type="button"
          className={styles.backButton}
          onClick={() => router.push('/dashboard/articles')}
          title="Back to articles"
          aria-label="Back to articles"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <div>
          <h1 className={styles.title}>{article.headline || article.slug}</h1>
          <p className={styles.slug}>/{article.slug}</p>
        </div>
      </div>
      <ContentEditor initial={article} entity="articles" />
    </div>
  );
}
