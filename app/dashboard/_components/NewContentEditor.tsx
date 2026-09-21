'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import type { Article } from '@/types';
import type { JSONContent } from '@tiptap/react';
import Tiptap from '@/ui/modules/Tiptap/Tiptap';
import Button from '@/ui/components/Button';
import { useToast } from '@/ui/components/Toast';
import { slugify } from '@/utils/slugify';
import { extractMetadata } from '@/utils/metadata';
import {
  draftFingerprint,
  parseNewDraftRecovery,
  type DraftIdentity,
  type NewDraftRecovery,
} from '@/utils/editor/newDraftRecovery';
import { ArticleMetadataForm } from '../articles/new/components/ArticleMetadataForm';
import { ArticlePreview } from '../articles/new/components/ArticlePreview';
import { EditorActions } from '../articles/new/components/EditorActions';
import { EditorLayout } from '../articles/new/components/EditorLayout';
import { SaveStatus } from '../articles/new/components/SaveStatus';
import { useAutoSave } from '../articles/new/hooks/useAutoSave';
import { useMetadataExtraction } from '../articles/new/hooks/useMetadataExtraction';
import { RelatedContentPicker } from './RelatedContentPicker';

type Entity = 'articles' | 'case-studies';

interface CreationController {
  article: Partial<Article>;
  identity: DraftIdentity | null;
  savedFingerprint: string | null;
  queue: Promise<void>;
  pending: number;
  subscribers: Set<() => void>;
}

// A route unmount must not fork a second creation transaction. Keep pending
// work and its latest local revision owned by the browser session.
const controllers = new Map<string, CreationController>();
function releaseController(key: string, controller: CreationController) {
  if (
    !controller.pending &&
    !controller.subscribers.size &&
    controllers.get(key) === controller
  )
    controllers.delete(key);
}

async function readSavedRecord(response: Response): Promise<Article> {
  const text = await response.text();
  let value;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error(
      response.ok
        ? 'The server did not confirm the saved record.'
        : `Save failed (${response.status}).`
    );
  }
  if (!response.ok) {
    throw new Error(
      typeof value.error === 'string'
        ? value.error
        : `Save failed (${response.status}).`
    );
  }
  const record = Array.isArray(value) ? value[0] : null;
  if (
    !record ||
    !Number.isSafeInteger(record.id) ||
    record.id <= 0 ||
    typeof record.slug !== 'string' ||
    !record.slug
  ) {
    throw new Error(
      'The server did not confirm the saved record. Your local draft is retained.'
    );
  }
  return record;
}

export default function NewContentEditor({ entity }: { entity: Entity }) {
  const [session, setSession] = useState(0);
  const { user, loading } = useUser();
  if (loading) return <p role="status">Loading your account…</p>;
  if (!user) return <p role="status">Sign in to continue creating content.</p>;
  return (
    <CreationSession
      key={`${user.id}-${entity}-${session}`}
      ownerId={user.id}
      entity={entity}
      onStartNew={() => setSession((value) => value + 1)}
    />
  );
}

