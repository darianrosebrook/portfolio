'use client';

import type { Article } from '@/types';
import Tiptap from '@/ui/modules/Tiptap/Tiptap';
import { slugify } from '@/utils/slugify';
import type { JSONContent } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ArticleMetadataForm } from './components/ArticleMetadataForm';
import { ArticlePreview } from './components/ArticlePreview';
import { EditorActions } from './components/EditorActions';
import { EditorLayout } from './components/EditorLayout';
import { SaveStatus } from './components/SaveStatus';
import { useAutoSave } from './hooks/useAutoSave';
import { useMetadataExtraction } from './hooks/useMetadataExtraction';

const LOCAL_STORAGE_KEY = 'draft-article-new';

/**
 * Generate a temporary slug for new articles
 * Uses timestamp to ensure uniqueness
 */
function generateTempSlug(): string {
  const timestamp = Date.now();
  return `draft-${timestamp}`;
}

/**
 * Notion-like article editor page
 * Full-featured editor with auto-save, metadata extraction, and preview
 */
export default function NewArticlePage() {
  // Generate a temporary slug immediately so auto-save can work
  const tempSlugRef = useRef<string>(generateTempSlug());

  const [article, setArticle] = useState<Partial<Article>>(() => {
    // Try to restore from localStorage on initial load
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Restore the saved draft
          return {
            ...parsed,
            // Use saved slug or generate new temp slug
            slug: parsed.slug || tempSlugRef.current,
          };
        } catch {
          // Invalid JSON, ignore
        }
      }
    }

    return {
      slug: tempSlugRef.current,
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
    };
  });
  const [articleId, setArticleId] = useState<number | undefined>();
  const [showPreview, setShowPreview] = useState(false);
  const [isManualSaving, setIsManualSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Extract metadata from content
  const extractedMetadata = useMetadataExtraction(
    article.articleBody as JSONContent
  );

  // Auto-update article with extracted metadata
  useEffect(() => {
    setArticle((prev) => {
      const newHeadline = prev.headline || extractedMetadata.headline || null;

      // Generate a proper slug from headline if we still have a temp slug
      let newSlug = prev.slug;
      if (extractedMetadata.headline && prev.slug?.startsWith('draft-')) {
        const generatedSlug = slugify(extractedMetadata.headline);
        if (generatedSlug && generatedSlug.length > 0) {
          newSlug = generatedSlug;
        }
      }

      return {
        ...prev,
        headline: newHeadline,
        description: prev.description || extractedMetadata.description || null,
        image: prev.image || extractedMetadata.coverImage || null,
        wordCount: extractedMetadata.wordCount,
        slug: newSlug || prev.slug,
      };
    });
  }, [extractedMetadata]);

  // Save to localStorage as a fallback for unsaved work
  useEffect(() => {
    if (typeof window !== 'undefined' && hasUnsavedChanges) {
      const toSave = {
        ...article,
        _savedAt: new Date().toISOString(),
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(toSave));
    }
  }, [article, hasUnsavedChanges]);

  // Clear localStorage when article is successfully saved to server
  const clearLocalDraft = useCallback(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
    setHasUnsavedChanges(false);
  }, []);

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
          clearLocalDraft();
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
        // Allow temp slugs (draft-timestamp) for auto-save
        const isValidSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanedData.slug);
        if (!cleanedData.slug || !isValidSlug) {
          // Don't throw for temp slugs during auto-save - just skip server save
          // The content is still saved to localStorage
          return;
        }

        const response = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanedData),
        });

        // Clone response before reading body to avoid "body stream already read" error
        const responseText = await response.text();

        if (!response.ok) {
          let errorMessage = 'Save failed';
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorMessage;
            if (errorData.details) {
              console.error('Validation errors:', errorData.details);
              errorMessage += `: ${JSON.stringify(errorData.details)}`;
            }
          } catch {
            errorMessage = responseText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const saved = JSON.parse(responseText);
        if (saved && Array.isArray(saved) && saved.length > 0) {
          setArticleId(saved[0].id);
          setArticle((prev) => ({
            ...prev,
            ...saved[0],
          }));
          clearLocalDraft();
        }
      }
    },
    [articleId, clearLocalDraft]
  );

  // Auto-save hook - always enabled since we have a temp slug
  const {
    saveStatus,
    lastSaved,
    error: saveError,
    manualSave,
  } = useAutoSave({
    article,
    onSave: handleSave,
    debounceMs: 2000,
    enabled: true, // Always enabled - we always have a slug (temp or real)
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
          onSave={handleManualSave}
          onPublish={handlePublish}
          onUnpublish={handleUnpublish}
          onPreview={() => setShowPreview(true)}
          isSaving={isManualSaving || saveStatus === 'saving'}
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
            setHasUnsavedChanges(true);
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
