// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Article } from '@/types';
import NewArticlePage from '@/app/dashboard/articles/new/page';
import NewCaseStudyPage from '@/app/dashboard/case-studies/new/page';
import { createCaseStudySchema } from '@/utils/schemas/case-study.schema';
import { draftFingerprint } from '@/utils/editor/newDraftRecovery';

const { enqueue, replace, account } = vi.hoisted(() => ({
  enqueue: vi.fn(),
  replace: vi.fn(),
  account: { id: 'account-one' },
}));
vi.mock('@/context/UserContext', () => ({
  useUser: () => ({ user: account, loading: false }),
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ replace }) }));
vi.mock('@/ui/components/Toast', () => ({ useToast: () => ({ enqueue }) }));
vi.mock('@/app/dashboard/_components/RelatedContentPicker', () => ({
  RelatedContentPicker: () => null,
}));
vi.mock('@/app/dashboard/articles/new/components/ArticlePreview', () => ({
  ArticlePreview: () => null,
}));
vi.mock('@/ui/modules/Tiptap/Tiptap', () => ({
  default: ({
    article,
    handleUpdate,
    editable,
  }: {
    article: Article;
    handleUpdate: (updates: Partial<Article>) => void;
    editable: boolean;
  }) => (
    <textarea
      aria-label="Body"
      disabled={!editable}
      value={JSON.stringify(article.articleBody)}
      onChange={(event) =>
        handleUpdate({ articleBody: JSON.parse(event.target.value) })
      }
    />
  ),
}));

const body = (text: string) => ({
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
});
const response = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), { status });
const recovery = () =>
  JSON.parse(localStorage.getItem('draft-account-one-articles-new')!);
const edit = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const saveShortcut = () =>
  fireEvent.keyDown(window, { ctrlKey: true, key: 's' });
const flush = async () => {
  await act(async () => {
    await Promise.resolve();
    await Promise.resolve();
  });
};

