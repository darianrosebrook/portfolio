'use client';

import type { Article } from '@/types';
import { slugify } from '@/utils/slugify';

interface ArticleMetadataFormProps {
  article: Partial<Article>;
  onChange: (updates: Partial<Article>) => void;
  extractedMetadata: {
    headline: string | null;
    description: string | null;
    coverImage: string | null;
    wordCount: number;
  };
}

/**
 * Article metadata form component
 * Sidebar form for editing article metadata fields
 */
export function ArticleMetadataForm({
  article,
  onChange,
  extractedMetadata,
}: ArticleMetadataFormProps) {
  const handleSlugChange = (value: string) => {
    onChange({ slug: slugify(value) });
  };

  const handleHeadlineChange = (value: string) => {
    onChange({ headline: value || null });
    // Auto-generate slug if slug is empty or matches old headline
    if (!article.slug || article.slug === slugify(article.headline || '')) {
      onChange({ slug: slugify(value) });
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px',
        background: 'var(--semantic-color-background-secondary)',
        borderRadius: 'var(--core-shape-radius-medium)',
        border: '1px solid var(--semantic-color-border-primary)',
      }}
    >
      <div>
        <label
          htmlFor="headline"
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '4px',
            color: 'var(--semantic-color-foreground-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Headline
        </label>
        <input
          id="headline"
          type="text"
          value={article.headline || extractedMetadata.headline || ''}
          onChange={(e) => handleHeadlineChange(e.target.value)}
          placeholder={extractedMetadata.headline || 'Enter headline...'}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '14px',
            border: '1px solid var(--semantic-color-border-primary)',
            borderRadius: 'var(--core-shape-radius-small)',
            background: 'var(--semantic-color-background-primary)',
            color: 'var(--semantic-color-foreground-primary)',
          }}
        />
      </div>

      <div>
        <label
          htmlFor="alternativeHeadline"
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '4px',
            color: 'var(--semantic-color-foreground-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Alternative Headline
        </label>
        <input
          id="alternativeHeadline"
          type="text"
          value={article.alternativeHeadline || ''}
          onChange={(e) =>
            onChange({ alternativeHeadline: e.target.value || null })
          }
          placeholder="Optional subtitle..."
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '14px',
            border: '1px solid var(--semantic-color-border-primary)',
            borderRadius: 'var(--core-shape-radius-small)',
            background: 'var(--semantic-color-background-primary)',
            color: 'var(--semantic-color-foreground-primary)',
          }}
        />
      </div>

      <div>
        <label
          htmlFor="description"
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '4px',
            color: 'var(--semantic-color-foreground-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Description
        </label>
        <textarea
          id="description"
          value={article.description || extractedMetadata.description || ''}
          onChange={(e) => onChange({ description: e.target.value || null })}
          placeholder={extractedMetadata.description || 'Enter description...'}
          rows={3}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '14px',
            border: '1px solid var(--semantic-color-border-primary)',
            borderRadius: 'var(--core-shape-radius-small)',
            background: 'var(--semantic-color-background-primary)',
            color: 'var(--semantic-color-foreground-primary)',
            resize: 'vertical',
          }}
        />
      </div>

      <div>
        <label
          htmlFor="keywords"
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '4px',
            color: 'var(--semantic-color-foreground-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Keywords
        </label>
        <input
          id="keywords"
          type="text"
          value={article.keywords || ''}
          onChange={(e) => onChange({ keywords: e.target.value || null })}
          placeholder="design, systems, ui"
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '14px',
            border: '1px solid var(--semantic-color-border-primary)',
            borderRadius: 'var(--core-shape-radius-small)',
            background: 'var(--semantic-color-background-primary)',
            color: 'var(--semantic-color-foreground-primary)',
          }}
        />
      </div>

      <div>
        <label
          htmlFor="articleSection"
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '4px',
            color: 'var(--semantic-color-foreground-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Section
        </label>
        <input
          id="articleSection"
          type="text"
          value={article.articleSection || ''}
          onChange={(e) => onChange({ articleSection: e.target.value || null })}
          placeholder="Design Systems"
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '14px',
            border: '1px solid var(--semantic-color-border-primary)',
            borderRadius: 'var(--core-shape-radius-small)',
            background: 'var(--semantic-color-background-primary)',
            color: 'var(--semantic-color-foreground-primary)',
          }}
        />
      </div>

      <div>
        <label
          htmlFor="slug"
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '4px',
            color: 'var(--semantic-color-foreground-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Slug
        </label>
        <input
          id="slug"
          type="text"
          value={article.slug || ''}
          onChange={(e) => handleSlugChange(e.target.value)}
          placeholder="article-slug"
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '14px',
            fontFamily: 'monospace',
            border: '1px solid var(--semantic-color-border-primary)',
            borderRadius: 'var(--core-shape-radius-small)',
            background: 'var(--semantic-color-background-primary)',
            color: 'var(--semantic-color-foreground-primary)',
          }}
        />
      </div>

      <div>
        <label
          htmlFor="image"
          style={{
            display: 'block',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '4px',
            color: 'var(--semantic-color-foreground-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}
        >
          Cover Image URL
        </label>
        <input
          id="image"
          type="url"
          value={article.image || extractedMetadata.coverImage || ''}
          onChange={(e) => onChange({ image: e.target.value || null })}
          placeholder={
            extractedMetadata.coverImage || 'https://example.com/image.jpg'
          }
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '14px',
            border: '1px solid var(--semantic-color-border-primary)',
            borderRadius: 'var(--core-shape-radius-small)',
            background: 'var(--semantic-color-background-primary)',
            color: 'var(--semantic-color-foreground-primary)',
          }}
        />
      </div>

      <div
        style={{
          padding: '8px 12px',
          background: 'var(--semantic-color-background-tertiary)',
          borderRadius: 'var(--core-shape-radius-small)',
          fontSize: '12px',
          color: 'var(--semantic-color-foreground-secondary)',
        }}
      >
        <strong>Word Count:</strong> {extractedMetadata.wordCount}
      </div>
    </div>
  );
}
