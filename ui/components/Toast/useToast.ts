import * as React from 'react';
import type {
  ToastContextValue,
  ToastId,
  ToastOptions,
  ToastRecord,
  ToastState,
  ToastVariant,
} from './types';

const DEFAULT_DURATION = 5000;
const MAX_VISIBLE = 3;

function generateId(): ToastId {
  return Math.random().toString(36).slice(2, 10);
}

function toRecord(opts: ToastOptions): ToastRecord {
  return {
    id: opts.id ?? generateId(),
    title: opts.title,
    description: opts.description,
    action: opts.action,
    variant: opts.variant ?? 'info',
    autoDismiss: opts.autoDismiss ?? true,
    durationMs: opts.durationMs ?? DEFAULT_DURATION,
    dismissible: opts.dismissible ?? true,
    state: 'entering',
    createdAt: Date.now(),
  };
}

export function useToastLogic(): ToastContextValue {
  const [toasts, setToasts] = React.useState<Map<ToastId, ToastRecord>>(
    new Map()
  );
  const [visibleIds, setVisibleIds] = React.useState<ToastId[]>([]);
  const queueRef = React.useRef<ToastId[]>([]);
  const timersRef = React.useRef<Map<ToastId, number>>(new Map());

  const scheduleDismiss = React.useCallback((id: ToastId, delay: number) => {
    if (timersRef.current.has(id)) return;
    const timer = window.setTimeout(() => {
      // start leaving
      setToasts((prev) => {
        const next = new Map(prev);
        const rec = next.get(id);
        if (!rec) return prev;
        next.set(id, { ...rec, state: 'leaving' });
        return next;
      });
      // remove after transition
      const removeDelay = 250;
      window.setTimeout(() => {
        setToasts((prev) => {
          const next = new Map(prev);
          next.delete(id);
          return next;
        });
        setVisibleIds((prev) => {
          const next = prev.filter((v) => v !== id);
          return next;
        });
        // backfill from queue
        setVisibleIds((prev) => {
          let next = prev;
          while (next.length < MAX_VISIBLE && queueRef.current.length > 0) {
            const nextId = queueRef.current.shift()!;
            next = [...next, nextId];
          }
          return next;
        });
        timersRef.current.delete(id);
      }, removeDelay);
      timersRef.current.set(id, timer);
    }, delay);
  }, []);

  const enqueue = React.useCallback(
    (opts: ToastOptions): ToastId => {
      const rec = toRecord(opts);
      setToasts((prev) => new Map(prev).set(rec.id, rec));
      setVisibleIds((prev) => {
        if (prev.length < MAX_VISIBLE) {
          return [...prev, rec.id];
        }
        queueRef.current.push(rec.id);
        return prev;
      });
      if (rec.autoDismiss) scheduleDismiss(rec.id, rec.durationMs);
      // end entering after a tick
      requestAnimationFrame(() => {
        setToasts((prev) => {
          const next = new Map(prev);
          const r = next.get(rec.id);
          if (r && r.state === 'entering')
            next.set(rec.id, { ...r, state: 'visible' });
          return next;
        });
      });
      return rec.id;
    },
    [scheduleDismiss]
  );

  const dismiss = React.useCallback((id?: ToastId) => {
    setToasts((prev) => {
      const next = new Map(prev);
      const ids: ToastId[] = id ? [id] : Array.from(next.keys());
      for (const k of ids) {
        const rec = next.get(k);
        if (!rec) continue;
        next.set(k, { ...rec, state: 'leaving' });
      }
      return next;
    });
    // actual removal handled by scheduleDismiss removal window, emulate same timing
    window.setTimeout(() => {
      setToasts((prev) => {
        const next = new Map(prev);
        if (id) next.delete(id);
        return next;
      });
      setVisibleIds((prev) => {
        const after = id ? prev.filter((v) => v !== id) : [];
        return after;
      });
      // backfill from queue
      setVisibleIds((prev) => {
        let next = prev;
        while (next.length < MAX_VISIBLE && queueRef.current.length > 0) {
          const nextId = queueRef.current.shift()!;
          next = [...next, nextId];
        }
        return next;
      });
    }, 250);
  }, []);

  const clear = React.useCallback(() => {
    setToasts(new Map());
    setVisibleIds([]);
    queueRef.current = [];
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current.clear();
  }, []);

  const pause = React.useCallback((id: ToastId) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const resume = React.useCallback(
    (id: ToastId) => {
      const rec = toasts.get(id);
      if (!rec || !rec.autoDismiss) return;
      // resume with half of remaining or default small delay
      scheduleDismiss(id, Math.max(1500, rec.durationMs / 2));
    },
    [toasts, scheduleDismiss]
  );

  return {
    toasts,
    visibleIds,
    enqueue,
    dismiss,
    clear,
    pause,
    resume,
  };
}
