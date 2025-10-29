# Command

Command palette component with search, keyboard navigation, and grouping support.

## Usage

```tsx
import { Command } from '@/ui/components/Command';

// Basic command palette
<Command.Root>
  <Command.Input placeholder="Search commands..." />
  <Command.List>
    <Command.Empty>No results found.</Command.Empty>
    <Command.Group heading="Actions">
      <Command.Item onSelect={() => console.log('Selected')}>
        Create new file
      </Command.Item>
      <Command.Item onSelect={() => console.log('Selected')}>
        Open file
      </Command.Item>
    </Command.Group>
    <Command.Group heading="Navigation">
      <Command.Item onSelect={() => navigate('/dashboard')}>
        Go to Dashboard
      </Command.Item>
    </Command.Group>
  </Command.List>
</Command.Root>

// With controlled search
<Command.Root value={searchValue} onValueChange={setSearchValue}>
  {/* command content */}
</Command.Root>
```

## Components

### Command.Root

Main command container.

**Props:**

- `value?: string` - Search value
- `onValueChange?: (value) => void` - Search change handler
- `loop?: boolean` - Loop navigation at boundaries

### Command.Input

Search input field.

### Command.List

Scrollable command list.

### Command.Empty

Empty state when no results.

### Command.Group

Group commands with heading.

**Props:**

- `heading?: string` - Group title

### Command.Item

Individual command item.

**Props:**

- `onSelect?: () => void` - Selection handler
- `disabled?: boolean` - Disable item

## Accessibility

- Full keyboard navigation (Arrow keys, Enter, Escape)
- Screen reader support with proper ARIA
- Focus management and trapping
- Search filtering announcements

## Design Tokens

### Colors

- `--command-color-background`
- `--command-color-foreground`
- `--command-color-border`

### Spacing

- `--command-spacing-padding`
- `--command-spacing-gap`

### Typography

- `--command-typography-font-size`
- `--command-typography-line-height`

## Related Components

- [Combobox](../Combobox/) - Select with search
- [Autocomplete](../Autocomplete/) - Search input with suggestions

