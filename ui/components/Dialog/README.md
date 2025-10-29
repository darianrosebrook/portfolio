# Dialog

Modal and non-modal dialog component with GSAP animations and proper accessibility.

## Usage

```tsx
import { Dialog } from '@/ui/components/Dialog';

// Basic modal dialog
<Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
  <Dialog.Trigger asChild>
    <button>Open Dialog</button>
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay />
    <Dialog.Content>
      <Dialog.Header>
        <Dialog.Title>Dialog Title</Dialog.Title>
        <Dialog.Description>
          Dialog description text.
        </Dialog.Description>
      </Dialog.Header>
      <Dialog.Body>
        Dialog content goes here.
      </Dialog.Body>
      <Dialog.Footer>
        <Dialog.Close asChild>
          <button>Cancel</button>
        </Dialog.Close>
        <button onClick={handleConfirm}>Confirm</button>
      </Dialog.Footer>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>

// Non-modal dialog
<Dialog.Root modal={false}>
  {/* dialog content */}
</Dialog.Root>

// Different sizes
<Dialog.Content size="sm">Small dialog</Dialog.Content>
<Dialog.Content size="lg">Large dialog</Dialog.Content>
```

## Components

### Dialog.Root

Main dialog container with state management.

**Props:**

- `open?: boolean` - Whether dialog is open
- `onOpenChange?: (open) => void` - State change handler
- `modal?: boolean` - Whether to block background interaction (default: true)

### Dialog.Trigger

Element that opens the dialog.

### Dialog.Portal

Portal container for rendering outside DOM hierarchy.

### Dialog.Overlay

Backdrop overlay.

### Dialog.Content

Main dialog content container.

**Props:**

- `size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'` - Dialog size

### Dialog.Header

Dialog header section.

### Dialog.Title

Dialog title.

### Dialog.Description

Dialog description.

### Dialog.Body

Main content area.

### Dialog.Footer

Dialog footer with actions.

### Dialog.Close

Element that closes the dialog.

## Accessibility

- Proper ARIA attributes and roles
- Focus trapping and management
- Keyboard navigation (Escape to close)
- Screen reader announcements
- Portal rendering to avoid clipping

## Design Tokens

### Colors

- `--dialog-color-background-overlay`
- `--dialog-color-background-content`
- `--dialog-color-foreground`

### Spacing

- `--dialog-spacing-padding`
- `--dialog-spacing-gap`

### Animation

- `--dialog-animation-enter-duration`
- `--dialog-animation-exit-duration`
- `--dialog-animation-enter-easing`
- `--dialog-animation-exit-easing`

## Related Components

- [Modal](../Modal/) - Simplified modal variant
- [Drawer](../Drawer/) - Slide-out panel
- [Popover](../Popover/) - Non-modal floating content

