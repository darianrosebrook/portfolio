import type { Article } from '@/types';
import { draftFingerprint } from '@/utils/editor/newDraftRecovery';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'local';

interface UseAutoSaveOptions {
  article: Partial<Article>;
  onSave: (article: Partial<Article>) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
}

/** Serializes autosave and explicit saves through the same request queue. */
export function useAutoSave({
  article,
  onSave,
  debounceMs = 2000,
  enabled = true,
}: UseAutoSaveOptions) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [savedFingerprint, setSavedFingerprint] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const articleRef = useRef(article);
  const onSaveRef = useRef(onSave);
  const enabledRef = useRef(enabled);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previousContentRef = useRef<string | null>(null);
  const savedContentRef = useRef<string | null>(null);
  const queueRef = useRef<Promise<void>>(Promise.resolve());
  const mountedRef = useRef(true);
  const revisionRef = useRef(0);
  useLayoutEffect(() => {
    articleRef.current = article;
    onSaveRef.current = onSave;
    enabledRef.current = enabled;
  }, [article, onSave, enabled]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const performSave = useCallback((snapshot: Partial<Article>) => {
    if (!enabledRef.current) return Promise.resolve();
    if (!snapshot.slug) {
      setSaveStatus('local');
      return Promise.reject(
        new Error('Set a slug before saving to the server.')
      );
    }
    const fingerprint = draftFingerprint(snapshot);
    const revision = ++revisionRef.current;
    setSaveStatus('saving');
    setError(null);
    const operation = queueRef.current
      .catch(() => undefined)
      .then(async () => {
        if (savedContentRef.current !== fingerprint) {
          // Resolve the callback when the queued request starts; creation may
          // have assigned a server identity while an earlier request ran.
          await onSaveRef.current(snapshot);
          savedContentRef.current = fingerprint;
        }
      });
    queueRef.current = operation;
    return operation.then(
      () => {
        if (!mountedRef.current || revision !== revisionRef.current) return;
        setLastSaved(new Date());
        setSavedFingerprint(fingerprint);
        setSaveStatus(
          draftFingerprint(articleRef.current) === fingerprint
            ? 'saved'
            : 'local'
        );
      },
      (failure: unknown) => {
        if (mountedRef.current && revision === revisionRef.current) {
          setSaveStatus('error');
          setError(
            failure instanceof Error ? failure.message : 'Failed to save'
          );
        }
        throw failure;
      }
    );
  }, []);

  const manualSave = useCallback(async () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = null;
    await performSave(articleRef.current);
  }, [performSave]);

  const fingerprint = draftFingerprint(article);
  useEffect(() => {
    if (!enabled) return;
    if (previousContentRef.current === null) {
      previousContentRef.current = fingerprint;
      return;
    }
    if (fingerprint === previousContentRef.current) return;
    previousContentRef.current = fingerprint;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      timeoutRef.current = null;
      void performSave(articleRef.current).catch(() => undefined);
    }, debounceMs);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [fingerprint, enabled, debounceMs, performSave]);

  const currentStatus: SaveStatus =
    saveStatus === 'saved' && savedFingerprint !== fingerprint
      ? 'local'
      : saveStatus;
  return { saveStatus: currentStatus, lastSaved, error, manualSave };
}
