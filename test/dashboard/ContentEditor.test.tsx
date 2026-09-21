import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  cleanup,
} from '@testing-library/react';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import type { Article } from '@/types';
import ContentEditor from '@/app/dashboard/_components/ContentEditor';
import {
  readRecovery,
  writeRecovery,
  recoveryKey,
  toLocalDateTime,
} from '@/utils/editor/draftRecovery';

vi.mock('next/dynamic', () => ({
  default: () => () => <div>Body editor</div>,
}));
vi.mock('@tiptap/html', () => ({ generateHTML: () => '<p>Preview</p>' }));
vi.mock('@/ui/modules/Tiptap/extensionsRegistry', () => ({
  createPreviewExtensions: () => [],
}));
vi.mock('@/ui/components/Button', () => ({
  default: ({
    children,
    variant: _v,
    ...props
  }: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: string }) => (
    <button {...props}>{children}</button>
  ),
}));
vi.mock('@/ui/components/Checkbox', () => ({
  default: (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input type="checkbox" {...props} />
  ),
}));
vi.mock('@/app/dashboard/_components/RelatedContentPicker', () => ({
  RelatedContentPicker: () => null,
}));
vi.mock('@/app/dashboard/_components/ConfirmDialog', () => ({
  ConfirmDialog: ({
    open,
    title,
    description,
    confirmLabel,
    onConfirm,
    onCancel,
  }: {
    open: boolean;
    title: string;
    description: React.ReactNode;
    confirmLabel: string;
    onConfirm: () => void;
    onCancel: () => void;
  }) =>
    open ? (
      // The copy is surfaced so a test can assert what the author is told. The
      // button labels are unchanged so the existing tests keep working. Note
      // this file runs on fake timers, so assertions must be synchronous --
      // findBy*/waitFor never resolve here.
      <div role="dialog" data-title={title} data-confirm-label={confirmLabel}>
        <h2>{title}</h2>
        <div data-testid="dialog-description">{description}</div>
        <button onClick={onConfirm}>Confirm transition</button>
        <button onClick={onCancel}>Cancel transition</button>
      </div>
    ) : null,
}));

const initial = (overrides: Partial<Article> = {}): Article =>
  ({
    id: 7,
    author: 'author-one',
    editor: 'author-one',
    slug: 'existing-article',
    headline: 'Published title',
    description: '',
    image: null,
    keywords: null,
    articleSection: null,
    articleBody: { type: 'doc', content: [] },
    wordCount: 0,
    status: 'published',
    published_at: '2026-09-07T17:30:00.000Z',
    created_at: '2026-09-01T12:00:00.000Z',
    modified_at: null,
    is_dirty: false,
    ...overrides,
  }) as Article;
const response = (row: Article) =>
  new Response(JSON.stringify([row]), { status: 200 });
const deferred = () => {
  let resolve!: (response: Response) => void;
  const promise = new Promise<Response>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};
const changeHeadline = (value: string) =>
  fireEvent.change(screen.getByLabelText('Headline'), { target: { value } });

