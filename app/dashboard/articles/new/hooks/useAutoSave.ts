import type { Article } from '@/types';
import type { JSONContent } from '@tiptap/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'local';

interface UseAutoSaveOptions {
  article: Partial<Article> & { articleBody?: JSONContent | null | unknown };
  onSave: (
    article: Partial<Article> & { articleBody?: JSONContent | null | unknown }
  ) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  saveStatus: SaveStatus;
  lastSaved: Date | null;
  error: string | null;
  manualSave: () => Promise<void>;
}

/**
 * Auto-save hook with debouncing
 * Saves article changes automatically after typing stops
 */
export function useAutoSave({
  article,
  onSave,
  debounceMs = 2000,
  enabled = true,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousContentRef = useRef<string | null>(null);
  const articleRef = useRef(article);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const requestRevisionRef = useRef(0);

  useEffect(() => {
    articleRef.current = article;
  }, [article]);

  const performSave = useCallback(
    async (snapshot: typeof article, propagateError: boolean) => {
      if (!enabled) {
        return;
      }

      // If no slug, we can't save to server but content is saved locally
      if (!snapshot.slug) {
        setSaveStatus('local');
        setLastSaved(new Date());
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
        return;
      }

      setSaveStatus('saving');
      setError(null);
      const revision = ++requestRevisionRef.current;

      const queuedSave = saveQueueRef.current
        .catch(() => undefined)
        .then(() => onSave(snapshot));
      saveQueueRef.current = queuedSave.catch(() => undefined);

      try {
        await queuedSave;
        if (revision === requestRevisionRef.current) {
          setSaveStatus('saved');
          setLastSaved(new Date());

          setTimeout(() => {
            if (revision === requestRevisionRef.current) {
              setSaveStatus('idle');
            }
          }, 2000);
        }
      } catch (err) {
        // Check if this is a "skipped" save (waiting for valid slug)
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to save';
        if (errorMessage.includes('Skipping server save')) {
          setSaveStatus('local');
          setLastSaved(new Date());
          setTimeout(() => {
            setSaveStatus('idle');
          }, 2000);
        } else {
          if (revision === requestRevisionRef.current) {
            setSaveStatus('error');
            setError(errorMessage);
          }
          if (propagateError) throw err;
        }
      }
    },
    [enabled, onSave]
  );

  const manualSave = async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const snapshot = articleRef.current;
    previousContentRef.current = serializeArticle(snapshot);
    await performSave(snapshot, true);
  };

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Serialize content for comparison
    const currentContent = serializeArticle(article);

    // Establish the loaded/restored content as the baseline. Opening the
    // editor must not create a server-side working draft by itself.
    if (previousContentRef.current === null) {
      previousContentRef.current = currentContent;
      return;
    }

    // Skip if content hasn't changed
    if (currentContent === previousContentRef.current) {
      return;
    }

    previousContentRef.current = currentContent;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      void performSave(article, false);
    }, debounceMs);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [article, enabled, debounceMs, performSave]);

  return {
    saveStatus,
    lastSaved,
    error,
    manualSave,
  };
}

function serializeArticle(article: UseAutoSaveOptions['article']): string {
  return JSON.stringify({
    articleBody: article.articleBody,
    headline: article.headline,
    description: article.description,
    keywords: article.keywords,
    articleSection: article.articleSection,
    image: article.image,
    slug: article.slug,
    wordCount: article.wordCount,
  });
}
