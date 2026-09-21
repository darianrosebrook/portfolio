'use client';
import type { Article, CaseStudy } from '@/types';
import Button from '@/ui/components/Button';
import Checkbox from '@/ui/components/Checkbox';
import { Input } from '@/ui/components/Input';
import { IconButton } from './IconButton';
import { ConfirmDialog } from './ConfirmDialog';
import { RelatedContentPicker } from './RelatedContentPicker';
import { sanitizeCmsHtml } from '@/utils/helpers/sanitizeHtml';
import { generateHTML } from '@tiptap/html';
import { JSONContent } from '@tiptap/react';
import { createPreviewExtensions } from '@/ui/modules/Tiptap/extensionsRegistry';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getEffectiveContent } from '@/utils/editor/workingDraft';
import {
  acknowledgeRecovery,
  draftFingerprint,
  readRecovery,
  recoveryKey,
  toLocalDateTime,
  writeRecovery,
  contentFingerprint,
  type DraftSnapshot,
} from '@/utils/editor/draftRecovery';
import styles from './ContentEditor.module.css';

const Tiptap = dynamic(
  () => import('@/ui/modules/Tiptap').then((mod) => ({ default: mod.Tiptap })),
  { ssr: false }
);

type Entity = 'articles' | 'case-studies';
type RecordType = Article | CaseStudy;
type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export default function ContentEditor({
  initial,
  entity,
}: {
  initial: RecordType;
  entity: Entity;
}) {
  return (
    <ContentEditorSession
      key={recoveryKey(entity, initial)}
      initial={initial}
      entity={entity}
    />
  );
}

