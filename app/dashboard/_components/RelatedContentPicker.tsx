'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  RELATIONSHIP_META,
  RELATIONSHIP_TYPES,
  contentHref,
  type ContentSearchResult,
  type ContentType,
  type RelatedContentItem,
  type RelationshipType,
} from '@/utils/supabase/contentRelations';
import styles from './RelatedContentPicker.module.css';

type SyncStatus = 'idle' | 'saving' | 'saved' | 'error';

interface RelatedContentPickerProps {
  /** Route slug of the item being edited, as known to the server. */
  slug: string;
  contentType: ContentType;
  /** Numeric id used to exclude the item from its own search results. */
  excludeId?: number;
  /** Records must exist on the server before relations can be stored. */
  disabled?: boolean;
}

const SEARCH_DEBOUNCE_MS = 300;
const SYNC_DEBOUNCE_MS = 700;

function apiBase(contentType: ContentType, slug: string): string {
  const collection = contentType === 'article' ? 'articles' : 'case-studies';
  return `/api/${collection}/${encodeURIComponent(slug)}/relations`;
}

/**
 * Explicit "related content" relations for an article or case study.
 *
 * Loads the declared relations on mount, syncs the full set (debounced) on
 * every change, and searches via /api/search-content. Inline [[links]] in
 * the editor are a separate axis and do not appear here.
 */