describe('new content recovery and persistence through the rendered editor', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    const storage = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
    });
    account.id = 'account-one';
    vi.clearAllMocks();
  });
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('recovers metadata-only edits and body after immediate navigation before autosave', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const first = render(<NewArticlePage />);
    edit('Headline', 'Durable title');
    edit('Description', 'Draft description');
    edit('Keywords', 'systems, proof');
    edit('Body', JSON.stringify(body('The newest words.')));
    expect(recovery().article.description).toBe('Draft description');
    first.unmount();
    render(<NewArticlePage />);
    expect(screen.getByLabelText('Headline')).toHaveValue('Durable title');
    expect(screen.getByLabelText('Keywords')).toHaveValue('systems, proof');
    expect(
      JSON.parse((screen.getByLabelText('Body') as HTMLTextAreaElement).value)
    ).toEqual(body('The newest words.'));
    await act(() => vi.advanceTimersByTimeAsync(3000));
    expect(fetch).not.toHaveBeenCalled();
  });

  it('retains a newer revision and existing identity when an older create acknowledges after typing', async () => {
    let release!: (response: Response) => void;
    const fetch = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            release = resolve;
          })
      )
      .mockResolvedValueOnce(response([{ id: 73, slug: 'second-slug' }]));
    vi.stubGlobal('fetch', fetch);
    render(<NewArticlePage />);
    edit('Slug', 'first-slug');
    edit('Headline', 'First revision');
    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(fetch).toHaveBeenCalledTimes(1);
    edit('Headline', 'Newest revision');
    edit('Slug', 'second-slug');
    edit('Description', 'Newer metadata');
    await act(async () =>
      release(response([{ id: 73, slug: 'first-slug' }], 201))
    );
    expect(recovery().identity).toEqual({ id: 73, slug: 'first-slug' });
    expect(recovery().article.headline).toBe('Newest revision');
    expect(recovery().article.description).toBe('Newer metadata');
    expect(recovery().savedFingerprint).not.toBe(
      draftFingerprint(recovery().article)
    );
    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1][0]).toBe('/api/articles/first-slug');
    expect(fetch.mock.calls[1][1].method).toBe('PATCH');
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toMatchObject({
      slug: 'second-slug',
      workingheadline: 'Newest revision',
      workingdescription: 'Newer metadata',
    });
    expect(recovery().identity).toEqual({ id: 73, slug: 'second-slug' });
    expect(recovery().savedFingerprint).toBe(
      draftFingerprint(recovery().article)
    );
  });

  it('serializes concurrent explicit saves and creates exactly one record', async () => {
    let release!: (response: Response) => void;
    const fetch = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            release = resolve;
          })
      )
      .mockResolvedValueOnce(response([{ id: 11, slug: 'single-record' }]));
    vi.stubGlobal('fetch', fetch);
    render(<NewArticlePage />);
    edit('Slug', 'single-record');
    edit('Headline', 'First');
    saveShortcut();
    await flush();
    edit('Description', 'Queued second revision');
    saveShortcut();
    await flush();
    expect(fetch).toHaveBeenCalledTimes(1);
    await act(async () =>
      release(response([{ id: 11, slug: 'single-record' }], 201))
    );
    expect(fetch.mock.calls.map((call) => call[1].method)).toEqual([
      'POST',
      'PATCH',
    ]);
    expect(JSON.parse(fetch.mock.calls[1][1].body).workingdescription).toBe(
      'Queued second revision'
    );
  });

  it('restores the acknowledged server slug on reload while preserving a local rename', async () => {
    localStorage.setItem(
      'draft-account-one-articles-new',
      JSON.stringify({
        version: 1,
        ownerId: 'account-one',
        article: {
          id: 38,
          slug: 'local-rename',
          headline: 'Recovered',
          articleBody: body('Retained'),
          status: 'draft',
        },
        identity: { id: 38, slug: 'server-slug' },
        savedFingerprint: 'older',
      })
    );
    const fetch = vi
      .fn()
      .mockResolvedValue(response([{ id: 38, slug: 'local-rename' }]));
    vi.stubGlobal('fetch', fetch);
    render(<NewArticlePage />);
    saveShortcut();
    await flush();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe('/api/articles/server-slug');
    expect(fetch.mock.calls[0][1].method).toBe('PATCH');
    expect(JSON.parse(fetch.mock.calls[0][1].body).workingbody).toEqual(
      body('Retained')
    );
  });

  it('opens the existing editor for a clean recovered draft instead of editing a stale local snapshot', () => {
    const article: Partial<Article> = {
      id: 61,
      slug: 'saved-draft',
      headline: 'Earlier snapshot',
      articleBody: body('Previously acknowledged'),
      status: 'draft',
      wordCount: 0,
    };
    localStorage.setItem(
      'draft-account-one-articles-new',
      JSON.stringify({
        version: 1,
        ownerId: 'account-one',
        article,
        identity: { id: 61, slug: 'saved-draft' },
        savedFingerprint: draftFingerprint(article),
      })
    );
    vi.stubGlobal('fetch', vi.fn());
    render(<NewArticlePage />);
    expect(replace).toHaveBeenCalledWith('/dashboard/articles/saved-draft');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Opening your saved draft'
    );
    expect(screen.queryByLabelText('Headline')).not.toBeInTheDocument();
  });

  it('reports a missing save acknowledgement without discarding the recoverable draft', async () => {
    const fetch = vi.fn().mockResolvedValue(response([]));
    vi.stubGlobal('fetch', fetch);
    render(<NewArticlePage />);
    edit('Headline', 'Do not lose this');
    saveShortcut();
    await flush();
    expect(recovery().article.headline).toBe('Do not lose this');
    expect(recovery().identity).toBeNull();
    expect(
      screen.getByText(/server did not confirm the saved record/i)
    ).toBeInTheDocument();
    expect(enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Save Failed' })
    );
  });

  it('retries a failed save without claiming a success or dropping local metadata', async () => {
    const fetch = vi
      .fn()
      .mockRejectedValueOnce(new Error('Network offline'))
      .mockResolvedValueOnce(response([{ id: 90, slug: 'retry' }], 201));
    vi.stubGlobal('fetch', fetch);
    render(<NewArticlePage />);
    edit('Slug', 'retry');
    edit('Description', 'Recovery after failure');
    saveShortcut();
    await flush();
    expect(screen.getByText('Network offline')).toBeInTheDocument();
    expect(recovery().article.description).toBe('Recovery after failure');
    saveShortcut();
    await flush();
    expect(recovery().identity).toEqual({ id: 90, slug: 'retry' });
    expect(screen.getByText('Saved to server')).toBeInTheDocument();
  });

  it('creates case studies with a payload accepted by the real API schema', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(response([{ id: 27, slug: 'case-study' }], 201));
    vi.stubGlobal('fetch', fetch);
    render(<NewCaseStudyPage />);
    expect(
      screen.getByRole('link', { name: /Back to Case Studies/ })
    ).toHaveAttribute('href', '/dashboard/case-studies');
    edit('Headline', 'A useful case study');
    edit('Slug', 'case-study');
    saveShortcut();
    await flush();
    expect(fetch.mock.calls[0][0]).toBe('/api/case-studies');
    const payload = JSON.parse(fetch.mock.calls[0][1].body);
    expect(createCaseStudySchema.safeParse(payload).success).toBe(true);
    expect(payload).toMatchObject({
      headline: 'A useful case study',
      slug: 'case-study',
      status: 'draft',
    });
    expect(localStorage.getItem('draft-account-one-articles-new')).toBeNull();
    expect(
      JSON.parse(localStorage.getItem('draft-account-one-case-studies-new')!)
        .identity
    ).toEqual({ id: 27, slug: 'case-study' });
  });

  it('does not publish after a failed save and keeps the latest content recoverable', async () => {
    const fetch = vi
      .fn()
      .mockResolvedValue(response({ error: 'Save unavailable' }, 503));
    vi.stubGlobal('fetch', fetch);
    render(<NewArticlePage />);
    edit('Headline', 'Ready');
    edit('Slug', 'ready');
    fireEvent.click(screen.getByRole('button', { name: 'Publish' }));
    await flush();
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][1].method).toBe('POST');
    expect(replace).not.toHaveBeenCalled();
    expect(recovery().article.headline).toBe('Ready');
    expect(enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Publish Failed' })
    );
  });

  it('publishes the acknowledged draft while editing is locked and opens the saved editor', async () => {
    let release!: (response: Response) => void;
    const fetch = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            release = resolve;
          })
      )
      .mockResolvedValueOnce(
        response([{ id: 14, slug: 'ready', status: 'published' }])
      );
    vi.stubGlobal('fetch', fetch);
    render(<NewArticlePage />);
    edit('Headline', 'Ready');
    edit('Slug', 'ready');
    fireEvent.click(screen.getByRole('button', { name: 'Publish' }));
    await flush();
    expect(screen.getByLabelText('Headline')).toBeDisabled();
    expect(screen.getByLabelText('Body')).toBeDisabled();
    await act(async () => release(response([{ id: 14, slug: 'ready' }], 201)));
    expect(fetch.mock.calls.map((call) => call[1].method)).toEqual([
      'POST',
      'PUT',
    ]);
    expect(replace).toHaveBeenCalledWith('/dashboard/articles/ready');
    expect(localStorage.getItem('draft-account-one-articles-new')).toBeNull();
  });

  it('isolates recovery across accounts and never imports the old unscoped draft automatically', () => {
    vi.stubGlobal('fetch', vi.fn());
    localStorage.setItem(
      'draft-article-new',
      JSON.stringify({
        headline: 'Legacy ownerless content',
        id: 3,
        slug: 'legacy',
      })
    );
    const first = render(<NewArticlePage />);
    edit('Headline', 'Account one private content');
    first.unmount();
    account.id = 'account-two';
    render(<NewArticlePage />);
    expect(screen.getByLabelText('Headline')).toHaveValue('');
    expect(localStorage.getItem('draft-article-new')).toContain(
      'Legacy ownerless content'
    );
    expect(
      JSON.parse(localStorage.getItem('draft-account-one-articles-new')!)
        .article.headline
    ).toBe('Account one private content');
  });

  it('shares the pending create across remounts and merges its acknowledgement with the newest local draft', async () => {
    let release!: (value: Response) => void;
    const fetch = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<Response>((resolve) => {
            release = resolve;
          })
      )
      .mockResolvedValueOnce(response([{ id: 84, slug: 'same-draft' }]));
    vi.stubGlobal('fetch', fetch);
    const first = render(<NewArticlePage />);
    edit('Slug', 'same-draft');
    edit('Headline', 'Before navigating');
    saveShortcut();
    await flush();
    first.unmount();
    render(<NewArticlePage />);
    edit('Headline', 'Written after remount');
    edit('Description', 'Newest recovered metadata');
    saveShortcut();
    await flush();
    expect(fetch).toHaveBeenCalledTimes(1);
    await act(async () =>
      release(response([{ id: 84, slug: 'same-draft' }], 201))
    );
    expect(fetch.mock.calls.map((call) => call[1].method)).toEqual([
      'POST',
      'PATCH',
    ]);
    expect(fetch.mock.calls[1][0]).toBe('/api/articles/same-draft');
    expect(JSON.parse(fetch.mock.calls[1][1].body)).toMatchObject({
      workingheadline: 'Written after remount',
      workingdescription: 'Newest recovered metadata',
    });
    const saved = JSON.parse(
      localStorage.getItem('draft-account-one-articles-new')!
    );
    expect(saved.identity).toEqual({ id: 84, slug: 'same-draft' });
    expect(saved.article.headline).toBe('Written after remount');
    expect(saved.article.description).toBe('Newest recovered metadata');
  });

  it('does not issue a queued write under another account after an account switch', async () => {
    let release!: (value: Response) => void;
    const fetch = vi.fn().mockImplementationOnce(
      () =>
        new Promise<Response>((resolve) => {
          release = resolve;
        })
    );
    vi.stubGlobal('fetch', fetch);
    const view = render(<NewArticlePage />);
    edit('Slug', 'private-draft');
    edit('Headline', 'Private title');
    saveShortcut();
    await flush();
    edit('Description', 'Newer private metadata');
    saveShortcut();
    await flush();
    account.id = 'account-two';
    view.rerender(<NewArticlePage />);
    expect(screen.getByLabelText('Headline')).toHaveValue('');
    await act(async () =>
      release(response([{ id: 78, slug: 'private-draft' }], 201))
    );
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(localStorage.getItem('draft-account-two-articles-new')).toBeNull();
    const retained = JSON.parse(
      localStorage.getItem('draft-account-one-articles-new')!
    );
    expect(retained.identity).toEqual({ id: 78, slug: 'private-draft' });
    expect(retained.article.description).toBe('Newer private metadata');
    expect(retained.savedFingerprint).not.toBe(
      draftFingerprint(retained.article)
    );
  });

  it('preserves malformed recovery bytes and refuses to autosave an empty replacement', async () => {
    localStorage.setItem('draft-account-one-articles-new', '{unreadable');
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    render(<NewArticlePage />);
    expect(screen.getByRole('alert')).toHaveTextContent(
      'stored copy has been preserved'
    );
    await act(() => vi.advanceTimersByTimeAsync(5000));
    expect(fetch).not.toHaveBeenCalled();
    expect(localStorage.getItem('draft-account-one-articles-new')).toBe(
      '{unreadable'
    );
  });

  it('reports unavailable browser recovery while retaining edits and protecting unload', () => {
    vi.stubGlobal('fetch', vi.fn());
    render(<NewArticlePage />);
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });
    edit('Description', 'Unsaved content');
    expect(screen.getByLabelText('Description')).toHaveValue('Unsaved content');
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Browser recovery is unavailable'
    );
    const event = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(true);
  });
});