function ContentEditorSession({
  initial,
  entity,
}: {
  initial: RecordType;
  entity: Entity;
}) {
  const [record, setRecord] = useState<RecordType>(() => {
    const effective = getEffectiveContent(initial);
    return {
      ...initial,
      ...effective,
    };
  });
  const [preview, setPreview] = useState<boolean>(false);
  const [updatePublishDateOnPublish, setUpdatePublishDateOnPublish] =
    useState<boolean>(false);
  const [propertiesOpen, setPropertiesOpen] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [dirty, setDirty] = useState<boolean>(() =>
    Boolean((initial as { is_dirty?: boolean | null }).is_dirty)
  );
  const [confirm, setConfirm] = useState<
    null | 'discard' | 'unpublish' | 'publish'
  >(null);
  // Latest known canonical (published) layer, used to summarize what a
  // publish would change. Refreshed from every server row we receive.
  const [canonical, setCanonical] = useState<RecordType>(initial);
  const previousContentRef = useRef<string | null>(null);
  const routeSlugRef = useRef(initial.slug);
  const recordRef = useRef(record);
  const autosaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const saveRevisionRef = useRef(0);
  const transitionRef = useRef(false);
  const [busy, setBusy] = useState(false);
  const [recovery, setRecovery] = useState<DraftSnapshot | null>(null);
  // Local to the panel: choosing a moment must not mark the record dirty or
  // save anything until the author activates Schedule.
  const [scheduledAt, setScheduledAt] = useState('');
  // Same staleness applies to the status union: the database now extends it with
  // 'scheduled', the generated row type does not.
  const recordStatus = record.status as string | null;
  // The generated row type predates the scheduled_at column; read it through a
  // cast until the types are regenerated against the migrated database.
  const recordScheduledAt =
    (record as RecordType & { scheduled_at?: string | null }).scheduled_at ??
    null;
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const storageKey = recoveryKey(entity, initial);
  const recoveryPendingRef = useRef(false);
  const acknowledgedRef = useRef(draftFingerprint(record));
  const canonicalRef = useRef(canonical);
  // Mirrored in an effect rather than assigned while rendering, which is what
  // react-hooks/refs rejects. Async save paths read the ref, not the render value.
  useEffect(() => {
    canonicalRef.current = canonical;
  }, [canonical]);

  const updateRecord = (next: RecordType) => {
    if (transitionRef.current || recoveryPendingRef.current) return;
    recordRef.current = next;
    setRecord(next);
    setSaveStatus('pending');
    try {
      writeRecovery(window.localStorage, storageKey, next);
      setRecoveryError(null);
    } catch {
      setRecoveryError(
        'Recovery storage is unavailable. Keep this page open until your changes are saved.'
      );
    }
  };

  const acknowledge = useCallback(
    (saved: RecordType) => {
      acknowledgedRef.current = draftFingerprint(saved);
      try {
        acknowledgeRecovery(window.localStorage, storageKey, saved);
      } catch {
        /* Keep any recovery copy when storage is unavailable. */
      }
    },
    [storageKey]
  );

  useEffect(() => {
    try {
      const local = readRecovery(window.localStorage, storageKey);
      if (
        local &&
        draftFingerprint(local) !== draftFingerprint(recordRef.current)
      ) {
        recoveryPendingRef.current = true;
        // Deliberate exception to react-hooks/set-state-in-effect. This is a
        // one-time post-mount reconciliation with browser storage: localStorage
        // does not exist during SSR, and reading it while rendering would both
        // break hydration and re-run under StrictMode's double-invoked
        // initializers. Deriving it is not possible without changing when the
        // recovery banner appears, which is the behaviour FIX-EDITOR-RELIABILITY-001
        // established.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setRecovery(local);
      } else if (local)
        acknowledgeRecovery(window.localStorage, storageKey, recordRef.current);
    } catch {
      setRecoveryError(
        'Recovery storage is unavailable. Keep this page open until your changes are saved.'
      );
    }
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      if (draftFingerprint(recordRef.current) !== acknowledgedRef.current) {
        event.preventDefault();
        event.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', warnBeforeLeaving);
    return () => window.removeEventListener('beforeunload', warnBeforeLeaving);
  }, [storageKey]);

  useEffect(() => {
    recordRef.current = record;
  }, [record]);

  useEffect(() => {
    // A same-document refresh cannot replace a revision still awaiting a save.
    // Identity changes remount the session, keeping queues and recovery isolated.
    if (
      transitionRef.current ||
      draftFingerprint(recordRef.current) !== acknowledgedRef.current
    )
      return;
    const effective = getEffectiveContent(initial);
    setRecord({
      ...initial,
      ...effective,
    });
    setDirty(Boolean((initial as { is_dirty?: boolean | null }).is_dirty));
    setCanonical(initial);
    acknowledgedRef.current = draftFingerprint({ ...initial, ...effective });
    recordRef.current = { ...initial, ...effective };
    routeSlugRef.current = initial.slug;
    previousContentRef.current = serializeWorkingRecord({
      ...initial,
      ...effective,
    });
  }, [initial]);

  const htmlPreview = useMemo(() => {
    const doc = (record.articleBody as JSONContent) ?? {
      type: 'doc',
      content: [],
    };
    // Use preview extensions from registry to ensure consistency
    return sanitizeCmsHtml(generateHTML(doc, createPreviewExtensions()));
  }, [record.articleBody]);

  const changedFields = useMemo(
    () => changedFieldLabels(record, canonical),
    [record, canonical]
  );

  const saveTransition = async (payload: Partial<RecordType>) => {
    const urlBase =
      entity === 'articles' ? '/api/articles' : '/api/case-studies';
    const response = await fetch(`${urlBase}/${routeSlugRef.current}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `Save failed (${response.status})`);
    }
    const saved = await response.json();
    const row = Array.isArray(saved) ? saved[0] : null;
    if (!row?.slug)
      throw new Error(
        'Save returned no record; changes have not been confirmed.'
      );
    routeSlugRef.current = row.slug;
    if (row) {
      setDirty(Boolean((row as { is_dirty?: boolean | null }).is_dirty));
      setCanonical(row as RecordType);
    }
    return row as RecordType | null;
  };

  const handleUpdateArticle = (updated: RecordType) => {
    updateRecord(updated);
  };

  const queueWorkingSave = useCallback(
    (snapshot: RecordType) => {
      const routeSlug = routeSlugRef.current;
      const urlBase =
        entity === 'articles' ? '/api/articles' : '/api/case-studies';
      const task = saveQueueRef.current
        .catch(() => undefined)
        .then(async () => {
          const response = await fetch(`${urlBase}/${routeSlug}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              workingbody: snapshot.articleBody,
              workingheadline: snapshot.headline,
              workingdescription: snapshot.description,
              workingimage: snapshot.image,
              workingkeywords: snapshot.keywords,
              workingarticlesection: snapshot.articleSection,
              wordCount: snapshot.wordCount,
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Save failed');
          }
          const rows = await response.json();
          if (!Array.isArray(rows) || !rows[0]?.id)
            throw new Error(
              'Save returned no record; changes have not been confirmed.'
            );
          const saved = rows[0] as RecordType;
          if (
            saved.id !== snapshot.id ||
            saved.author !== snapshot.author ||
            !saved.is_dirty ||
            workingFingerprint(toEditableRecord(saved)) !==
              workingFingerprint(snapshot)
          ) {
            throw new Error(
              'The server did not confirm this draft revision. Your local recovery copy has been kept.'
            );
          }
        });

      saveQueueRef.current = task.catch(() => undefined);
      return task;
    },
    [entity]
  );

  const runWorkingSave = useCallback(
    async (snapshot: RecordType) => {
      const revision = ++saveRevisionRef.current;
      setSaveStatus('saving');
      setSaveError(null);
      try {
        await queueWorkingSave(snapshot);
        previousContentRef.current = serializeWorkingRecord(snapshot);
        setDirty(true);
        acknowledge({
          ...snapshot,
          slug: routeSlugRef.current,
          published_at: canonicalRef.current.published_at,
        });
        if (revision === saveRevisionRef.current)
          setSaveStatus(
            draftFingerprint(recordRef.current) === acknowledgedRef.current
              ? 'saved'
              : 'pending'
          );
      } catch (err) {
        if (revision === saveRevisionRef.current) {
          setSaveStatus('error');
          setSaveError(err instanceof Error ? err.message : 'Failed to save');
        }
        throw err;
      }
    },
    [queueWorkingSave, acknowledge]
  );

  const flushWorkingDraft = useCallback(
    async (snapshot = recordRef.current) => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
      const currentContent = serializeWorkingRecord(snapshot);
      if (currentContent !== previousContentRef.current) {
        await runWorkingSave(snapshot);
      } else {
        await saveQueueRef.current;
      }
    },
    [runWorkingSave]
  );

  // Debounced autosave working draft without affecting published fields.
  useEffect(() => {
    if (!record || !record.slug || busy || recovery || transitionRef.current)
      return;

    // Serialize content for comparison to avoid unnecessary saves
    const currentContent = serializeWorkingRecord(record);

    // Skip if content hasn't changed
    if (currentContent === previousContentRef.current) {
      return;
    }

    autosaveTimerRef.current = setTimeout(() => {
      autosaveTimerRef.current = null;
      void runWorkingSave(record).catch((err) => {
        console.error('Auto-save failed:', err);
      });
    }, 1000);
    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [record, runWorkingSave, busy, recovery]);

  const handleField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const next = { ...record, [name]: value } as RecordType;
    updateRecord(next);
  };

  const applySavedRecord = (saved: RecordType) => {
    const next = toEditableRecord(saved);
    recordRef.current = next;
    setRecord(next);
    previousContentRef.current = serializeWorkingRecord(next);
    setCanonical(saved);
    setDirty(Boolean(saved.is_dirty));
    acknowledge(next);
    setSaveStatus('saved');
  };

  const transition = async (operation: () => Promise<void>) => {
    if (transitionRef.current || recoveryPendingRef.current) return;
    transitionRef.current = true;
    setBusy(true);
    setConfirm(null);
    setSaveError(null);
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }
    try {
      // No transition may overtake a prior working save. Editing and new
      // autosaves are paused until the transition has acknowledged its row.
      await saveQueueRef.current;
      await operation();
    } catch (err) {
      setSaveStatus('error');
      setSaveError(
        err instanceof Error ? err.message : 'Changes could not be saved'
      );
    } finally {
      transitionRef.current = false;
      setBusy(false);
    }
  };

  const persist = () =>
    transition(async () => {
      const snapshot = recordRef.current;
      await flushWorkingDraft(snapshot);
      if (
        snapshot.slug !== routeSlugRef.current ||
        snapshot.published_at !== canonicalRef.current.published_at
      ) {
        const saved = await saveTransition({
          slug: snapshot.slug,
          published_at: snapshot.published_at,
        });
        if (saved) applySavedRecord(saved);
      } else {
        acknowledge(snapshot);
        setSaveStatus('saved');
      }
    });

  const handleUnpublish = () =>
    transition(async () => {
      const snapshot = recordRef.current;
      await flushWorkingDraft(snapshot);
      // Returning an item to draft also clears its schedule: a draft holding a
      // stale moment would be a promise nothing is keeping.
      const patch: Partial<RecordType> & { scheduled_at?: string | null } = {
        slug: snapshot.slug,
        status: 'draft' as RecordType['status'],
        scheduled_at: null,
      };
      const saved = await saveTransition(patch);
      if (saved) applySavedRecord(saved);
    });

  const handlePublish = () =>
    transition(async () => {
      const snapshot = recordRef.current;
      if (!snapshot.slug || !snapshot.headline?.trim())
        throw new Error(
          'A headline and permanent slug are required before publishing.'
        );
      if (/^draft-\d+$/.test(snapshot.slug))
        throw new Error('Set a permanent slug before publishing.');
      await flushWorkingDraft(snapshot);
      const saved = await saveTransition({
        slug: snapshot.slug,
        status: 'published' as RecordType['status'],
        wordCount: snapshot.wordCount,
        published_at:
          updatePublishDateOnPublish || !snapshot.published_at
            ? new Date().toISOString()
            : snapshot.published_at,
      });
      if (saved) applySavedRecord(saved);
    });

  const handleSchedule = () =>
    transition(async () => {
      const snapshot = recordRef.current;
      if (!snapshot.slug || !snapshot.headline?.trim())
        throw new Error(
          'A headline and permanent slug are required before scheduling.'
        );
      if (!scheduledAt) throw new Error('Choose the moment to publish at.');
      await flushWorkingDraft(snapshot);
      // Scheduling publishes nothing. The status and the moment go to the
      // database; the executor publishes when the moment arrives.
      const patch: Partial<RecordType> & { scheduled_at?: string | null } = {
        slug: snapshot.slug,
        status: 'scheduled' as RecordType['status'],
        scheduled_at: new Date(scheduledAt).toISOString(),
      };
      const saved = await saveTransition(patch);
      if (saved) applySavedRecord(saved);
    });

  const handleDiscard = () =>
    transition(async () => {
      const discarded = recordRef.current;
      const urlBase =
        entity === 'articles' ? '/api/articles' : '/api/case-studies';
      const response = await fetch(
        `${urlBase}/${routeSlugRef.current}/discard`,
        { method: 'POST' }
      );
      if (!response.ok)
        throw new Error((await response.text()) || 'Discard failed');
      const data = await response.json();
      const row = Array.isArray(data) ? data[0] : data;
      if (!row?.id || !row?.slug)
        throw new Error(
          'Discard returned no record; changes have not been confirmed.'
        );
      // Clear only the revision the user explicitly discarded, never another
      // tab's newer recovery copy.
      acknowledge(discarded);
      applySavedRecord(row as RecordType);
    });

  return (
    <section className={styles.suite} aria-busy={busy}>
      {recovery && (
        <div role="status">
          <p>
            An unsaved local version is available. Restore it to continue
            editing, or keep the server version.
          </p>
          <Button
            onClick={() => {
              recoveryPendingRef.current = false;
              updateRecord({ ...recordRef.current, ...recovery });
              setRecovery(null);
            }}
          >
            Restore local draft
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              try {
                acknowledgeRecovery(window.localStorage, storageKey, {
                  ...recordRef.current,
                  ...recovery,
                });
                recoveryPendingRef.current = false;
                setRecovery(null);
              } catch {
                setRecoveryError('Could not remove the local recovery copy.');
              }
            }}
          >
            Keep server version
          </Button>
        </div>
      )}
      {recoveryError && <p role="alert">{recoveryError}</p>}
      <header className={styles.commandBar}>
        <div className={styles.documentState}>
          <span className={styles.statusBadge} data-status={record.status}>
            {record.status === 'published' ? 'Published' : 'Draft'}
          </span>
          {dirty && (
            <span
              className={styles.pendingBadge}
              title="Working draft differs from the published version"
            >
              unpublished changes
            </span>
          )}
          {dirty && changedFields.length > 0 && (
            <span className={styles.saveState}>
              changed: {changedFields.join(', ')}
            </span>
          )}
          <span className={styles.saveState} data-status={saveStatus}>
            {busy && 'Applying changes…'}
            {!busy && saveStatus === 'pending' && 'Unsaved changes'}
            {!busy && saveStatus === 'saving' && 'Saving…'}
            {!busy && saveStatus === 'saved' && 'Saved'}
            {saveStatus === 'error' && (saveError || 'Save failed')}
            {!busy && saveStatus === 'idle' && 'All changes saved'}
          </span>
          {record.wordCount !== null && (
            <span className={styles.wordCount}>{record.wordCount} words</span>
          )}
        </div>
        <fieldset
          className={styles.commandActions}
          disabled={busy || Boolean(recovery)}
        >
          <Button variant="secondary" onClick={() => setPreview((p) => !p)}>
            {preview ? 'Edit' : 'Preview'}
          </Button>
          <Button variant="secondary" onClick={persist}>
            Save draft
          </Button>
          {dirty && (
            <Button variant="secondary" onClick={() => setConfirm('discard')}>
              Discard changes
            </Button>
          )}
          {record.status === 'published' && dirty && (
            <Button variant="primary" onClick={() => setConfirm('publish')}>
              Publish updates
            </Button>
          )}
          <Button
            variant={record.status === 'published' ? 'destructive' : 'primary'}
            onClick={
              record.status === 'published'
                ? () => setConfirm('unpublish')
                : handlePublish
            }
          >
            {record.status === 'published' ? 'Unpublish' : 'Publish'}
          </Button>
          {recordStatus === 'scheduled' ? (
            <Button variant="secondary" onClick={() => setConfirm('unpublish')}>
              Unschedule
            </Button>
          ) : (
            <Button
              variant="secondary"
              disabled={!scheduledAt || busy}
              onClick={handleSchedule}
              title={
                scheduledAt
                  ? `Publish automatically on ${new Date(scheduledAt).toLocaleString()}`
                  : 'Choose a moment under Properties first'
              }
            >
              Schedule
            </Button>
          )}
          <Button
            variant="secondary"
            aria-expanded={propertiesOpen}
            onClick={() => setPropertiesOpen((open) => !open)}
          >
            {propertiesOpen ? 'Hide properties' : 'Properties'}
          </Button>
        </fieldset>
      </header>
      <div
        className={styles.workspace}
        data-properties-open={propertiesOpen}
        inert={busy || Boolean(recovery) || undefined}
      >
        <main className={styles.canvas}>
          {!preview ? (
            <Tiptap
              article={record as RecordType}
              editable={!busy && !recovery}
              handleUpdate={
                handleUpdateArticle as (article: RecordType) => void
              }
            />
          ) : (
            <div
              className={styles.preview}
              dangerouslySetInnerHTML={{ __html: htmlPreview }}
            />
          )}
        </main>
        {propertiesOpen && (
          <aside className={styles.properties}>
            <div className={styles.propertiesHeader}>
              <div>
                <p className={styles.eyebrow}>Document</p>
                <h2>Properties</h2>
              </div>
              <IconButton
                icon="close"
                label="Close properties"
                onClick={() => setPropertiesOpen(false)}
              />
            </div>
            <div className={styles.field}>
              <label className="small" htmlFor="slug">
                Slug
              </label>
              <Input
                name="slug"
                value={record.slug}
                onChange={handleField}
                id="slug"
              />
              {record.status === 'published' &&
                record.slug !== canonical.slug && (
                  <small className={styles.renameWarning}>
                    Renaming changes the public URL; /articles/{canonical.slug}{' '}
                    will 404.
                  </small>
                )}
            </div>
            <div className={styles.field}>
              <label className="small" htmlFor="headline">
                Headline
              </label>
              <Input
                name="headline"
                value={record.headline ?? ''}
                onChange={handleField}
                id="headline"
              />
            </div>
            <div className={styles.field}>
              <label className="small" htmlFor="description">
                Description
              </label>
              <textarea
                name="description"
                value={record.description ?? ''}
                onChange={handleField}
                id="description"
              />
            </div>
            <div className={styles.field}>
              <label className="small" htmlFor="image">
                Image
              </label>
              <Input
                name="image"
                value={record.image ?? ''}
                onChange={handleField}
                id="image"
              />
            </div>
            <div className={styles.field}>
              <label className="small" htmlFor="articleSection">
                Section
              </label>
              <Input
                name="articleSection"
                value={record.articleSection ?? ''}
                onChange={handleField}
                id="articleSection"
              />
            </div>
            <div className={styles.field}>
              <label className="small" htmlFor="keywords">
                Keywords (comma-separated)
              </label>
              <Input
                name="keywords"
                value={record.keywords ?? ''}
                onChange={handleField}
                id="keywords"
              />
            </div>
            <RelatedContentPicker
              slug={canonical.slug}
              contentType={entity === 'articles' ? 'article' : 'case-study'}
              excludeId={record.id}
            />
            <div className={styles.field}>
              <label className="small" htmlFor="published_at">
                Published at
              </label>
              <Input
                type="datetime-local"
                value={
                  record.published_at
                    ? toLocalDateTime(record.published_at)
                    : ''
                }
                onChange={(e) =>
                  updateRecord({
                    ...record,
                    published_at: e.target.value
                      ? (new Date(
                          e.target.value
                        ).toISOString() as RecordType['published_at'])
                      : null,
                  })
                }
                id="published_at"
              />
            </div>
            <div className={styles.field}>
              <label className="small" htmlFor="scheduled_at">
                Schedule for
              </label>
              <Input
                type="datetime-local"
                id="scheduled_at"
                value={scheduledAt}
                onChange={(e) => setScheduledAt(e.target.value)}
              />
              {recordStatus === 'scheduled' && (
                <p className="small" role="status">
                  Scheduled — publishes on its own at{' '}
                  {recordScheduledAt
                    ? new Date(recordScheduledAt).toLocaleString()
                    : 'the moment set here'}
                  .
                </p>
              )}
            </div>
            <div className={styles.checkboxField}>
              <Checkbox
                checked={updatePublishDateOnPublish}
                onChange={(e) =>
                  setUpdatePublishDateOnPublish(e.target.checked)
                }
                id="updatePublishedOnPublish"
              />
              <label htmlFor="updatePublishedOnPublish" className="small">
                Update publish date on publish
              </label>
            </div>
            <div className={styles.auditMeta}>
              <small>
                Created:{' '}
                {record.created_at
                  ? new Date(record.created_at).toLocaleString()
                  : '—'}
              </small>
              <br />
              <small>
                Modified:{' '}
                {record.modified_at
                  ? new Date(record.modified_at).toLocaleString()
                  : '—'}
              </small>
              <br />
              <small>
                First Published:{' '}
                {record.published_at
                  ? new Date(record.published_at).toLocaleString()
                  : '—'}
              </small>
            </div>
          </aside>
        )}
      </div>

      <ConfirmDialog
        open={confirm === 'discard'}
        title="Discard unpublished changes?"
        description={
          record.status === 'published'
            ? 'The working draft will be reset to the live published version. The public article is not affected.'
            : 'The working draft will be reset to the last saved version. This cannot be undone.'
        }
        confirmLabel="Discard changes"
        danger
        onConfirm={handleDiscard}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === 'publish'}
        title="Publish updates?"
        description={
          <>
            The live version will be replaced with your working draft.
            <br />
            Changed:{' '}
            {changedFields.length > 0 ? changedFields.join(', ') : 'content'}.
            <br />
            Publish date:{' '}
            {updatePublishDateOnPublish || !record.published_at
              ? 'updates to now.'
              : `stays ${new Date(record.published_at).toLocaleString()}.`}
          </>
        }
        confirmLabel="Publish"
        onConfirm={handlePublish}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === 'unpublish'}
        title={recordStatus === 'scheduled' ? 'Unschedule?' : 'Unpublish?'}
        description={
          recordStatus === 'scheduled' ? (
            <>
              The item returns to draft and its schedule is cleared. It was
              never published, so the public site is unaffected.
            </>
          ) : (
            <>
              The article will immediately disappear from the public site.
              {dirty && (
                <>
                  {' '}
                  Unpublished changes stay pending and will go live the next
                  time you publish.
                </>
              )}
            </>
          )
        }
        confirmLabel={recordStatus === 'scheduled' ? 'Unschedule' : 'Unpublish'}
        danger
        onConfirm={handleUnpublish}
        onCancel={() => setConfirm(null)}
      />
    </section>
  );
}

