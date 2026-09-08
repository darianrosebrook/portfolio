'use client';
import type { Article, CaseStudy } from '@/types';
import Button from '@/ui/components/Button';
import Checkbox from '@/ui/components/Checkbox';
import { ConfirmDialog } from './ConfirmDialog';
import { RelatedContentPicker } from './RelatedContentPicker';
import { sanitizeCmsHtml } from '@/utils/helpers/sanitizeHtml';
import { generateHTML } from '@tiptap/html';
import { JSONContent } from '@tiptap/react';
import { createPreviewExtensions } from '@/ui/modules/Tiptap/extensionsRegistry';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getEffectiveContent } from '@/utils/editor/workingDraft';
import styles from './ContentEditor.module.css';

const Tiptap = dynamic(
  () => import('@/ui/modules/Tiptap').then((mod) => ({ default: mod.Tiptap })),
  { ssr: false }
);

type Entity = 'articles' | 'case-studies';
type RecordType = Article | CaseStudy;
type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function ContentEditor({
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

  useEffect(() => {
    recordRef.current = record;
  }, [record]);

  useEffect(() => {
    const effective = getEffectiveContent(initial);
    setRecord({
      ...initial,
      ...effective,
    });
    setDirty(Boolean((initial as { is_dirty?: boolean | null }).is_dirty));
    setCanonical(initial);
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
    if (row?.slug) routeSlugRef.current = row.slug;
    if (row) {
      setDirty(Boolean((row as { is_dirty?: boolean | null }).is_dirty));
      setCanonical(row as RecordType);
    }
    return row as RecordType | null;
  };

  const handleUpdateArticle = (updated: RecordType) => {
    setRecord(updated);
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
        if (revision === saveRevisionRef.current) setSaveStatus('saved');
      } catch (err) {
        if (revision === saveRevisionRef.current) {
          setSaveStatus('error');
          setSaveError(err instanceof Error ? err.message : 'Failed to save');
        }
        throw err;
      }
    },
    [queueWorkingSave]
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
    if (!record || !record.slug) return;

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
  }, [record, runWorkingSave]);

  const handleField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const next = { ...record, [name]: value } as RecordType;
    setRecord(next);
  };

  const persist = async () => {
    try {
      const snapshot = recordRef.current;
      await flushWorkingDraft(snapshot);
      if (snapshot.slug !== routeSlugRef.current) {
        const saved = await saveTransition({ slug: snapshot.slug });
        if (saved) setRecord(toEditableRecord(saved));
      }
    } catch (err) {
      setSaveStatus('error');
      setSaveError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleUnpublish = async () => {
    setConfirm(null);
    try {
      await flushWorkingDraft(recordRef.current);
      const saved = await saveTransition({
        slug: record.slug,
        status: 'draft' as RecordType['status'],
      });
      if (saved) setRecord(toEditableRecord(saved));
    } catch (err) {
      setSaveStatus('error');
      setSaveError(err instanceof Error ? err.message : 'Failed to unpublish');
    }
  };

  const handlePublish = async () => {
    setConfirm(null);
    try {
      const nowIso = new Date().toISOString();
      // Publish only after the latest click-time editor state has reached the
      // working columns that the API promotes into canonical content.
      await flushWorkingDraft(recordRef.current);
      const snapshot = recordRef.current;
      const saved = await saveTransition({
        slug: snapshot.slug,
        status: 'published' as RecordType['status'],
        wordCount: snapshot.wordCount,
        published_at:
          updatePublishDateOnPublish || !snapshot.published_at
            ? (nowIso as RecordType['published_at'])
            : snapshot.published_at,
      });
      if (saved) setRecord(toEditableRecord(saved));
    } catch (err) {
      setSaveStatus('error');
      setSaveError(err instanceof Error ? err.message : 'Failed to publish');
    }
  };

  const handleDiscard = async () => {
    setConfirm(null);
    try {
      const urlBase =
        entity === 'articles' ? '/api/articles' : '/api/case-studies';
      const response = await fetch(
        `${urlBase}/${routeSlugRef.current}/discard`,
        { method: 'POST' }
      );
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Discard failed');
      }
      const saved = await response.json();
      const row = Array.isArray(saved) ? saved[0] : saved;
      if (row) {
        const next = toEditableRecord(row as RecordType);
        setRecord(next);
        previousContentRef.current = serializeWorkingRecord(next);
        setDirty(false);
        setCanonical(row as RecordType);
      }
    } catch (err) {
      setSaveStatus('error');
      setSaveError(
        err instanceof Error ? err.message : 'Failed to discard changes'
      );
    }
  };

  return (
    <section className={styles.suite}>
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
            {saveStatus === 'saving' && 'Saving…'}
            {saveStatus === 'saved' && 'Saved'}
            {saveStatus === 'error' && (saveError || 'Save failed')}
            {saveStatus === 'idle' && 'All changes autosave'}
          </span>
          {record.wordCount !== null && (
            <span className={styles.wordCount}>{record.wordCount} words</span>
          )}
        </div>
        <div className={styles.commandActions}>
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
          <Button
            variant="secondary"
            aria-expanded={propertiesOpen}
            onClick={() => setPropertiesOpen((open) => !open)}
          >
            {propertiesOpen ? 'Hide properties' : 'Properties'}
          </Button>
        </div>
      </header>
      <div className={styles.workspace} data-properties-open={propertiesOpen}>
        <main className={styles.canvas}>
          {!preview ? (
            <Tiptap
              article={record as RecordType}
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
              <button
                type="button"
                className={styles.closeProperties}
                onClick={() => setPropertiesOpen(false)}
                aria-label="Close properties"
              >
                ×
              </button>
            </div>
            <div className={styles.field}>
              <label className="small" htmlFor="slug">
                Slug
              </label>
              <input
                name="slug"
                value={record.slug}
                onChange={handleField}
                id="slug"
              />
              {record.status === 'published' &&
                record.slug !== canonical.slug && (
                  <small
                    style={{
                      color:
                        'var(--semantic-color-foreground-warning, #92400e)',
                    }}
                  >
                    Renaming changes the public URL; /articles/{canonical.slug}{' '}
                    will 404.
                  </small>
                )}
            </div>
            <div className={styles.field}>
              <label className="small" htmlFor="headline">
                Headline
              </label>
              <input
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
              <input
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
              <input
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
              <input
                name="keywords"
                value={record.keywords ?? ''}
                onChange={handleField}
                id="keywords"
              />
            </div>
            <RelatedContentPicker
              slug={routeSlugRef.current}
              contentType={entity === 'articles' ? 'article' : 'case-study'}
              excludeId={record.id}
            />
            <div className={styles.field}>
              <label className="small" htmlFor="published_at">
                Published at
              </label>
              <input
                type="datetime-local"
                value={
                  record.published_at
                    ? new Date(record.published_at).toISOString().slice(0, 16)
                    : ''
                }
                onChange={(e) =>
                  setRecord({
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
        title="Unpublish?"
        description={
          <>
            The article will immediately disappear from the public site.
            {dirty && (
              <>
                {' '}
                Unpublished changes stay pending and will go live the next time
                you publish.
              </>
            )}
          </>
        }
        confirmLabel="Unpublish"
        danger
        onConfirm={handleUnpublish}
        onCancel={() => setConfirm(null)}
      />
    </section>
  );
}

function serializeWorkingRecord(record: RecordType): string {
  return JSON.stringify({
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
