'use client';

import type { Article } from '@/types';
import Button from '@/ui/components/Button';

interface EditorActionsProps {
  article: Partial<Article>;
  onSave: () => Promise<void>;
  onPublish: () => Promise<void>;
  onUnpublish: () => Promise<void>;
  onPreview: () => void;
  isSaving: boolean;
  status: Article['status'];
}

/**
 * Editor action buttons component
 * Provides save, publish, unpublish, and preview actions
 */
export function EditorActions({
  article,
  onSave,
  onPublish,
  onUnpublish,
  onPreview,
  isSaving,
  status,
}: EditorActionsProps) {
  const canPublish =
    article.headline &&
    article.slug &&
    article.articleBody &&
    article.slug.length > 0 &&
    article.headline.length > 0;

  const isPublished = status === 'published';

  const getPublishErrorMessage = () => {
    if (!article.slug) return 'Slug is required';
    if (!article.headline) return 'Headline is required';
    if (!article.articleBody) return 'Content is required';
    return null;
  };

  const handlePublishClick = () => {
    const error = getPublishErrorMessage();
    if (error) {
      alert(error);
      return;
    }
    onPublish();
  };

  return (
    <div
      style={{
        display: 'flex',
        gap: '8px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}
    >
      <Button
        onClick={onPreview}
        disabled={!article.articleBody}
        variant="secondary"
        title="Preview article (Ctrl/Cmd + P)"
      >
        Preview
      </Button>

      <Button
        onClick={onSave}
        disabled={isSaving || !article.slug}
        variant="secondary"
        title="Save draft (Ctrl/Cmd + S)"
      >
        {isSaving ? 'Saving...' : 'Save Draft'}
      </Button>

      {isPublished ? (
        <Button
          onClick={onUnpublish}
          disabled={isSaving}
          variant="destructive"
          title="Unpublish article"
        >
          Unpublish
        </Button>
      ) : (
        <Button
          onClick={handlePublishClick}
          disabled={isSaving || !canPublish}
          variant="primary"
          title={
            canPublish
              ? 'Publish article'
              : getPublishErrorMessage() || 'Fill required fields to publish'
          }
        >
          Publish
        </Button>
      )}
    </div>
  );
}
