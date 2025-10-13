# Dialog

A modal dialog component that provides accessible overlays for important user interactions. Built as a composer component with context-based state management.

## Usage

```tsx
import { Dialog } from '@/ui/components/Dialog';

function ModalExample() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Dialog</button>
      <Dialog open={open} onOpenChange={setOpen}>
        <Dialog.Header>
          <Dialog.Title>Dialog Title</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>Dialog content goes here.</Dialog.Body>
        <Dialog.Footer>
          <Dialog.Close>Cancel</Dialog.Close>
          <button>Confirm</button>
        </Dialog.Footer>
      </Dialog>
    </>
  );
}
```

## Props

| Prop         | Type                    | Default | Description                |
| ------------ | ----------------------- | ------- | -------------------------- |
| children     | ReactNode               | -       | Dialog content             |
| open         | boolean                 | false   | Controls dialog visibility |
| onOpenChange | (open: boolean) => void | -       | Open state change handler  |
| className    | string                  | ''      | Additional CSS classes     |

## Examples

### Basic Dialog

```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <Dialog.Header>
    <Dialog.Title>Confirm Action</Dialog.Title>
  </Dialog.Header>
  <Dialog.Body>Are you sure you want to proceed?</Dialog.Body>
  <Dialog.Footer>
    <Dialog.Close>Cancel</Dialog.Close>
    <button>Confirm</button>
  </Dialog.Footer>
</Dialog>
```

### Alert Dialog

```tsx
<Dialog variant="alert">
  <Dialog.Header>
    <Dialog.Title>Warning</Dialog.Title>
  </Dialog.Header>
  <Dialog.Body>This action cannot be undone.</Dialog.Body>
  <Dialog.Footer>
    <Dialog.Close>Cancel</Dialog.Close>
    <button>Delete</button>
  </Dialog.Footer>
</Dialog>
```

## Design Tokens

This component uses the following design tokens:

- `--color-background-elevated` - Dialog background
- `--color-text-primary` - Text color
- `--color-overlay-scrim` - Backdrop overlay
- `--border-radius-large` - Dialog border radius
- `--space-lg` - Internal spacing
- `--shadow-level-3` - Dialog elevation
- `--animation-duration-medium` - Animation timing

## Accessibility

### Keyboard Navigation

- Tab to navigate within dialog
- Escape to close dialog
- Focus trapped within dialog
- Return focus to trigger on close

### Screen Reader Support

- Proper ARIA dialog role
- Descriptive titles and descriptions
- Alert dialog variant for important messages
- Focus management and announcements

### States

- Modal behavior prevents background interaction
- Loading states communicated to users
- Close button clearly accessible

## Related Components

- **Sheet** - For side panel overlays
- **Popover** - For smaller contextual overlays
- **Alert** - For inline notifications