function CreationSession({
  entity,
  ownerId,
  onStartNew,
}: {
  entity: Entity;
  ownerId: string;
  onStartNew: () => void;
}) {
  const label = entity === 'articles' ? 'Article' : 'Case Study';
  const storageKey = `draft-${ownerId}-${entity}-new`;
  const router = useRouter();
  const routerRef = useRef(router);
  useEffect(() => {
    routerRef.current = router;
  }, [router]);
  const { enqueue } = useToast();
  const [article, setArticle] = useState<Partial<Article>>({ status: 'draft' });
  const articleRef = useRef(article);
  const controllerRef = useRef<CreationController | null>(null);
  const identityRef = useRef<DraftIdentity | null>(null);
  // Render-path mirror of identityRef. Refs may not be read while rendering, so
  // the sidebar and action UI read this instead; the ref stays authoritative for
  // the async save/publish paths that must not observe a stale render value.
  const [identity, setIdentity] = useState<DraftIdentity | null>(null);
  const savedFingerprintRef = useRef<string | null>(null);
  const temporarySlugRef = useRef('');
  const mountedRef = useRef(true);
  const busyRef = useRef(false);
  const [hydrated, setHydrated] = useState(false);
  const [openingSavedDraft, setOpeningSavedDraft] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [busy, setBusy] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);

  const persist = useCallback(() => {
    const controller = controllerRef.current;
    const recovery: NewDraftRecovery = {
      version: 1,
      ownerId,
      article: controller?.article ?? articleRef.current,
      identity: controller ? controller.identity : identityRef.current,
      savedFingerprint: controller
        ? controller.savedFingerprint
        : savedFingerprintRef.current,
    };
    try {
      localStorage.setItem(storageKey, JSON.stringify(recovery));
      if (mountedRef.current) setStorageError(null);
    } catch {
      if (mountedRef.current)
        setStorageError(
          'Browser recovery is unavailable. Keep this page open until your draft is saved to the server.'
        );
    }
  }, [storageKey, ownerId]);

  useEffect(() => {
    mountedRef.current = true;
    let initial: Partial<Article> = {
      slug: `draft-${Date.now()}-${crypto.randomUUID()}`,
      articleBody: {
        type: 'doc',
        content: [{ type: 'paragraph', content: [] }],
      },
      status: 'draft',
      wordCount: 0,
    };
    temporarySlugRef.current = initial.slug!;
    try {
      const existing = controllers.get(storageKey);
      const raw = localStorage.getItem(storageKey);
      if (existing || raw) {
        const recovery = existing ?? parseNewDraftRecovery(raw!, ownerId);
        initial = { ...initial, ...recovery.article };
        identityRef.current = recovery.identity;
        // Deliberate exception to react-hooks/set-state-in-effect. This effect is
        // the post-mount reconciliation with browser storage and the draft
        // controller registry: localStorage is unavailable during SSR, and the
        // controller/router calls below are imperative, so the restored identity
        // cannot be derived while rendering without breaking hydration.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIdentity(recovery.identity);
        savedFingerprintRef.current = recovery.savedFingerprint;
        const unsaved = draftFingerprint(initial) !== recovery.savedFingerprint;
        setDirty(unsaved);
        if (recovery.identity && !unsaved && !existing?.pending) {
          // An acknowledged local snapshot may be older than later edits from
          // another visit. Resume through the existing editor's fresh load.
          setOpeningSavedDraft(true);
          routerRef.current.replace(
            `/dashboard/${entity}/${encodeURIComponent(recovery.identity.slug)}`
          );
          try {
            localStorage.removeItem(storageKey);
          } catch {
            /* The clean snapshot remains recoverable. */
          }
        }
      }
    } catch {
      // Preserve the original bytes. A storage or parsing failure must never
      // silently delete the only recoverable copy or start an empty autosave.
      setRecoveryError(
        'The browser draft could not be restored. The stored copy has been preserved.'
      );
    }
    const controller = controllers.get(storageKey) ?? {
      article: initial,
      identity: identityRef.current,
      savedFingerprint: savedFingerprintRef.current,
      queue: Promise.resolve(),
      pending: 0,
      subscribers: new Set<() => void>(),
    };
    controllerRef.current = controller;
    controllers.set(storageKey, controller);
    const synchronize = () => {
      articleRef.current = controller.article;
      identityRef.current = controller.identity;
      setIdentity(controller.identity);
      savedFingerprintRef.current = controller.savedFingerprint;
      setArticle(controller.article);
      setDirty(
        draftFingerprint(controller.article) !== controller.savedFingerprint
      );
    };
    controller.subscribers.add(synchronize);
    articleRef.current = initial;
    setArticle(initial);
    setHydrated(true);
    return () => {
      mountedRef.current = false;
      controller.subscribers.delete(synchronize);
      releaseController(storageKey, controller);
    };
  }, [storageKey, ownerId, entity]);

  const updateArticle = useCallback(
    (updates: Partial<Article>) => {
      if (busyRef.current) return;
      const next = { ...articleRef.current, ...updates };
      if (updates.articleBody && typeof updates.articleBody === 'object') {
        const metadata = extractMetadata(updates.articleBody as JSONContent);
        if (next.headline === undefined)
          next.headline = metadata.title ?? undefined;
        if (next.description === undefined)
          next.description = metadata.description ?? undefined;
        if (next.image === undefined)
          next.image = metadata.coverImage ?? undefined;
        next.wordCount = metadata.wordCount;
        if (
          next.slug &&
          (next.slug === temporarySlugRef.current ||
            /^draft-\d+(?:-|$)/.test(next.slug)) &&
          metadata.title
        )
          next.slug = slugify(metadata.title) || next.slug;
      }
      articleRef.current = next;
      if (controllerRef.current) controllerRef.current.article = next;
      setArticle(next);
      setDirty(draftFingerprint(next) !== savedFingerprintRef.current);
      // Persist in the edit callback, before a route transition can unmount us.
      persist();
    },
    [persist]
  );

  const save = useCallback(
    (snapshot: Partial<Article>) => {
      const controller = controllerRef.current;
      if (!controller)
        return Promise.reject(new Error('The draft session has not loaded.'));
      controller.pending += 1;
      const operation = controller.queue
        .catch(() => undefined)
        .then(async () => {
          if (!mountedRef.current)
            throw new Error(
              'This draft session has closed. Recover it before saving again.'
            );
          // The slug field may hold a trailing hyphen while the author is typing
          // (slugifyInput keeps it so the next character can join it). Persist
          // only the normalized slug, so autosave never writes or rejects a
          // partially typed value.
          const normalizedSlug = slugify(snapshot.slug ?? '');
          if (!normalizedSlug)
            throw new Error('Set a valid slug before saving.');
          const identity = controller.identity;
          const payload = identity
            ? {
                slug: normalizedSlug,
                workingbody: snapshot.articleBody ?? null,
                workingheadline: snapshot.headline ?? null,
                workingdescription: snapshot.description ?? null,
                workingimage: snapshot.image ?? null,
                workingkeywords: snapshot.keywords ?? null,
                workingarticlesection: snapshot.articleSection ?? null,
                wordCount: snapshot.wordCount ?? null,
              }
            : {
                slug: normalizedSlug,
                headline: snapshot.headline ?? null,
                description: snapshot.description ?? null,
                articleBody: snapshot.articleBody ?? null,
                articleSection: snapshot.articleSection ?? null,
                keywords: snapshot.keywords ?? null,
                image: snapshot.image ?? null,
                status: 'draft',
                wordCount: snapshot.wordCount ?? null,
              };
          const response = await fetch(
            `/api/${entity}${identity ? `/${encodeURIComponent(identity.slug)}` : ''}`,
            {
              method: identity ? 'PATCH' : 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(payload),
            }
          );
          const saved = await readSavedRecord(response);
          // Identity is updated synchronously before another queued request starts.
          controller.identity = { id: saved.id, slug: saved.slug };
          if (saved.slug !== normalizedSlug) {
            persist();
            throw new Error(
              'The server did not confirm the requested slug. Your local draft is retained.'
            );
          }
          controller.savedFingerprint = draftFingerprint(snapshot);
          controller.article = { ...controller.article, id: saved.id };
          persist();
          for (const synchronize of controller.subscribers) synchronize();
        });
      controller.queue = operation;
      return operation.finally(() => {
        controller.pending -= 1;
        releaseController(storageKey, controller);
      });
    },
    [entity, persist, storageKey]
  );

  const { saveStatus, lastSaved, error, manualSave } = useAutoSave({
    article,
    onSave: save,
    enabled: hydrated && !recoveryError,
  });
  const metadata = useMetadataExtraction(article.articleBody as JSONContent);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!dirty) return;
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [dirty]);

  const handleSave = useCallback(async () => {
    if (busyRef.current) return;
    try {
      await manualSave();
      enqueue({
        title: 'Draft Saved',
        description: 'The requested revision is saved to the server.',
      });
    } catch (failure) {
      enqueue({
        title: 'Save Failed',
        description:
          failure instanceof Error
            ? failure.message
            : 'Could not save the draft.',
      });
    }
  }, [manualSave, enqueue]);

  const handlePublish = useCallback(async () => {
    if (busyRef.current) return;
    const snapshot = articleRef.current;
    if (
      !snapshot.headline?.trim() ||
      !snapshot.slug ||
      snapshot.slug === temporarySlugRef.current ||
      /^draft-\d+(?:-|$)/.test(snapshot.slug)
    ) {
      enqueue({
        title: 'Missing information',
        description: 'Set a headline and permanent slug before publishing.',
      });
      return;
    }
    busyRef.current = true;
    setBusy(true);
    try {
      await manualSave();
      const identity = identityRef.current;
      if (!identity) throw new Error('Save the draft before publishing.');
      const saved = await readSavedRecord(
        await fetch(`/api/${entity}/${encodeURIComponent(identity.slug)}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            // manualSave() above persists the normalized slug; normalize here too
            // so a trailing hyphen typed just before publishing cannot 400.
            slug: slugify(snapshot.slug ?? ''),
            status: 'published',
            published_at: new Date().toISOString(),
          }),
        })
      );
      identityRef.current = { id: saved.id, slug: saved.slug };
      setIdentity(identityRef.current);
      articleRef.current = {
        ...articleRef.current,
        status: saved.status,
        slug: saved.slug,
      };
      savedFingerprintRef.current = draftFingerprint(articleRef.current);
      if (controllerRef.current) {
        controllerRef.current.article = articleRef.current;
        controllerRef.current.identity = identityRef.current;
        controllerRef.current.savedFingerprint = savedFingerprintRef.current;
      }
      // Publishing locks editing for the save + publish transaction. The
      // complete acknowledged draft can now hand off to the existing editor.
      persist();
      try {
        localStorage.removeItem(storageKey);
      } catch {
        /* Saved recovery remains valid. */
      }
      setDirty(false);
      router.replace(`/dashboard/${entity}/${encodeURIComponent(saved.slug)}`);
      enqueue({
        title: `${label} Published`,
        description: 'Your content is now live.',
      });
    } catch (failure) {
      enqueue({
        title: 'Publish Failed',
        description:
          failure instanceof Error ? failure.message : 'Could not publish.',
      });
    } finally {
      busyRef.current = false;
      if (mountedRef.current) setBusy(false);
    }
  }, [manualSave, entity, enqueue, label, persist, router, storageKey]);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        void handleSave();
      }
      if (event.key === 'Escape') setShowPreview(false);
    };
    window.addEventListener('keydown', keydown);
    return () => window.removeEventListener('keydown', keydown);
  }, [handleSave]);

  if (openingSavedDraft) return <p role="status">Opening your saved draft…</p>;
  if (!hydrated) return <p role="status">Loading draft…</p>;
  if (recoveryError) return <p role="alert">{recoveryError}</p>;
  if (showPreview)
    return (
      <ArticlePreview article={article} onClose={() => setShowPreview(false)} />
    );

  return (
    <EditorLayout
      backHref={`/dashboard/${entity}`}
      backLabel={entity === 'articles' ? 'Articles' : 'Case Studies'}
      sidebar={
        <>
          <fieldset
            disabled={busy}
            style={{ border: 0, padding: 0, margin: 0 }}
          >
            <ArticleMetadataForm
              article={article}
              onChange={updateArticle}
              extractedMetadata={metadata}
            />
          </fieldset>
          <RelatedContentPicker
            slug={identity?.slug ?? ''}
            contentType={entity === 'articles' ? 'article' : 'case-study'}
            excludeId={identity?.id}
            disabled={!identity || busy}
          />
        </>
      }
      actions={
        <>
          {identity && (
            <Button
              variant="secondary"
              disabled={dirty || busy || saveStatus === 'saving'}
              onClick={() => {
                try {
                  localStorage.removeItem(storageKey);
                  onStartNew();
                } catch {
                  setStorageError('The browser draft could not be cleared.');
                }
              }}
            >
              Start another draft
            </Button>
          )}
          <EditorActions
            article={article}
            onSave={handleSave}
            onPublish={handlePublish}
            onUnpublish={async () => {
              router.replace(
                `/dashboard/${entity}/${encodeURIComponent(identityRef.current?.slug ?? article.slug ?? '')}`
              );
            }}
            onPreview={() => setShowPreview(true)}
            isSaving={busy || saveStatus === 'saving'}
            status={article.status || 'draft'}
          />
        </>
      }
      saveStatus={
        <SaveStatus status={saveStatus} lastSaved={lastSaved} error={error} />
      }
    >
      <h1>New {label}</h1>
      {storageError && <p role="alert">{storageError}</p>}
      {dirty && (
        <p role="status">
          Changes awaiting server save. Browser recovery is{' '}
          {storageError ? 'unavailable' : 'up to date'}.
        </p>
      )}
      <Tiptap
        article={article as Article}
        handleUpdate={updateArticle}
        editable={!busy}
        autofocus
        onMediaUploadRequiresSave={() =>
          enqueue({
            title: 'Save before adding media',
            description:
              'Save this draft first so media can be attached to it.',
          })
        }
      />
    </EditorLayout>
  );
}
