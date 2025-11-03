'use client';

import type { Article } from '@/types';
import Tiptap from '@/ui/modules/Tiptap/Tiptap';
import { slugify } from '@/utils/slugify';
import type { JSONContent } from '@tiptap/react';
import { useCallback, useEffect, useState } from 'react';
import { ArticleMetadataForm } from './components/ArticleMetadataForm';
import { ArticlePreview } from './components/ArticlePreview';
import { EditorActions } from './components/EditorActions';
import { EditorLayout } from './components/EditorLayout';
import { SaveStatus } from './components/SaveStatus';
import { useAutoSave } from './hooks/useAutoSave';
import { useMetadataExtraction } from './hooks/useMetadataExtraction';

/**
 * Notion-like article editor page
 * Full-featured editor with auto-save, metadata extraction, and preview
 */
export default function NewArticlePage() {
  const [article, setArticle] = useState<Partial<Article>>({
    slug: '',
    headline: '',
    articleBody: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [],
        },
      ],
    },
    status: 'draft',
    wordCount: 0,
  });
  const [articleId, setArticleId] = useState<number | undefined>();
  const [showPreview, setShowPreview] = useState(false);
  const [isManualSaving, setIsManualSaving] = useState(false);

  // Extract metadata from content
  const extractedMetadata = useMetadataExtraction(
    article.articleBody as JSONContent
  );

  // Auto-update article with extracted metadata
  useEffect(() => {
    setArticle((prev) => ({
      ...prev,
      headline: prev.headline || extractedMetadata.headline || null,
      description: prev.description || extractedMetadata.description || null,
      image: prev.image || extractedMetadata.coverImage || null,
      wordCount: extractedMetadata.wordCount,
      // Auto-generate slug if empty and headline exists
      slug:
        prev.slug ||
        (extractedMetadata.headline ? slugify(extractedMetadata.headline) : ''),
    }));
  }, [extractedMetadata]);

  // Save function for auto-save
  const handleSave = useCallback(
    async (
      articleToSave: Partial<Article> & {
        articleBody?: JSONContent | null | unknown;
      }
    ) => {
      if (!articleToSave.slug) {
        throw new Error('Slug is required');
      }

      // Check if article exists (has ID)
      if (articleId) {
        // Update existing article - use PATCH for working draft
        const response = await fetch(`/api/articles/${articleToSave.slug}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workingBody: articleToSave.articleBody,
            workingHeadline: articleToSave.headline,
            workingDescription: articleToSave.description,
            workingImage: articleToSave.image,
            workingKeywords: articleToSave.keywords,
            workingArticleSection: articleToSave.articleSection,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Save failed: ${errorText}`);
        }

        const saved = await response.json();
        if (saved && Array.isArray(saved) && saved.length > 0) {
          setArticleId(saved[0].id);
        }
      } else {
        // Create new article
        // Clean up data: convert undefined to null, ensure slug is valid
        const cleanedData = {
          slug: articleToSave.slug || '',
          headline: articleToSave.headline || null,
          description: articleToSave.description || null,
          articleBody: articleToSave.articleBody || null,
          articleSection: articleToSave.articleSection || null,
          keywords: articleToSave.keywords || null,
          image: articleToSave.image || null,
          status: articleToSave.status || 'draft',
          wordCount: articleToSave.wordCount || null,
        };

        // Validate slug format before sending
        if (
          !cleanedData.slug ||
          !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanedData.slug)
        ) {
          throw new Error(
            'Invalid slug format. Slug must be lowercase letters, numbers, and hyphens only.'
          );
        }

        const response = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanedData),
        });

        if (!response.ok) {
          let errorMessage = 'Save failed';
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
            if (errorData.details) {
              console.error('Validation errors:', errorData.details);
              errorMessage += `: ${JSON.stringify(errorData.details)}`;
            }
          } catch {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const saved = await response.json();
        if (saved && Array.isArray(saved) && saved.length > 0) {
          setArticleId(saved[0].id);
          setArticle((prev) => ({
            ...prev,
            ...saved[0],
          }));
        }
      }
    },
    [articleId]
  );

  // Auto-save hook
  const {
    saveStatus,
    lastSaved,
    error: saveError,
    manualSave,
  } = useAutoSave({
    article,
    onSave: handleSave,
    debounceMs: 2000,
    enabled: !!article.slug && article.slug !== '',
  });

  // Manual save handler with better error handling
  const handleManualSave = useCallback(async () => {
    if (!article.slug) {
      alert('Please provide a slug before saving.');
      return;
    }

    setIsManualSaving(true);
    try {
      await manualSave();
    } catch (err) {
      console.error('Manual save failed:', err);
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to save article. Please try again.'
      );
    } finally {
      setIsManualSaving(false);
    }
  }, [manualSave, article.slug]);

  // Publish handler with validation
  const handlePublish = useCallback(async () => {
    if (!article.slug || !article.headline) {
      alert('Please provide a headline and slug before publishing.');
      return;
    }

    setIsManualSaving(true);
    try {
      // Use PUT to publish (moves working draft to published)
      const response = await fetch(`/api/articles/${article.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...article,
          status: 'published',
          published_at: article.published_at || new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        let errorMessage = response.statusText;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        }
        throw new Error(`Publish failed: ${errorMessage}`);
      }

      const saved = await response.json();
      if (saved && Array.isArray(saved) && saved.length > 0) {
        setArticle((prev) => ({
          ...prev,
          ...saved[0],
        }));
      }
    } catch (err) {
      console.error('Publish failed:', err);
      alert(
        err instanceof Error
          ? err.message
          : 'Failed to publish article. Please try again.'
      );
    } finally {
      setIsManualSaving(false);
    }
  }, [article]);

  // Unpublish handler
  const handleUnpublish = useCallback(async () => {
    if (!article.slug) {
      return;
    }

    setIsManualSaving(true);
    try {
      const response = await fetch(`/api/articles/${article.slug}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...article,
          status: 'draft',
          published_at: null,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Unpublish failed: ${errorText}`);
      }

      const saved = await response.json();
      if (saved && Array.isArray(saved) && saved.length > 0) {
        setArticle((prev) => ({
          ...prev,
          ...saved[0],
        }));
      }
    } catch (err) {
      console.error('Unpublish failed:', err);
    } finally {
      setIsManualSaving(false);
    }
  }, [article]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (article.slug) {
          handleManualSave();
        }
      }

      // Ctrl/Cmd + P to preview
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        if (article.articleBody) {
          setShowPreview(true);
        }
      }

      // Escape to close preview
      if (e.key === 'Escape' && showPreview) {
        setShowPreview(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [article.slug, article.articleBody, showPreview, handleManualSave]);

  if (showPreview) {
    return (
      <ArticlePreview article={article} onClose={() => setShowPreview(false)} />
    );
  }

  return (
    <EditorLayout
      sidebar={
        <ArticleMetadataForm
          article={article}
          onChange={(updates) =>
            setArticle((prev) => ({ ...prev, ...updates }))
          }
          extractedMetadata={extractedMetadata}
        />
      }
      actions={
        <EditorActions
          article={article}
          onSave={handleManualSave}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onPreview={() => setShowPreview(true)}
          isSaving={isManualSaving || saveStatus === 'saving'}
          status={article.status || 'draft'}
        />
      }
      saveStatus={
        <SaveStatus
          status={saveStatus}
          lastSaved={lastSaved}
          error={saveError}
        />
      }
    >
      <div
        style={{
          minHeight: '400px',
        }}
      >
        <Tiptap
          key={`editor-${articleId || 'new'}`}
          article={article as Article}
          handleUpdate={(updated) => {
            setArticle((prev) => ({
              ...prev,
              ...updated,
              wordCount: extractedMetadata.wordCount,
            }));
          }}
          editable={true}
          autofocus={true}
        />
      </div>
    </EditorLayout>
  );
}
