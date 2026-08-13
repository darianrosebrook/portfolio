// @vitest-environment jsdom

import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAutoSave } from '@/app/dashboard/articles/new/hooks/useAutoSave';

const article = (headline: string) => ({
  slug: 'proof-article',
  headline,
  articleBody: {
    type: 'doc',
    content: [
      { type: 'paragraph', content: [{ type: 'text', text: headline }] },
    ],
  },
  status: 'draft' as const,
});

describe('useAutoSave draft authority', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('does not write the untouched article on mount', async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    renderHook(() =>
      useAutoSave({ article: article('Loaded'), onSave, debounceMs: 25 })
    );

    await act(() => vi.advanceTimersByTimeAsync(100));

    expect(onSave).not.toHaveBeenCalled();
  });

  it('rejects manual save when persistence fails', async () => {
    const failure = new Error('database unavailable');
    const onSave = vi.fn().mockRejectedValue(failure);
    const { result } = renderHook(() =>
      useAutoSave({ article: article('Changed'), onSave, debounceMs: 25 })
    );

    let rejected: unknown;
    await act(async () => {
      try {
        await result.current.manualSave();
      } catch (error) {
        rejected = error;
      }
    });
    expect(rejected).toBe(failure);
    expect(result.current.saveStatus).toBe('error');
    expect(result.current.error).toBe('database unavailable');
  });

  it('serializes saves so an older request cannot commit after a newer one', async () => {
    const releases: Array<() => void> = [];
    const onSave = vi.fn(
      (_snapshot: unknown) =>
        new Promise<void>((resolve) => {
          releases.push(resolve);
        })
    );
    const { rerender } = renderHook(
      ({ headline }) =>
        useAutoSave({ article: article(headline), onSave, debounceMs: 25 }),
      { initialProps: { headline: 'Loaded' } }
    );

    rerender({ headline: 'Revision one' });
    await act(() => vi.advanceTimersByTimeAsync(25));
    expect(onSave).toHaveBeenCalledTimes(1);

    rerender({ headline: 'Revision two' });
    await act(() => vi.advanceTimersByTimeAsync(25));
    expect(onSave).toHaveBeenCalledTimes(1);

    await act(async () => {
      releases[0]();
      await Promise.resolve();
      await Promise.resolve();
    });
    expect(onSave).toHaveBeenCalledTimes(2);
    expect(
      (onSave.mock.calls[1]?.[0] as ReturnType<typeof article>).headline
    ).toBe('Revision two');

    await act(async () => releases[1]());
  });
});
