'use client';
import type { Article, CaseStudy } from '@/types';
import Button from '@/ui/components/Button';
import Checkbox from '@/ui/components/Checkbox';
import { SwitchField } from '@/ui/components/Switch';
import { VideoExtended } from '@/ui/modules/Tiptap/Extensions/VideoExtended';
import { extractMetadata } from '@/utils/metadata';
import CharacterCount from '@tiptap/extension-character-count';
import Image from '@tiptap/extension-image';
import { generateHTML } from '@tiptap/html';
import { JSONContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';

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
  const [record, setRecord] = useState<RecordType>(initial);
  const [preview, setPreview] = useState<boolean>(false);
  const [updatePublishDateOnPublish, setUpdatePublishDateOnPublish] =
    useState<boolean>(false);
  const [draftToggleChecked, setDraftToggleChecked] = useState<boolean>(
    initial.status === 'draft'
  );
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const previousContentRef = useRef<string | null>(null);

  useEffect(() => {
    setRecord(initial);
  }, [initial]);

  const htmlPreview = useMemo(() => {
    const doc = (record.articleBody as JSONContent) ?? {
      type: 'doc',
      content: [],
    };
    return generateHTML(doc, [
      CharacterCount,
      Image,
      VideoExtended,
      StarterKit,
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ]);
  }, [record.articleBody]);

  const save = async (payload: Partial<RecordType>) => {
    const urlBase =
      entity === 'articles' ? '/api/articles' : '/api/case-studies';
    const method = initial.id ? 'PUT' : 'POST';
    const url = initial.id ? `${urlBase}/${record.slug}` : urlBase;
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  };

  const handleUpdateArticle = (updated: RecordType) => {
    setRecord(updated);
  };

  // Debounced autosave working draft without affecting published fields
  useEffect(() => {
    if (!record || !record.slug) return;

    // Serialize content for comparison to avoid unnecessary saves
    const currentContent = JSON.stringify({
      articleBody: record.articleBody,
      headline: record.headline,
      description: record.description,
      image: record.image,
      keywords: record.keywords,
      articleSection: record.articleSection,
    });

    // Skip if content hasn't changed
    if (currentContent === previousContentRef.current) {
      return;
    }

    previousContentRef.current = currentContent;

    const handle = setTimeout(async () => {
      setSaveStatus('saving');
      setSaveError(null);

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
          throw new Error(errorText || 'Save failed');
        }

        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch (err) {
        setSaveStatus('error');
        setSaveError(err instanceof Error ? err.message : 'Failed to save');
        console.error('Auto-save failed:', err);
      }
    }, 1000);
    return () => clearTimeout(handle);
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
            article={record as RecordType}
            handleUpdate={handleUpdateArticle as (article: RecordType) => void}
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
        <div>
          <label className="small" htmlFor="draftToggle">
            Draft
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <SwitchField
              checked={draftToggleChecked}
              onChange={toggleDraft}
              id="draftToggle"
              label="Draft Mode"
            />
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
        {/* Save status indicator */}
        <div
          style={{
            fontSize: '12px',
            color:
              saveStatus === 'error'
                ? 'var(--semantic-color-foreground-destructive, #ef4444)'
                : saveStatus === 'saved'
                  ? 'var(--semantic-color-foreground-success, #22c55e)'
                  : 'var(--semantic-color-foreground-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {saveStatus === 'saving' && (
            <span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
              Saving...
            </span>
          )}
          {saveStatus === 'saved' && <span>✓ Saved</span>}
          {saveStatus === 'error' && <span>✕ {saveError || 'Error saving'}</span>}
          {saveStatus === 'idle' && <span>Auto-save enabled</span>}
        </div>
      </aside>
    </div>
  );
}
