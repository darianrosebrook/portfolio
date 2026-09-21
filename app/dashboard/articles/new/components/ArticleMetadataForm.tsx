'use client';

import type { Article } from '@/types';
import { slugify, slugifyInput } from '@/utils/slugify';
import styles from './ArticleMetadataForm.module.css';
import { EditorActions } from './EditorActions';

interface ArticleMetadataFormProps {
  article: Partial<Article>;
  onChange: (updates: Partial<Article>) => void;
  extractedMetadata: {
    headline: string | null;
    description: string | null;
    coverImage: string | null;
    wordCount: number;
  };
  onSave?: () => Promise<void>;
  onPublish?: () => Promise<void>;
  onUnpublish?: () => Promise<void>;
  onPreview?: () => void;
  isSaving?: boolean;
}

/**
 * Article metadata form component
 * Sidebar form for editing article metadata fields
 */
export function ArticleMetadataForm({
  article,
  onChange,
  extractedMetadata,
  onSave,
  onPublish,
  onUnpublish,
  onPreview,
  isSaving = false,
}: ArticleMetadataFormProps) {
  const handleSlugChange = (value: string) => {
    // slugifyInput keeps one trailing hyphen so the next typed character can
    // join it; slugify() would trim it mid-word and concatenate the words.
    onChange({ slug: slugifyInput(value) });
  };

  const handleSlugBlur = () => {
    const normalized = slugify(article.slug || '');
    if (normalized !== (article.slug || '')) onChange({ slug: normalized });
  };

  const handleHeadlineChange = (value: string) => {
    // Empty string is an intentional override. `undefined` means the field is
    // still managed by content extraction; collapsing both states to null made
    // extracted values impossible to clear.
    onChange({ headline: value });
    // Auto-generate slug if slug is empty or matches old headline
    if (!article.slug || article.slug === slugify(article.headline || '')) {
      onChange({ slug: slugify(value) });
    }
  };

  return (
    <div>
      <h3 className={styles.title}>Settings</h3>
      {(onSave || onPublish || onPreview) && (
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '24px' }}>
          <EditorActions
            article={article}
            onSave={onSave || (async () => {})}
            onPublish={onPublish || (async () => {})}
            onUnpublish={onUnpublish || (async () => {})}
            onPreview={onPreview || (() => {})}
            isSaving={isSaving}
            status={article.status || 'draft'}
          />
        </div>
      )}
      <div className={styles.form}>
        <div className={styles.field}>
          <label htmlFor="headline" className={styles.label}>
            Headline
          </label>
          <input
            id="headline"
            type="text"
            value={article.headline ?? extractedMetadata.headline ?? ''}
            onChange={(e) => handleHeadlineChange(e.target.value)}
            placeholder={extractedMetadata.headline || 'Enter headline...'}
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="description" className={styles.label}>
            Description
          </label>
          <textarea
            id="description"
            value={article.description ?? extractedMetadata.description ?? ''}
            onChange={(e) => onChange({ description: e.target.value })}
            placeholder={
              extractedMetadata.description || 'Enter description...'
            }
            rows={3}
            className={styles.textarea}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="keywords" className={styles.label}>
            Keywords
          </label>
          <input
            id="keywords"
            type="text"
            value={article.keywords || ''}
            onChange={(e) => onChange({ keywords: e.target.value || null })}
            placeholder="design, systems, ui"
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="articleSection" className={styles.label}>
            Section
          </label>
          <input
            id="articleSection"
            type="text"
            value={article.articleSection || ''}
            onChange={(e) =>
              onChange({ articleSection: e.target.value || null })
            }
            placeholder="Design Systems"
            className={styles.input}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="slug" className={styles.label}>
            Slug
          </label>
          <input
            id="slug"
            type="text"
            value={article.slug || ''}
            onChange={(e) => handleSlugChange(e.target.value)}
            onBlur={handleSlugBlur}
            placeholder="article-slug"
            className={`${styles.input} ${styles.monospace}`}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="image" className={styles.label}>
            Cover Image URL
          </label>
          <input
            id="image"
            type="url"
            value={article.image ?? extractedMetadata.coverImage ?? ''}
            onChange={(e) => onChange({ image: e.target.value })}
            placeholder={
              extractedMetadata.coverImage || 'https://example.com/image.jpg'
            }
            className={styles.input}
          />
        </div>

        <div className={styles.wordCount}>
          <strong>Word Count:</strong> {extractedMetadata.wordCount}
        </div>
      </div>
    </div>
  );
}
