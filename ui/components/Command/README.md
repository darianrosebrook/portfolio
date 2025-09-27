# Command

A command palette component that provides a searchable interface for executing commands and actions. Built with a composer pattern using context for state management.

## Usage

```tsx
import { Command } from '@/ui/components/Command';

function CommandPalette() {
  return (
    <Command>
      <Command.Input placeholder="Search commands..." />
      <Command.List>
        <Command.Item>Command 1</Command.Item>
        <Command.Item>Command 2</Command.Item>
      </Command.List>
    </Command>
  );
}
```

## Props

| Prop      | Type   | Default | Description              |
| --------- | ------ | ------- | ------------------------ |
| children  | ReactNode | -     | Command palette content  |
| className | string | ''      | Additional CSS classes   |

## Examples

### Basic Command Palette

```tsx
<Command>
  <Command.Input placeholder="Type a command..." />
  <Command.List>
    <Command.Empty>No results found.</Command.Empty>
    <Command.Item>Navigate to settings</Command.Item>
    <Command.Item>Create new item</Command.Item>
  </Command.List>
</Command>
```

### With Groups

```tsx
<Command>
  <Command.Group heading="Navigation">
    <Command.Item>Go to dashboard</Command.Item>
    <Command.Item>Go to settings</Command.Item>
  </Command.Group>
  <Command.Group heading="Actions">
    <Command.Item>Create project</Command.Item>
    <Command.Item>Delete item</Command.Item>
  </Command.Group>
</Command>
```

## Design Tokens

This component uses the following design tokens:

- `--color-background-primary` - Command palette background
- `--color-text-primary` - Text color
- `--color-border-subtle` - Border colors
- `--border-radius-medium` - Border radius
- `--space-sm`, `--space-md` - Spacing
- `--font-family-base` - Font family
- `--shadow-level-2` - Elevation shadow

## Accessibility

### Keyboard Navigation

- Tab to navigate between sections
- Arrow keys to navigate within lists
- Enter/Space to select items
- Escape to close palette

### Screen Reader Support

- Proper ARIA roles and labels
- Live region announcements for search results
- Semantic structure with headings and groups

### States

- Loading states announced to screen readers
- Empty states clearly communicated
- Focus management for modal-like behavior

## Related Components

- **Input** - For search input functionality
- **List** - For list rendering patterns
- **Popover** - For similar overlay patterns
