'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Article } from '@/types';
import ContentEditor from '../../_components/ContentEditor';
import Button from '@/ui/components/Button';

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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: 'var(--core-spacing-size-04)',
        }}
      >
        <div
          style={{
            width: '32px',
            height: '32px',
            border: '3px solid var(--semantic-color-border-subtle)',
            borderTopColor: 'var(--semantic-color-foreground-accent)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
        <p style={{ color: 'var(--semantic-color-foreground-secondary)' }}>
          Loading article...
        </p>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: 'var(--core-spacing-size-06)',
          textAlign: 'center',
        }}
      >
        <svg
          width="64"
          height="64"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--semantic-color-foreground-tertiary)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ opacity: 0.5 }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div>
          <h2
            style={{
              margin: '0 0 var(--core-spacing-size-02)',
              fontSize: 'var(--semantic-typography-heading-03)',
              color: 'var(--semantic-color-foreground-primary)',
            }}
          >
            {error}
          </h2>
          <p
            style={{
              margin: 0,
              color: 'var(--semantic-color-foreground-secondary)',
            }}
          >
            The article you&apos;re looking for doesn&apos;t exist or you don&apos;t have
            permission to edit it.
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
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--core-spacing-size-04)',
          marginBottom: 'var(--core-spacing-size-06)',
        }}
      >
        <button
          onClick={() => router.push('/dashboard/articles')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '36px',
            height: '36px',
            padding: 0,
            background: 'transparent',
            border: '1px solid var(--semantic-color-border-subtle)',
            borderRadius: 'var(--core-shape-radius-02)',
            color: 'var(--semantic-color-foreground-secondary)',
            cursor: 'pointer',
            transition: 'all 150ms ease',
          }}
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
          <h1
            style={{
              margin: 0,
              fontSize: 'var(--semantic-typography-heading-02)',
              fontWeight: 'var(--semantic-typography-font-weight-bold)',
              color: 'var(--semantic-color-foreground-primary)',
            }}
          >
            {article.headline || article.slug}
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: 'var(--semantic-typography-body-03)',
              color: 'var(--semantic-color-foreground-tertiary)',
            }}
          >
            /{article.slug}
          </p>
        </div>
      </div>
      <ContentEditor initial={article} entity="articles" />
    </div>
  );
}
