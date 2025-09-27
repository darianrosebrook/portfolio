# Sheet

A side panel component that slides in from the edge of the screen. Perfect for navigation menus, settings panels, and other side content.

## Usage

```tsx
import { Sheet } from '@/ui/components/Sheet';

function SidePanel() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button onClick={() => setOpen(true)}>Open Sheet</button>
      <Sheet open={open} onOpenChange={setOpen}>
        <Sheet.Header>
          <Sheet.Title>Settings</Sheet.Title>
        </Sheet.Header>
        <Sheet.Body>
          <p>Sheet content goes here.</p>
        </Sheet.Body>
        <Sheet.Footer>
          <Sheet.Close>Close</Sheet.Close>
        </Sheet.Footer>
      </Sheet>
    </>
  );
}
```

## Props

| Prop         | Type                    | Default  | Description                |
| ------------ | ----------------------- | -------- | -------------------------- |
| children     | ReactNode               | -        | Sheet content              |
| open         | boolean                 | false    | Controls sheet visibility  |
| onOpenChange | (open: boolean) => void | -        | Open state change handler  |
| side         | 'left' \| 'right'       | 'right'  | Which side to slide from   |
| className    | string                  | ''       | Additional CSS classes     |

## Examples

### Right Slide Sheet

```tsx
<Sheet open={isOpen} onOpenChange={setIsOpen}>
  <Sheet.Header>
    <Sheet.Title>Navigation</Sheet.Title>
  </Sheet.Header>
  <Sheet.Body>
    <nav>
      <a href="/home">Home</a>
      <a href="/about">About</a>
      <a href="/contact">Contact</a>
    </nav>
  </Sheet.Body>
</Sheet>
```

### Left Slide Sheet

```tsx
<Sheet open={isOpen} onOpenChange={setIsOpen} side="left">
  <Sheet.Header>
    <Sheet.Title>Filters</Sheet.Title>
  </Sheet.Header>
  <Sheet.Body>
    <div>Filter controls go here</div>
  </Sheet.Body>
</Sheet>
```

## Design Tokens

This component uses the following design tokens:

- `--color-background-primary` - Sheet background
- `--color-text-primary` - Text color
- `--color-overlay-scrim` - Backdrop overlay
- `--border-radius-large` - Border radius
- `--space-lg` - Internal spacing
- `--shadow-level-2` - Sheet elevation
- `--animation-duration-medium` - Slide animation timing

## Accessibility

### Keyboard Navigation

- Tab to navigate within sheet
- Escape to close sheet
- Focus trapped within sheet
- Return focus to trigger on close

### Screen Reader Support

- Proper ARIA dialog role
- Descriptive titles
- Focus management
- Screen reader announcements

### States

- Modal behavior prevents background interaction
- Close button clearly accessible
- Responsive behavior on mobile

## Related Components

- **Dialog** - For centered modal overlays
- **Popover** - For smaller contextual overlays
- **SideNavigation** - For persistent sidebar navigation