export function RelatedContentPicker({
  slug,
  contentType,
  excludeId,
  disabled = false,
}: RelatedContentPickerProps) {
  const [items, setItems] = useState<RelatedContentItem[]>([]);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ContentSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const syncQueueRef = useRef<Promise<void>>(Promise.resolve());
  const loadedSlugRef = useRef<string | null>(null);

  // Load declared relations whenever the target slug changes.
  useEffect(() => {
    if (disabled || !slug) return;
    if (loadedSlugRef.current === slug) return;

    const controller = new AbortController();
    loadedSlugRef.current = slug;

    (async () => {
      try {
        const response = await fetch(apiBase(contentType, slug), {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('Failed to load relations');
        const { relations } = await response.json();
        if (!controller.signal.aborted && Array.isArray(relations)) {
          setItems(relations);
        }
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Failed to load relations:', error);
        }
      }
    })();

    return () => controller.abort();
  }, [slug, contentType, disabled]);

  // Debounced search while typing. Whether a search is active is derived during
  // render instead of being cleared from the effect body, and the pending flag is
  // raised inside the timer, so the effect performs no synchronous state update.
  const trimmedQuery = query.trim();
  const searchActive = !disabled && trimmedQuery.length >= 2;
  const shownResults = searchActive ? results : [];
  const shownSearching = searchActive && searching;

  useEffect(() => {
    if (!searchActive) return;

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const params = new URLSearchParams({
          q: trimmedQuery,
          excludeType: contentType,
          limit: '6',
        });
        if (excludeId != null) params.set('excludeId', String(excludeId));
        const response = await fetch(`/api/search-content?${params}`);
        if (!response.ok) throw new Error('Search failed');
        const { data } = await response.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Related content search failed:', error);
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [searchActive, trimmedQuery, contentType, excludeId]);

  const scheduleSync = useCallback(
    (nextItems: RelatedContentItem[]) => {
      if (disabled || !slug) return;
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);

      syncTimerRef.current = setTimeout(() => {
        syncTimerRef.current = null;
        setSyncStatus('saving');

        const task = syncQueueRef.current
          .catch(() => undefined)
          .then(async () => {
            const response = await fetch(apiBase(contentType, slug), {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                items: nextItems.map((item) => ({
                  id: item.id,
                  type: item.type,
                  relationship_type: item.relationship_type,
                })),
              }),
            });
            if (!response.ok) {
              throw new Error('Failed to save relations');
            }
            setSyncStatus('saved');
          });

        syncQueueRef.current = task.catch(() => {
          setSyncStatus('error');
        });
      }, SYNC_DEBOUNCE_MS);
    },
    [contentType, slug, disabled]
  );

  useEffect(() => {
    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, []);

  const addItem = (result: ContentSearchResult) => {
    if (
      items.some((item) => item.id === result.id && item.type === result.type)
    ) {
      return;
    }
    const next = [
      ...items,
      {
        id: result.id,
        type: result.type,
        title: result.title,
        slug: result.slug,
        description: result.description,
        relationship_type: 'related' as RelationshipType,
      },
    ];
    setItems(next);
    setQuery('');
    setResults([]);
    scheduleSync(next);
  };

  const removeItem = (index: number) => {
    const next = items.filter((_, i) => i !== index);
    setItems(next);
    scheduleSync(next);
  };

  const changeType = (index: number, relationshipType: RelationshipType) => {
    const next = items.map((item, i) =>
      i === index ? { ...item, relationship_type: relationshipType } : item
    );
    setItems(next);
    scheduleSync(next);
  };

  return (
    <div className={styles.picker}>
      <div className={styles.header}>
        <label
          className={styles.label}
          htmlFor={`related-search-${contentType}`}
        >
          Related content
        </label>
        <span className={styles.syncState} data-status={syncStatus}>
          {syncStatus === 'saving' && 'Saving…'}
          {syncStatus === 'saved' && 'Saved'}
          {syncStatus === 'error' && 'Save failed'}
        </span>
      </div>

      {disabled ? (
        <p className={styles.hint}>
          Save the draft first, then link it to other articles and case studies.
        </p>
      ) : (
        <>
          <div className={styles.searchWrap}>
            <input
              id={`related-search-${contentType}`}
              className={styles.searchInput}
              type="search"
              value={query}
              placeholder="Search articles and case studies…"
              aria-busy={shownSearching}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query.trim().length >= 2 && (
              <ul className={styles.results} aria-label="Search results">
                {shownSearching && (
                  <li className={styles.resultEmpty}>Searching…</li>
                )}
                {!shownSearching && shownResults.length === 0 && (
                  <li className={styles.resultEmpty}>No matches</li>
                )}
                {!shownSearching &&
                  shownResults.map((result) => {
                    const alreadyAdded = items.some(
                      (item) =>
                        item.id === result.id && item.type === result.type
                    );
                    return (
                      <li key={`${result.type}-${result.id}`}>
                        <button
                          type="button"
                          className={styles.resultButton}
                          disabled={alreadyAdded}
                          onClick={() => addItem(result)}
                        >
                          <span className={styles.resultTitle}>
                            {result.title}
                          </span>
                          <span className={styles.resultBadge}>
                            {result.type === 'article'
                              ? 'Article'
                              : 'Case study'}
                            {result.status && result.status !== 'published'
                              ? ' · Draft'
                              : ''}
                          </span>
                        </button>
                      </li>
                    );
                  })}
              </ul>
            )}
          </div>

          {items.length === 0 ? (
            <p className={styles.hint}>
              Nothing linked yet. Search above, or type [[ in the editor for
              inline links.
            </p>
          ) : (
            <ul className={styles.selected}>
              {items.map((item, index) => (
                <li
                  key={`${item.type}-${item.id}`}
                  className={styles.selectedItem}
                >
                  <div className={styles.selectedMain}>
                    <a
                      href={contentHref(item.type, item.slug)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.selectedTitle}
                    >
                      {item.title}
                    </a>
                    <span className={styles.resultBadge}>
                      {item.type === 'article' ? 'Article' : 'Case study'}
                    </span>
                  </div>
                  <div className={styles.selectedControls}>
                    <label className={styles.typeLabel}>
                      <span className="sr-only">
                        Relationship type for {item.title}
                      </span>
                      <select
                        className={styles.typeSelect}
                        value={item.relationship_type}
                        onChange={(e) =>
                          changeType(index, e.target.value as RelationshipType)
                        }
                      >
                        {RELATIONSHIP_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {RELATIONSHIP_META[type].label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      className={styles.removeButton}
                      aria-label={`Remove ${item.title}`}
                      onClick={() => removeItem(index)}
                    >
                      ×
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
