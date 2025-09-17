# Popover (Composer)

Headless popover orchestration with outside click and Escape handling, exposing refs for trigger and content.

## Usage

```tsx
import {
  PopoverProvider,
  usePopoverContext,
} from '@/ui/components/Popover/PopoverProvider';

function Trigger() {
  const { isOpen, toggle, triggerRef } = usePopoverContext();
  return (
    <button
      ref={triggerRef as React.RefObject<HTMLButtonElement>}
      onClick={toggle}
      aria-expanded={isOpen}
    >
      Toggle Popover
    </button>
  );
}

function Content() {
  const { isOpen, contentRef } = usePopoverContext();
  if (!isOpen) return null;
  return (
    <div
      ref={contentRef as React.RefObject<HTMLDivElement>}
      role="dialog"
      aria-modal={false}
    >
      Popover content
    </div>
  );
}

<PopoverProvider defaultOpen={false} closeOnOutsideClick closeOnEscape>
  <Trigger />
  <Content />
</PopoverProvider>;

// Tokens live in Popover.tokens.json and are bootstrapped in Popover.tokens.generated.scss
```

## Headless Hook

### usePopover(options)

Options:

- `defaultOpen` (boolean, default `false`)
- `closeOnOutsideClick` (boolean, default `true`)
- `closeOnEscape` (boolean, default `true`)

Returns:

- `isOpen`, `open()`, `close()`, `toggle()`
- `triggerRef`, `contentRef`

## Accessibility

- When the content behaves like a non-modal popup, use appropriate roles (e.g., `role="dialog"` with `aria-modal={false}` or role matching the content like `menu`).
- Manage focus: return focus to trigger after closing for keyboard users.
- Keyboard: Escape closes; Tab cycles naturally when not trapped.

## Design Tokens

- Surface, elevation, and spacing come from `Popover.tokens.json` → `Popover.tokens.generated.scss`.
