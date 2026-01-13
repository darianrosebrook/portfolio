'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from '../articles.module.scss';

interface ArticleCardProps {
  article: {
    id: number;
    slug: string;
    headline: string | null;
    description?: string | null;
    status: 'draft' | 'published' | 'archived';
    modified_at: string | null;
    published_at?: string | null;
    wordCount?: number | null;
  };
  onDelete?: (slug: string) => void;
}

export function ArticleCard({ article, onDelete }: ArticleCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const displayTitle = article.headline || article.slug;
  const formattedDate = article.modified_at
    ? new Date(article.modified_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null;

  const handleEdit = () => {
    router.push(`/dashboard/articles/${article.slug}`);
  };

  const handleView = () => {
    window.open(`/articles/${article.slug}`, '_blank');
  };

  const handleDuplicate = async () => {
    try {
      const response = await fetch(`/api/articles/${article.slug}/duplicate`, {
        method: 'POST',
      });
      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to duplicate article:', error);
    }
  };

  const handleDelete = () => {
    setIsDeleting(true);
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch(`/api/articles/${article.slug}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        onDelete?.(article.slug);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to delete article:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <article className={styles.articleCard}>
        <div className={styles.articleContent}>
          <div className={styles.articleHeader}>
            <h3 className={styles.articleTitle}>
              <Link href={`/dashboard/articles/${article.slug}`}>
                {displayTitle}
              </Link>
            </h3>
            <span className={styles.statusBadge} data-status={article.status}>
              <span className={styles.statusDot} />
              {article.status}
            </span>
          </div>

          {article.description && (
            <p className={styles.articleDescription}>{article.description}</p>
          )}

          <div className={styles.articleMeta}>
            {formattedDate && (
              <span className={styles.metaItem}>
                <svg
                  className={styles.metaIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {formattedDate}
              </span>
            )}
            {article.wordCount && article.wordCount > 0 && (
              <span className={styles.metaItem}>
                <svg
                  className={styles.metaIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
                {article.wordCount.toLocaleString()} words
              </span>
            )}
            <span className={styles.metaItem}>
              <svg
                className={styles.metaIcon}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
              </svg>
              /{article.slug}
            </span>
          </div>
        </div>

        <div className={styles.articleActions}>
          <button
            className={styles.actionButton}
            onClick={handleEdit}
            title="Edit article"
            aria-label="Edit article"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>

          {article.status === 'published' && (
            <button
              className={styles.actionButton}
              onClick={handleView}
              title="View published article"
              aria-label="View published article"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </button>
          )}

          <button
            className={styles.actionButton}
            onClick={handleDuplicate}
            title="Duplicate article"
            aria-label="Duplicate article"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>

          <button
            className={styles.actionButton}
            onClick={handleDelete}
            title="Delete article"
            aria-label="Delete article"
            data-variant="danger"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </button>
        </div>
      </article>

      {/* Delete Confirmation Dialog */}
      {isDeleting && (
        <div
          className={styles.dialogOverlay}
          onClick={() => setIsDeleting(false)}
        >
          <div
            className={styles.dialogContent}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className={styles.dialogTitle}>Delete Article</h2>
            <p className={styles.dialogDescription}>
              Are you sure you want to delete &ldquo;{displayTitle}&rdquo;? This
              action cannot be undone.
            </p>
            <div className={styles.dialogActions}>
              <button
                className={styles.actionButton}
                onClick={() => setIsDeleting(false)}
                style={{
                  width: 'auto',
                  padding: '8px 16px',
                  border: '1px solid var(--semantic-color-border-default)',
                }}
              >
                Cancel
              </button>
              <button
                className={styles.actionButton}
                onClick={confirmDelete}
                data-variant="danger"
                style={{
                  width: 'auto',
                  padding: '8px 16px',
                  background: 'var(--semantic-color-background-danger-strong)',
                  color: 'var(--semantic-color-foreground-on-brand)',
                  border: 'none',
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
