# Sheet

Slide-out panel component that appears from any side of the screen.

## Usage

```tsx
import { Sheet } from '@/ui/components/Sheet';

// Basic sheet
<Sheet.Root open={isOpen} onOpenChange={setIsOpen}>
  <Sheet.Trigger asChild>
    <button>Open Sheet</button>
  </Sheet.Trigger>
  <Sheet.Portal>
    <Sheet.Overlay />
    <Sheet.Content side="right">
      <Sheet.Header>
        <Sheet.Title>Sheet Title</Sheet.Title>
        <Sheet.Description>
          Sheet description text.
        </Sheet.Description>
      </Sheet.Header>
      <Sheet.Body>
        Sheet content goes here.
      </Sheet.Body>
      <Sheet.Footer>
        <Sheet.Close asChild>
          <button>Close</button>
        </Sheet.Close>
      </Sheet.Footer>
    </Sheet.Content>
  </Sheet.Portal>
</Sheet.Root>

// Different sides
<Sheet.Content side="left">Left sheet</Sheet.Content>
<Sheet.Content side="top">Top sheet</Sheet.Content>
<Sheet.Content side="bottom">Bottom sheet</Sheet.Content>

// Non-modal sheet
<Sheet.Root modal={false}>
  {/* sheet content */}
</Sheet.Root>
```

## Components

### Sheet.Root

Main sheet container.

**Props:**

- `open?: boolean` - Whether sheet is open
- `onOpenChange?: (open) => void` - State change handler
- `modal?: boolean` - Whether to block background (default: true)

### Sheet.Trigger

Element that opens the sheet.

### Sheet.Portal

Portal container for rendering.

### Sheet.Overlay

Backdrop overlay.

### Sheet.Content

Main sheet content container.

**Props:**

- `side?: 'top' | 'right' | 'bottom' | 'left'` - Which side to slide from

### Sheet.Header

Sheet header section.

### Sheet.Title

Sheet title.

### Sheet.Description

Sheet description.

### Sheet.Body

Main content area.

### Sheet.Footer

Sheet footer with actions.

### Sheet.Close

Element that closes the sheet.

## Accessibility

- Proper ARIA attributes and focus management
- Keyboard navigation (Escape to close)
- Screen reader support
- Portal rendering to avoid clipping
- Focus trapping in modal mode

## Design Tokens

### Colors

- `--sheet-color-background-overlay`
- `--sheet-color-background-content`
- `--sheet-color-foreground`

### Spacing

- `--sheet-spacing-padding`
- `--sheet-size-width` (for side sheets)
- `--sheet-size-height` (for top/bottom sheets)

### Animation

- `--sheet-animation-enter-duration`
- `--sheet-animation-exit-duration`
- `--sheet-animation-enter-easing`
- `--sheet-animation-exit-easing`

## Related Components

- [Dialog](../Dialog/) - Modal dialogs
- [Drawer](../Drawer/) - Alternative slide-out component
- [Popover](../Popover/) - Non-modal floating content

