// @vitest-environment jsdom
import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAutoSave } from '@/app/dashboard/articles/new/hooks/useAutoSave';

describe('autosave scheduling and acknowledgement', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('does not cancel an upcoming save when the callback changes after a server identity update', async () => {
    const first = vi.fn().mockResolvedValue(undefined);
    const latest = vi.fn().mockResolvedValue(undefined);
    const view = renderHook(
      ({ headline, onSave }) =>
        useAutoSave({
          article: { slug: 'draft', headline },
          onSave,
          debounceMs: 100,
        }),
      { initialProps: { headline: 'Initial', onSave: first } }
    );
    view.rerender({ headline: 'Unsaved title', onSave: first });
    await act(() => vi.advanceTimersByTimeAsync(50));
    view.rerender({ headline: 'Unsaved title', onSave: latest });
    await act(() => vi.advanceTimersByTimeAsync(50));
    expect(first).not.toHaveBeenCalled();
    expect(latest).toHaveBeenCalledExactlyOnceWith({
      slug: 'draft',
      headline: 'Unsaved title',
    });
  });

  it('does not report a newer unsaved revision as saved when an older request completes', async () => {
    let release!: () => void;
    const onSave = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        })
    );
    const view = renderHook(
      ({ headline }) =>
        useAutoSave({
          article: { slug: 'draft', headline },
          onSave,
          debounceMs: 100,
        }),
      { initialProps: { headline: 'Initial' } }
    );
    view.rerender({ headline: 'Request' });
    await act(() => vi.advanceTimersByTimeAsync(100));
    view.rerender({ headline: 'Not acknowledged' });
    await act(async () => release());
    expect(view.result.current.saveStatus).toBe('local');
    expect(onSave).toHaveBeenCalledExactlyOnceWith({
      slug: 'draft',
      headline: 'Request',
    });
  });

  it('deduplicates queued saves of identical content and retries after a failed request', async () => {
    const onSave = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(undefined);
    const { result } = renderHook(() =>
      useAutoSave({ article: { slug: 'draft', headline: 'Retained' }, onSave })
    );
    await act(async () => {
      await expect(result.current.manualSave()).rejects.toThrow('offline');
    });
    await act(async () => {
      await Promise.all([
        result.current.manualSave(),
        result.current.manualSave(),
      ]);
    });
    expect(onSave).toHaveBeenCalledTimes(2);
    expect(result.current.saveStatus).toBe('saved');
  });

  it('cancels a pending debounce on unmount without issuing an empty or stale write', async () => {
    const onSave = vi.fn();
    const view = renderHook(
      ({ headline }) =>
        useAutoSave({
          article: { slug: 'draft', headline },
          onSave,
          debounceMs: 100,
        }),
      { initialProps: { headline: 'Initial' } }
    );
    view.rerender({ headline: 'Recover locally' });
    view.unmount();
    await act(() => vi.advanceTimersByTimeAsync(200));
    expect(onSave).not.toHaveBeenCalled();
  });
});
