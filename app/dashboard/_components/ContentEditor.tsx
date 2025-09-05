'use client';
import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import type { Article, CaseStudy } from '@/types';
import { extractMetadata } from '@/utils/metadata';
import { JSONContent } from '@tiptap/react';
import { generateHTML } from '@tiptap/html';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import CharacterCount from '@tiptap/extension-character-count';
import ToggleSwitch from '@/components/ToggleSwitch';

const Tiptap = dynamic(
  () => import('@/modules/Tiptap').then((mod) => ({ default: mod.Tiptap })),
  { ssr: false }
);

type Entity = 'articles' | 'case-studies';
type RecordType = Article | CaseStudy;

function isArticle(r: RecordType): r is Article {
  return (r as Article).status !== undefined;
}

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
    (initial.status as any) === 'draft'
  );

  useEffect(() => {
    setRecord(initial);
  }, [initial]);

  const htmlPreview = useMemo(() => {
    const doc = (record.articleBody as JSONContent) ?? {
      type: 'doc',
      content: [],
    };
    return generateHTML(doc, [CharacterCount, Image, StarterKit]);
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
    const handle = setTimeout(async () => {
      if (!record) return;
      const urlBase =
        entity === 'articles' ? '/api/articles' : '/api/case-studies';
      await fetch(`${urlBase}/${record.slug}`, {
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
    }, 1000);
    return () => clearTimeout(handle);
  }, [record, entity]);

  const deriveAndSave = async (next: RecordType) => {
    const meta = extractMetadata((next.articleBody ?? { type: 'doc' }) as any);
    const calculated: Partial<RecordType> = {
      ...next,
      headline: next.headline ?? meta.title,
      description: next.description ?? meta.description,
      image: next.image ?? meta.coverImage,
      wordCount: meta.wordCount as any,
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
    if ((record.status as any) === 'published') {
      // Unpublish
      const next = {
        ...record,
        status: 'draft' as any,
        // Keep published_at to preserve first published; update only modified
        modified_at: nowIso as any,
      } as RecordType;
      await deriveAndSave(next);
      setDraftToggleChecked(true);
      return;
    }

    if (draftToggleChecked) {
      // Save as draft
      const next = {
        ...record,
        status: 'draft' as any,
        modified_at: nowIso as any,
      } as RecordType;
      await deriveAndSave(next);
      return;
    }

    // Publish
    const next = {
      ...record,
      status: 'published' as any,
      published_at:
        updatePublishDateOnPublish || !record.published_at
          ? (nowIso as any)
          : record.published_at,
      modified_at: nowIso as any,
    } as RecordType;
    await deriveAndSave(next);
  };

  const primaryLabel = useMemo(() => {
    if ((record.status as any) === 'published') return 'Unpublish';
    return draftToggleChecked ? 'Save' : 'Publish';
  }, [record.status, draftToggleChecked]);

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1rem' }}
    >
      <div>
        {!preview ? (
          <Tiptap
            article={record as any}
            handleUpdate={handleUpdateArticle as any}
          />
        ) : (
          <div
            style={{
              border: '1px solid var(--color-border-primary)',
              borderRadius: 'var(--radius-02)',
              padding: 'var(--size-05)',
              background: 'var(--color-background-secondary)',
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
          top: 'var(--size-06)',
          height: 'max-content',
        }}
      >
        <h3 style={{ margin: 0 }}>Settings</h3>
        <div>
          <label className="small">Draft</label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <ToggleSwitch checked={draftToggleChecked} onChange={toggleDraft}>
              Draft Mode
            </ToggleSwitch>
            <small>
              Current:{' '}
              {(record.status as any) === 'published' ? 'published' : 'draft'}
            </small>
          </div>
        </div>
        <div>
          <label className="small">Slug</label>
          <input name="slug" value={record.slug} onChange={handleField} />
        </div>
        <div>
          <label className="small">Headline</label>
          <input
            name="headline"
            value={record.headline ?? ''}
            onChange={handleField}
          />
        </div>
        <div>
          <label className="small">Description</label>
          <textarea
            name="description"
            value={record.description ?? ''}
            onChange={handleField}
          />
        </div>
        <div>
          <label className="small">Image</label>
          <input
            name="image"
            value={record.image ?? ''}
            onChange={handleField}
          />
        </div>
        <div>
          <label className="small">Section</label>
          <input
            name="articleSection"
            value={record.articleSection ?? ''}
            onChange={handleField}
          />
        </div>
        <div>
          <label className="small">Keywords (comma-separated)</label>
          <input
            name="keywords"
            value={record.keywords ?? ''}
            onChange={handleField}
          />
        </div>
        <div>
          <label className="small">Published at</label>
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
                published_at: new Date(e.target.value).toISOString() as any,
              })
            }
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input
            id="updatePublishedOnPublish"
            type="checkbox"
            checked={updatePublishDateOnPublish}
            onChange={(e) => setUpdatePublishDateOnPublish(e.target.checked)}
          />
          <label htmlFor="updatePublishedOnPublish" className="small">
            Update publish date on publish
          </label>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {/* Show separate Save only when primary is not Save to avoid duplication */}
          {primaryLabel !== 'Save' && (
            <button className="button" onClick={persist}>
              Save
            </button>
          )}
          <button className="button" onClick={handlePrimaryAction}>
            {primaryLabel}
          </button>
          <button className="button" onClick={() => setPreview((p) => !p)}>
            {preview ? 'Edit' : 'Preview'}
          </button>
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
