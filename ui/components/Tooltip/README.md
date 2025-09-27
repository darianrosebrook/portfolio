# Tooltip

A tooltip component that displays contextual information on hover or focus. Provides accessible tooltips with proper ARIA attributes.

## Usage

```tsx
import { Tooltip } from '@/ui/components/Tooltip';

function WithTooltip() {
  return (
    <Tooltip content="This is helpful information">
      <button>Hover me</button>
    </Tooltip>
  );
}
```

## Props

| Prop      | Type   | Default | Description                |
| --------- | ------ | ------- | -------------------------- |
| children  | ReactNode | -     | The trigger element        |
| content   | string | -       | The tooltip content        |
| className | string | ''      | Additional CSS classes     |
| side      | 'top' \| 'right' \| 'bottom' \| 'left' | 'top' | Which side to display on |
| delay     | number | 700     | Delay before showing (ms)  |

## Examples

### Basic Tooltip

```tsx
<Tooltip content="Save your changes">
  <button>Save</button>
</Tooltip>
```

### Side Positioning

```tsx
<Tooltip content="More information" side="right">
  <button>Info</button>
</Tooltip>
```

### Custom Delay

```tsx
<Tooltip content="This appears after 1 second" delay={1000}>
  <button>Delayed tooltip</button>
</Tooltip>
```

### Rich Content

```tsx
<Tooltip content={
  <div>
    <strong>Keyboard shortcuts:</strong>
    <br />
    Ctrl+S to save
    <br />
    Ctrl+Z to undo
  </div>
}>
  <button>Actions</button>
</Tooltip>
```

## Design Tokens

This component uses the following design tokens:

- `--color-background-elevated` - Tooltip background
- `--color-text-inverse` - Text color
- `--color-border-strong` - Border color
- `--border-radius-small` - Border radius
- `--space-xs` - Internal padding
- `--shadow-level-1` - Tooltip shadow
- `--animation-duration-fast` - Animation timing

## Accessibility

### Keyboard Navigation

- Focus triggers tooltip
- Tab navigation works normally
- Escape dismisses tooltip

### Screen Reader Support

- ARIA describedby relationship
- Tooltip content announced on focus
- Non-intrusive for keyboard users
- Proper focus management

### States

- Visible on hover or focus
- Auto-dismiss on mouse leave or blur
- Configurable delay for better UX

## Related Components

- **Popover** - For larger contextual content
- **Alert** - For status messages
- **VisuallyHidden** - For screen reader content
