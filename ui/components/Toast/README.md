# Toast (Composer)

Composer for ephemeral notifications. Headless queue with up to 3 visible toasts stacked in the bottom-right. Tokenized visuals and slot-based UI.

## Key ideas

- Headless logic in `useToast` (queue, timers, transitions)
- Context provider exposes `enqueue`, `dismiss`, `clear`, `pause`, `resume`
- Slots: `ToastTitle`, `ToastDescription`, `ToastAction`, `ToastClose`
- Tokenized visuals: no hardcoded colors; supports variants

## Usage

```tsx
import { ToastProvider, ToastViewport, useToast } from '@/ui/components/Toast';

function Demo() {
  const { enqueue } = useToast();
  return (
    <div>
      <button
        onClick={() =>
          enqueue({
            title: 'Saved',
            description: 'Your changes were saved',
            variant: 'success',
          })
        }
      >
        Notify
      </button>
      <ToastViewport />
    </div>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  );
}
```

## API

- `enqueue(opts: ToastOptions): ToastId`
- `dismiss(id?: ToastId): void`
- `clear(): void`
- `pause(id: ToastId): void`
- `resume(id: ToastId): void`

### ToastOptions

- `id?: string`
- `title?: ReactNode`
- `description?: ReactNode`
- `action?: { label: string; onClick(): void }`
- `variant?: 'info'|'success'|'warning'|'error'` (default: info)
- `autoDismiss?: boolean` (default: true)
- `durationMs?: number` (default: 5000)
- `dismissible?: boolean` (default: true)

## Accessibility

- Viewport uses `role="status"` and `aria-live="polite"` (or `alert/assertive`)
- Error variant uses `role="alert"`
- `Esc` recommended to dismiss focused toast via `ToastClose`
- Pause timers on hover/focus; resume on leave

## Tokens

See `Toast.tokens.json` for surface, spacing, motion, and variant accents.

## Notes

- Stacks show most recent 3; dismiss transitions out, then backfills from queue.
- Uses logical properties for placement (RTL-friendly).
