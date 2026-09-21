'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { formatLibraryDate } from '@/utils/editor/contentLibrary';
import { ConfirmDialog } from '@/app/dashboard/_components/ConfirmDialog';
import { ContentCard } from '@/app/dashboard/_components/ContentCard';
import { IconButton } from '@/app/dashboard/_components/IconButton';

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
    is_dirty?: boolean | null;
    image?: string | null;
    articleSection?: string | null;
  };
  onDelete?: (slug: string) => void;
}

/**
 * Articles-list adapter over the shared ContentCard. It keeps only the
 * article-specific behaviour (duplicate, delete-with-confirm, view live); the
 * card, status pill, icons and dialog are shared primitives.
 */
export function ArticleCard({ article, onDelete }: ArticleCardProps) {
  const router = useRouter();
  const [isConfirming, setIsConfirming] = useState(false);

  const displayTitle = article.headline || article.slug;
  const formattedDate = article.modified_at
    ? formatLibraryDate(article.modified_at)
    : null;
  const editHref = `/dashboard/articles/${article.slug}`;

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

  const confirmDelete = async () => {
    try {
      const url = `/api/articles/${encodeURIComponent(article.slug)}`;
      const response = await fetch(url, { method: 'DELETE' });
      if (response.ok) {
        onDelete?.(article.slug);
        router.refresh();
      } else {
        const errorText = await response.text();
        console.error('Delete failed:', response.status, errorText);
      }
    } catch (error) {
      console.error('Failed to delete article:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <>
      <ContentCard
        href={editHref}
        title={displayTitle}
        description={article.description}
        status={article.status}
        // A draft has no published version to differ from, so "unpublished
        // changes" only applies to a published article with working edits.
        changes={article.status === 'published' && article.is_dirty === true}
        kind="Article"
        section={article.articleSection ?? null}
        image={article.image ?? null}
        date={formattedDate}
        wordCount={article.wordCount}
        actions={
          <>
            <IconButton
              icon="edit"
              label="Edit article"
              onClick={() => router.push(editHref)}
            />
            {article.status === 'published' && (
              <IconButton
                icon="view"
                label="View published article"
                onClick={() =>
                  window.open(`/articles/${article.slug}`, '_blank')
                }
              />
            )}
            <IconButton
              icon="duplicate"
              label="Duplicate article"
              onClick={handleDuplicate}
            />
            <IconButton
              icon="delete"
              label="Delete article"
              variant="danger"
              onClick={() => setIsConfirming(true)}
            />
          </>
        }
      />

      <ConfirmDialog
        open={isConfirming}
        title="Delete Article"
        description={
          <>
            Are you sure you want to delete &ldquo;{displayTitle}&rdquo;? This
            action cannot be undone.
            {article.status === 'published' && (
              <>
                {' '}
                The live article at /articles/{article.slug} will immediately
                return a 404.
              </>
            )}
          </>
        }
        confirmLabel="Delete"
        danger
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirming(false)}
      />
    </>
  );
}
