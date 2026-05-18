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
import { useToast } from '@/ui/components/Toast';

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
  const { enqueue } = useToast();

  // First render must match the server: use the empty default. We load any
  // localStorage-saved draft in a useEffect below, after hydration. Reading
  // localStorage in the useState initializer would diverge from SSR and
  // trigger a hydration mismatch (the server always renders the empty state).
  const [article, setArticle] = useState<Partial<Article>>(() => ({
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
  }));
  const [articleId, setArticleId] = useState<number | undefined>();
  const [showPreview, setShowPreview] = useState(false);
  const [isManualSaving, setIsManualSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);

  // Restore localStorage-saved draft after first paint. This guarantees the
  // server-rendered HTML and the initial client render are identical; the
  // draft fills in on the next commit.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setArticle((prev) => ({
          ...prev,
          ...parsed,
          slug: parsed.slug || prev.slug,
        }));
      } catch {
        // Invalid JSON, drop it so it doesn't keep failing on every mount.
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
    setHasHydrated(true);
    // Run once on mount; setArticle is stable.
  }, []);

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
            workingbody: articleToSave.articleBody,
            workingheadline: articleToSave.headline,
            workingdescription: articleToSave.description,
            workingimage: articleToSave.image,
            workingkeywords: articleToSave.keywords,
            workingarticlesection: articleToSave.articleSection,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Save failed: ${errorText}`);
        }

        const saved = await response.json();
        if (saved && Array.isArray(saved) && saved.length > 0) {
          setArticleId(saved[0].id);
          // Sync with server state (this will include lowercase working* columns)
          setArticle((prev) => ({
            ...prev,
            ...saved[0],
          }));
          clearLocalDraft();
        }
      } else {
        // Create new article
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

        const isValidSlug = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanedData.slug);
        if (!cleanedData.slug || !isValidSlug) {
          return;
        }

        const response = await fetch('/api/articles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(cleanedData),
        });

        const responseText = await response.text();

        if (!response.ok) {
          let errorMessage = 'Save failed';
          try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.error || errorMessage;
            if (errorData.details) {
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
          enqueue({
            title: 'Article Created',
            description: 'Your draft has been created successfully.',
          });
        }
      }
    },
    [articleId, clearLocalDraft, enqueue]
  );

  // Auto-save hook. We disable it until the localStorage-restore effect has
  // run, so we don't fire a POST with the empty initial state moments before
  // the saved draft replaces it.
  const {
    saveStatus,
    lastSaved,
    error: saveError,
    manualSave,
  } = useAutoSave({
    article,
    onSave: handleSave,
    debounceMs: 2000,
    enabled: hasHydrated,
  });

  // Manual save handler with better error handling
  const handleManualSave = useCallback(async () => {
    if (!article.slug) {
      enqueue({
        title: 'Slug required',
        description: 'Please provide a slug before saving.',
      });
      return;
    }

    setIsManualSaving(true);
    try {
      await manualSave();
      enqueue({
        title: 'Draft Saved',
        description: 'Your changes have been saved to the server.',
      });
    } catch (err) {
      console.error('Manual save failed:', err);
      enqueue({
        title: 'Save Failed',
        description:
          err instanceof Error ? err.message : 'Failed to save article.',
      });
    } finally {
      setIsManualSaving(false);
    }
  }, [manualSave, article.slug, enqueue]);

  // Publish handler with validation
  const handlePublish = useCallback(async () => {
    if (!article.slug || !article.headline) {
      enqueue({
        title: 'Missing information',
        description: 'Please provide a headline and slug before publishing.',
      });
      return;
    }

    // The publish slug must look like a real one — refuse to publish a
    // generated `draft-<timestamp>` slug, since that signals the user never
    // gave the article a real URL. The metadata form normally enforces this,
    // but Publish is the last line of defense.
    const isPlaceholderSlug = /^draft-\d+$/.test(article.slug);
    if (isPlaceholderSlug) {
      enqueue({
        title: 'Set a slug first',
        description:
          'Please set a permanent slug (lowercase letters, numbers, hyphens) before publishing.',
      });
      return;
    }

    setIsManualSaving(true);
    try {
      // Force a save before publishing. PUT's publish branch reads the
      // existing row's working_* fields, so the row must exist. Without this,
      // a user who clicks Publish before the 2s autosave debounce fires gets
      // a 404 from PostgREST. manualSave() is idempotent — if there's nothing
      // new to persist, it's a no-op against the server.
      await manualSave();

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
        throw new Error(errorMessage);
      }

      const saved = await response.json();
      if (saved && Array.isArray(saved) && saved.length > 0) {
        setArticle((prev) => ({
          ...prev,
          ...saved[0],
        }));
        enqueue({
          title: 'Article Published',
          description: 'Your article is now live!',
        });
      }
    } catch (err) {
      console.error('Publish failed:', err);
      enqueue({
        title: 'Publish Failed',
        description:
          err instanceof Error ? err.message : 'Failed to publish article.',
      });
    } finally {
      setIsManualSaving(false);
    }
  }, [article, enqueue, manualSave]);

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