function workingFingerprint(record: RecordType): string {
  return contentFingerprint({
    articleBody: record.articleBody ?? null,
    headline: record.headline ?? null,
    description: record.description ?? null,
    image: record.image ?? null,
    keywords: record.keywords ?? null,
    articleSection: record.articleSection ?? null,
  });
}

function serializeWorkingRecord(record: RecordType): string {
  return contentFingerprint({
    articleBody: record.articleBody,
    headline: record.headline,
    description: record.description,
    image: record.image,
    keywords: record.keywords,
    articleSection: record.articleSection,
    wordCount: record.wordCount,
  });
}

function changedFieldLabels(
  record: RecordType,
  canonical: RecordType
): string[] {
  const changed: string[] = [];
  const scalarFields: Array<[string, keyof RecordType]> = [
    ['headline', 'headline'],
    ['description', 'description'],
    ['image', 'image'],
    ['keywords', 'keywords'],
    ['section', 'articleSection'],
  ];
  for (const [label, key] of scalarFields) {
    if ((record[key] ?? null) !== (canonical[key] ?? null)) changed.push(label);
  }
  if (
    JSON.stringify(record.articleBody ?? null) !==
    JSON.stringify(canonical.articleBody ?? null)
  ) {
    changed.push('content');
  }
  return changed;
}

function toEditableRecord(record: RecordType): RecordType {
  return {
    ...record,
    ...getEffectiveContent(record),
  };
}