beforeEach(() => {
  vi.useFakeTimers();
  const data = new Map<string, string>();
  vi.mocked(localStorage.getItem).mockImplementation(
    (key) => data.get(key) ?? null
  );
  vi.mocked(localStorage.setItem).mockImplementation((key, value) => {
    data.set(key, value);
  });
  vi.mocked(localStorage.removeItem).mockImplementation((key) => {
    data.delete(key);
  });
  vi.mocked(localStorage.clear).mockImplementation(() => data.clear());
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('existing content draft lifecycle', () => {
  it('recovers edits after navigation cancels the pending debounce without writing on mount', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    const row = initial();
    const mounted = render(<ContentEditor initial={row} entity="articles" />);
    expect(fetch).not.toHaveBeenCalled();
    changeHeadline('Recovered title');
    mounted.unmount();
    await act(() => vi.advanceTimersByTimeAsync(1500));
    expect(fetch).not.toHaveBeenCalled();
    expect(
      readRecovery(localStorage, recoveryKey('articles', row))?.headline
    ).toBe('Recovered title');
    render(<ContentEditor initial={row} entity="articles" />);
    expect(screen.getByLabelText('Headline')).toHaveValue('Published title');
    fireEvent.click(screen.getByText('Restore local draft'));
    expect(screen.getByLabelText('Headline')).toHaveValue('Recovered title');
  });

  it('keeps a newer recovery revision when an older save completes', async () => {
    const save = deferred();
    const fetch = vi.fn(() => save.promise);
    vi.stubGlobal('fetch', fetch);
    const row = initial();
    render(<ContentEditor initial={row} entity="articles" />);
    changeHeadline('Revision one');
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(fetch).toHaveBeenCalledTimes(1);
    changeHeadline('Revision two');
    await act(async () => {
      save.resolve(
        response({ ...row, workingheadline: 'Revision one', is_dirty: true })
      );
    });
    expect(
      readRecovery(localStorage, recoveryKey('articles', row))?.headline
    ).toBe('Revision two');
    expect(screen.getByLabelText('Headline')).toHaveValue('Revision two');
  });

  it('preserves unsaved text across a same-document server refresh', async () => {
    const row = initial();
    const fetch = vi.fn(async () =>
      response({ ...row, workingheadline: 'Local text', is_dirty: true })
    );
    vi.stubGlobal('fetch', fetch);
    const view = render(<ContentEditor initial={row} entity="articles" />);
    changeHeadline('Local text');
    view.rerender(
      <ContentEditor
        initial={{ ...row, headline: 'Refreshed title' }}
        entity="articles"
      />
    );
    expect(screen.getByLabelText('Headline')).toHaveValue('Local text');
    expect(
      readRecovery(localStorage, recoveryKey('articles', row))?.headline
    ).toBe('Local text');
    await act(() => vi.advanceTimersByTimeAsync(1000));
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('requires a recovery choice before edits or saves can overwrite the local version', async () => {
    const row = initial();
    writeRecovery(localStorage, recoveryKey('articles', row), {
      ...row,
      headline: 'Unrecovered text',
    });
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    render(<ContentEditor initial={row} entity="articles" />);
    expect(screen.getByText('Save draft')).toBeDisabled();
    // Even programmatic input must not overwrite a recovery awaiting a choice.
    changeHeadline('Attempted overwrite');
    await act(() => vi.advanceTimersByTimeAsync(1500));
    expect(fetch).not.toHaveBeenCalled();
    expect(
      readRecovery(localStorage, recoveryKey('articles', row))?.headline
    ).toBe('Unrecovered text');
    fireEvent.click(screen.getByText('Restore local draft'));
    expect(screen.getByLabelText('Headline')).toHaveValue('Unrecovered text');
    expect(screen.getByText('Save draft')).not.toBeDisabled();
  });

  it('retains recovery when a successful response contains an older or foreign revision', async () => {
    const row = initial();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => response(row))
    );
    render(<ContentEditor initial={row} entity="articles" />);
    changeHeadline('Unconfirmed text');
    await act(async () => fireEvent.click(screen.getByText('Save draft')));
    expect(
      screen.getByText(/server did not confirm this draft revision/)
    ).toBeInTheDocument();
    expect(
      readRecovery(localStorage, recoveryKey('articles', row))?.headline
    ).toBe('Unconfirmed text');
    const pending = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(pending);
    expect(pending.defaultPrevented).toBe(true);
  });

  it('warns before unload until the current revision is acknowledged', async () => {
    const row = initial();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        response({ ...row, workingheadline: 'Pending title', is_dirty: true })
      )
    );
    render(<ContentEditor initial={row} entity="articles" />);
    changeHeadline('Pending title');
    const pending = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(pending);
    expect(pending.defaultPrevented).toBe(true);
    await act(() => vi.advanceTimersByTimeAsync(1000));
    const saved = new Event('beforeunload', { cancelable: true });
    window.dispatchEvent(saved);
    expect(saved.defaultPrevented).toBe(false);
    expect(readRecovery(localStorage, recoveryKey('articles', row))).toBeNull();
  });

  it('waits for an in-flight autosave before discarding and does not revive it later', async () => {
    const save = deferred();
    const row = initial({ is_dirty: true, workingheadline: 'Old draft' });
    const fetch = vi
      .fn()
      .mockImplementationOnce(() => save.promise)
      .mockResolvedValueOnce(
        response({ ...row, is_dirty: false, workingheadline: row.headline })
      );
    vi.stubGlobal('fetch', fetch);
    render(<ContentEditor initial={row} entity="articles" />);
    changeHeadline('Discard this revision');
    await act(() => vi.advanceTimersByTimeAsync(1000));
    fireEvent.click(screen.getByText('Discard changes'));
    fireEvent.click(screen.getByText('Confirm transition'));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Save draft')).toBeDisabled();
    await act(async () => {
      save.resolve(
        response({ ...row, workingheadline: 'Discard this revision' })
      );
    });
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(fetch.mock.calls[1][0]).toBe(
      '/api/articles/existing-article/discard'
    );
    await act(() => vi.advanceTimersByTimeAsync(3000));
    expect(fetch).toHaveBeenCalledTimes(2);
    expect(screen.getByLabelText('Headline')).toHaveValue('Published title');
    expect(readRecovery(localStorage, recoveryKey('articles', row))).toBeNull();
  });

  it('cancels a not-yet-started autosave when discarding', async () => {
    const row = initial({ is_dirty: true });
    const fetch = vi.fn<typeof globalThis.fetch>(async () =>
      response({ ...row, is_dirty: false })
    );
    vi.stubGlobal('fetch', fetch);
    render(<ContentEditor initial={row} entity="articles" />);
    changeHeadline('Discard pending');
    fireEvent.click(screen.getByText('Discard changes'));
    await act(async () => {
      fireEvent.click(screen.getByText('Confirm transition'));
    });
    await act(() => vi.advanceTimersByTimeAsync(2000));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch.mock.calls[0][0]).toBe(
      '/api/articles/existing-article/discard'
    );
  });

  it('retains recovery on failed or empty save acknowledgements', async () => {
    const row = initial();
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('[]', { status: 200 }))
    );
    render(<ContentEditor initial={row} entity="articles" />);
    changeHeadline('Still needs saving');
    await act(async () => {
      fireEvent.click(screen.getByText('Save draft'));
    });
    expect(screen.getByText(/Save returned no record/)).toBeInTheDocument();
    expect(
      readRecovery(localStorage, recoveryKey('articles', row))?.headline
    ).toBe('Still needs saving');
  });

  it('persists publication metadata explicitly without a timezone shift', async () => {
    const row = initial();
    const entered = '2026-09-09T10:45';
    const stored = new Date(entered).toISOString();
    const fetch = vi.fn<typeof globalThis.fetch>(async () =>
      response({ ...row, published_at: stored })
    );
    vi.stubGlobal('fetch', fetch);
    render(<ContentEditor initial={row} entity="articles" />);
    fireEvent.change(screen.getByLabelText('Published at'), {
      target: { value: entered },
    });
    expect(screen.getByLabelText('Published at')).toHaveValue(entered);
    await act(async () => {
      fireEvent.click(screen.getByText('Save draft'));
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(JSON.parse(fetch.mock.calls[0][1]?.body as string)).toMatchObject({
      published_at: stored,
    });
    expect(screen.getByLabelText('Published at')).toHaveValue(entered);
    expect(readRecovery(localStorage, recoveryKey('articles', row))).toBeNull();
  });

  it('renders local wall-clock time and isolates recovery by account and content type', () => {
    const iso = new Date(2026, 8, 7, 10, 30).toISOString();
    expect(toLocalDateTime(iso)).toBe('2026-09-07T10:30');
    expect(toLocalDateTime('invalid')).toBe('');
    expect(recoveryKey('articles', initial())).not.toBe(
      recoveryKey('case-studies', initial())
    );
    expect(recoveryKey('articles', initial())).not.toBe(
      recoveryKey('articles', initial({ author: 'other' }))
    );
  });
});

describe('confirm copy when returning content to draft', () => {
  it('tells a scheduled item it returns to draft rather than that it disappears', () => {
    render(
      <ContentEditor
        initial={initial({
          status: 'scheduled' as unknown as Article['status'],
          published_at: null,
        })}
        entity="articles"
      />
    );

    fireEvent.click(screen.getByText('Unschedule'));

    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('data-confirm-label')).toBe('Unschedule');
    expect(dialog.getAttribute('data-title')).toMatch(/unschedule/i);
    expect(dialog.textContent).not.toMatch(/disappear from the public site/i);
    expect(dialog.textContent).toMatch(/schedule is cleared/i);
  });

  it('keeps the publish-specific copy for a published item', () => {
    render(<ContentEditor initial={initial()} entity="articles" />);

    fireEvent.click(screen.getByText('Unpublish'));

    const dialog = screen.getByRole('dialog');
    expect(dialog.getAttribute('data-confirm-label')).toBe('Unpublish');
    expect(dialog.textContent).toMatch(/disappear from the public site/i);
  });
});
