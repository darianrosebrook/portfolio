'use client';
import type { Article, CaseStudy } from '@/types';
import Button from '@/ui/components/Button';
import Checkbox from '@/ui/components/Checkbox';
import ToggleSwitch from '@/ui/components/ToggleSwitch';
import { extractMetadata } from '@/utils/metadata';
import type { JSONContent } from '@tiptap/react';
import { generateArticleHTML } from '@/utils/tiptap/htmlGeneration';
import { getEffectiveContent, hasWorkingDraft } from '@/utils/editor/workingDraft';
import { checkConflict } from '@/utils/editor/conflict';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const Tiptap = dynamic(
  () => import('@/ui/modules/Tiptap').then((mod) => ({ default: mod.Tiptap })),
  { ssr: false }
);

type Entity = 'articles' | 'case-studies';
type RecordType = Article | CaseStudy;

export default function ContentEditor({
  initial,
  entity,
}: {
  initial: RecordType;
  entity: Entity;
}) {
  // Load effective content (working draft if is_dirty, otherwise published)
  const effectiveContent = useMemo(() => getEffectiveContent(initial), [initial]);
  const hasDraft = hasWorkingDraft(initial);
  
  const [record, setRecord] = useState<RecordType>(() => {
    // Merge effective content into initial record
    return {
      ...initial,
      ...effectiveContent,
    } as RecordType;
  });
  
  const [preview, setPreview] = useState<boolean>(false);
  const [updatePublishDateOnPublish, setUpdatePublishDateOnPublish] =
    useState<boolean>(false);
  const [draftToggleChecked, setDraftToggleChecked] = useState<boolean>(
    initial.status === 'draft'
  );
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  useEffect(() => {
    // When initial changes, reload effective content
    const effective = getEffectiveContent(initial);
    setRecord({
      ...initial,
      ...effective,
    } as RecordType);
    setSaveError(null);
    setSaveSuccess(false);
  }, [initial]);

  const htmlPreview = useMemo(() => {
    return generateArticleHTML(record.articleBody);
  }, [record.articleBody]);

  const save = useCallback(async (payload: Partial<RecordType>) => {
    const urlBase =
      entity === 'articles' ? '/api/articles' : '/api/case-studies';
    const method = initial.id ? 'PUT' : 'POST';
    const url = initial.id ? `${urlBase}/${record.slug}` : urlBase;
    
    try {
      setSaveError(null);
      
      // Check for conflicts before saving
      if (initial.id && record.modified_at && initial.modified_at) {
        const conflict = checkConflict(record, initial);
        if (conflict.hasConflict) {
          setSaveError(conflict.message);
          throw new Error(conflict.message);
        }
      }
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Save failed: ${errorText}`);
      }

      const savedData = await response.json();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
      
      return savedData;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Save failed';
      setSaveError(errorMessage);
      console.error('Save error:', error);
      throw error;
    }
  }, [entity, initial, record]);

  const handleUpdateArticle = useCallback((updated: RecordType) => {
    setRecord(updated);
  }, []);

  // Debounced autosave working draft without affecting published fields
  const autosaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timeout
    if (autosaveTimeoutRef.current) {
      clearTimeout(autosaveTimeoutRef.current);
    }

    // Set new timeout for autosave
    autosaveTimeoutRef.current = setTimeout(async () => {
      if (!record?.slug) return;

      try {
        const urlBase =
          entity === 'articles' ? '/api/articles' : '/api/case-studies';
        const response = await fetch(`${urlBase}/${record.slug}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workingBody: record.articleBody,
            workingHeadline: record.headline,
            workingDescription: record.description,
            workingImage: record.image,
            workingKeywords: record.keywords,
            workingArticleSection: record.articleSection,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Autosave failed:', errorText);
          setSaveError('Autosave failed');
        } else {
          // Clear error on successful autosave
          setSaveError(null);
        }
      } catch (error) {
        console.error('Autosave error:', error);
      }
    }, 1000);

    // Cleanup function
    return () => {
      if (autosaveTimeoutRef.current) {
        clearTimeout(autosaveTimeoutRef.current);
        autosaveTimeoutRef.current = null;
      }
    };
  }, [record, entity]);

  const deriveAndSave = async (next: RecordType) => {
    const meta = extractMetadata(
      (next.articleBody ?? { type: 'doc' }) as JSONContent
    );
    const calculated: Partial<RecordType> = {
      ...next,
      headline: next.headline ?? meta.title,
      description: next.description ?? meta.description,
      image: next.image ?? meta.coverImage,
      wordCount: meta.wordCount as number,
    };
    await save(calculated);
    setRecord(calculated as RecordType);
  };

  const toggleDraft = async () => {
    // Toggle only the UI intent; do not persist status until publish action
    setDraftToggleChecked((v) => !v);
  };

  const handleField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const next = { ...record, [name]: value } as RecordType;
    setRecord(next);
  };

  const persist = async () => {
    const nowIso = new Date().toISOString();
    const next = { ...record, modified_at: nowIso } as RecordType;
    await deriveAndSave(next);
  };

  const handlePrimaryAction = async () => {
    const nowIso = new Date().toISOString();
    if ((record.status as RecordType['status']) === 'published') {
      // Unpublish
      const next = {
        ...record,
        status: 'draft' as RecordType['status'],
        // Keep published_at to preserve first published; update only modified
        modified_at: nowIso as RecordType['modified_at'],
      } as RecordType;
      await deriveAndSave(next);
      setDraftToggleChecked(true);
      return;
    }

    if (draftToggleChecked) {
      // Save as draft
      const next = {
        ...record,
        status: 'draft' as RecordType['status'],
        modified_at: nowIso as RecordType['modified_at'],
      } as RecordType;
      await deriveAndSave(next);
      return;
    }

    // Publish
    const next = {
      ...record,
      status: 'published' as RecordType['status'],
      published_at:
        updatePublishDateOnPublish || !record.published_at
          ? (nowIso as RecordType['published_at'])
          : record.published_at,
      modified_at: nowIso as RecordType['modified_at'],
    } as RecordType;
    await deriveAndSave(next);
  };

  const primaryLabel = useMemo(() => {
    if ((record.status as RecordType['status']) === 'published')
      return 'Unpublish';
    return draftToggleChecked ? 'Save' : 'Publish';
  }, [record.status, draftToggleChecked]);

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1rem' }}
    >
      <div>
        {!preview ? (
          <Tiptap
            key={record.id || record.slug}
            article={record as RecordType}
            handleUpdate={handleUpdateArticle as (article: RecordType) => void}
            editable={!preview}
          />
        ) : (
          <div
            style={{
              border: '1px solid var(--semantic-color-border-primary)',
              borderRadius: 'var(--core-shape-radius-medium)',
              padding: 'var(--core-spacing-size-05)',
              background: 'var(--semantic-color-background-secondary)',
            }}
            dangerouslySetInnerHTML={{ __html: htmlPreview }}
          />
        )}
      </div>
      <aside
        style={{
          display: 'grid',
          gap: '0.75rem',
          alignSelf: 'start',
          position: 'sticky',
          top: 'var(--core-spacing-size-06)',
          height: 'max-content',
        }}
      >
        <h3 style={{ margin: 0 }}>Settings</h3>
        
        {/* Working Draft Indicator */}
        {hasDraft && (
          <div
            style={{
              padding: '0.5rem',
              background: 'var(--semantic-color-background-warning)',
              border: '1px solid var(--semantic-color-border-warning)',
              borderRadius: 'var(--core-shape-radius-small)',
            }}
          >
            <small style={{ fontWeight: 'bold' }}>⚠️ Working Draft</small>
            <br />
            <small>You have unsaved changes. Editing will continue from your draft.</small>
          </div>
        )}
        
        {/* Save Status Messages */}
        {saveError && (
          <div
            style={{
              padding: '0.5rem',
              background: 'var(--semantic-color-background-error)',
              border: '1px solid var(--semantic-color-border-error)',
              borderRadius: 'var(--core-shape-radius-small)',
            }}
          >
            <small style={{ fontWeight: 'bold' }}>Error</small>
            <br />
            <small>{saveError}</small>
          </div>
        )}
        
        {saveSuccess && (
          <div
            style={{
              padding: '0.5rem',
              background: 'var(--semantic-color-background-success)',
              border: '1px solid var(--semantic-color-border-success)',
              borderRadius: 'var(--core-shape-radius-small)',
            }}
          >
            <small style={{ fontWeight: 'bold' }}>✅ Saved</small>
          </div>
        )}
        
        <div>
          <label className="small" htmlFor="draftToggle">
            Draft
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <ToggleSwitch
              checked={draftToggleChecked}
              onChange={toggleDraft}
              id="draftToggle"
            >
              Draft Mode
            </ToggleSwitch>
            <small>
              Current:{' '}
              {(record.status as RecordType['status']) === 'published'
                ? 'published'
                : 'draft'}
            </small>
          </div>
        </div>
        <div>
          <label className="small" htmlFor="slug">
            Slug
          </label>
          <input
            name="slug"
            value={record.slug}
            onChange={handleField}
            id="slug"
          />
        </div>
        <div>
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
        <div>
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
        <div>
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
        <div>
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
        <div>
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
        <div>
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
                published_at: new Date(
                  e.target.value
                ).toISOString() as RecordType['published_at'],
              })
            }
            id="published_at"
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Checkbox
            checked={updatePublishDateOnPublish}
            onChange={(e) => setUpdatePublishDateOnPublish(e.target.checked)}
            id="updatePublishedOnPublish"
          />
          <label htmlFor="updatePublishedOnPublish" className="small">
            Update publish date on publish
          </label>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {/* Show separate Save only when primary is not Save to avoid duplication */}
          {primaryLabel !== 'Save' && (
            <Button className="button" onClick={persist}>
              Save
            </Button>
          )}
          <Button className="button" onClick={handlePrimaryAction}>
            {primaryLabel}
          </Button>
          <Button className="button" onClick={() => setPreview((p) => !p)}>
            {preview ? 'Edit' : 'Preview'}
          </Button>
        </div>
        <div>
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
    </div>
  );
}
