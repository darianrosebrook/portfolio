import type { Article } from '@/types';
import type { JSONContent } from '@tiptap/react';
import { useEffect, useRef, useState } from 'react';

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

  const performSave = async () => {
    if (!enabled) {
      return;
    }

    // If no slug, we can't save to server but content is saved locally
    if (!article.slug) {
      setSaveStatus('local');
      setLastSaved(new Date());
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
      return;
    }

    setSaveStatus('saving');
    setError(null);

    try {
      await onSave(article);
      setSaveStatus('saved');
      setLastSaved(new Date());

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (err) {
      // Check if this is a "skipped" save (waiting for valid slug)
      const errorMessage = err instanceof Error ? err.message : 'Failed to save';
      if (errorMessage.includes('Skipping server save')) {
        setSaveStatus('local');
        setLastSaved(new Date());
        setTimeout(() => {
          setSaveStatus('idle');
        }, 2000);
      } else {
      setSaveStatus('error');
        setError(errorMessage);
      }
    }
  };

  const manualSave = async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    await performSave();
  };

  useEffect(() => {
    if (!enabled) {
      return;
    }

    // Serialize content for comparison
    const currentContent = JSON.stringify({
      articleBody: article.articleBody,
      headline: article.headline,
      description: article.description,
      keywords: article.keywords,
      articleSection: article.articleSection,
      image: article.image,
    });

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
      performSave();
    }, debounceMs);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [article, enabled, debounceMs]);

  return {
    saveStatus,
    lastSaved,
    error,
    manualSave,
  };
}
