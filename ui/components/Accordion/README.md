# Accordion

A collapsible content component that supports single or multiple open items. Built as a composer component with proper state management and accessibility.

## Usage

```tsx
import { Accordion } from '@/ui/components/Accordion';

function Example() {
  return (
    <Accordion type="single" defaultValue="item1">
      <Accordion.Item value="item1">
        <Accordion.Trigger>Section 1</Accordion.Trigger>
        <Accordion.Content>Content for section 1</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="item2">
        <Accordion.Trigger>Section 2</Accordion.Trigger>
        <Accordion.Content>Content for section 2</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}
```

## Props

### Accordion (Root)

| Prop          | Type                                | Default  | Description                                       |
| ------------- | ----------------------------------- | -------- | ------------------------------------------------- |
| type          | 'single' \| 'multiple'              | 'single' | Whether only one or multiple items can be open    |
| defaultValue  | string \| string[]                  | -        | Default open items (uncontrolled)                 |
| value         | string \| string[]                  | -        | Controlled open items                             |
| onValueChange | (value: string \| string[]) => void | -        | Callback when open items change                   |
| collapsible   | boolean                             | true     | Whether items can be closed when type is 'single' |
| className     | string                              | ''       | Additional CSS classes                            |
| children      | ReactNode                           | -        | Accordion items                                   |

### Accordion.Item

| Prop      | Type      | Default | Description                        |
| --------- | --------- | ------- | ---------------------------------- |
| value     | string    | -       | Unique identifier for this item    |
| className | string    | ''      | Additional CSS classes             |
| children  | ReactNode | -       | Item content (Trigger and Content) |

### Accordion.Trigger

| Prop      | Type                        | Default | Description                        |
| --------- | --------------------------- | ------- | ---------------------------------- |
| value     | string                      | -       | Must match the parent Item's value |
| className | string                      | ''      | Additional CSS classes             |
| children  | ReactNode                   | -       | Trigger content                    |
| onClick   | (event: MouseEvent) => void | -       | Click handler                      |
| ...rest   | ButtonHTMLAttributes        | -       | Additional button props            |

### Accordion.Content

| Prop      | Type      | Default | Description                        |
| --------- | --------- | ------- | ---------------------------------- |
| value     | string    | -       | Must match the parent Item's value |
| className | string    | ''      | Additional CSS classes             |
| children  | ReactNode | -       | Content to display when open       |

## Examples

### Single Item Accordion

```tsx
<Accordion type="single" defaultValue="item1">
  <Accordion.Item value="item1">
    <Accordion.Trigger>What is React?</Accordion.Trigger>
    <Accordion.Content>
      React is a JavaScript library for building user interfaces.
    </Accordion.Content>
  </Accordion.Item>
</Accordion>
```

### Multiple Items Accordion

```tsx
<Accordion type="multiple" defaultValue={['item1', 'item2']}>
  <Accordion.Item value="item1">
    <Accordion.Trigger>Frontend</Accordion.Trigger>
    <Accordion.Content>React, TypeScript, CSS</Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="item2">
    <Accordion.Trigger>Backend</Accordion.Trigger>
    <Accordion.Content>Node.js, Express, PostgreSQL</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

### Controlled Accordion

```tsx
function ControlledAccordion() {
  const [openItems, setOpenItems] = useState<string[]>(['item1']);

  return (
    <Accordion type="multiple" value={openItems} onValueChange={setOpenItems}>
      <Accordion.Item value="item1">
        <Accordion.Trigger>Item 1</Accordion.Trigger>
        <Accordion.Content>Content 1</Accordion.Content>
      </Accordion.Item>
    </Accordion>
  );
}
```

### Non-collapsible Single Accordion

```tsx
<Accordion type="single" collapsible={false} defaultValue="item1">
  <Accordion.Item value="item1">
    <Accordion.Trigger>Always Open</Accordion.Trigger>
    <Accordion.Content>This item cannot be closed.</Accordion.Content>
  </Accordion.Item>
</Accordion>
```

## Design Tokens

This component uses the following design tokens:

### Layout & Spacing

- `--accordion-spacing-gap` - Gap between items
- `--accordion-spacing-padding` - Internal padding
- `--accordion-spacing-margin` - External margins

### Colors

- `--accordion-color-background` - Background color
- `--accordion-color-foreground` - Text color
- `--accordion-color-border` - Border color
- `--accordion-color-hover` - Hover state color

### Typography

- `--accordion-font-size` - Font size
- `--accordion-font-weight` - Font weight
- `--accordion-line-height` - Line height

### Animation

- `--accordion-transition-duration` - Animation duration
- `--accordion-transition-easing` - Animation easing
- `--accordion-chevron-rotation` - Chevron rotation degrees

### Border & Shape

- `--accordion-border-radius` - Border radius
- `--accordion-border-width` - Border width

## Accessibility

### Keyboard Navigation

| Key         | When focus is on  | Action   | Result                   | Notes               |
| ----------- | ----------------- | -------- | ------------------------ | ------------------- |
| Enter/Space | Accordion.Trigger | activate | Toggles item open/closed | Primary activation  |
| Arrow Down  | Accordion.Trigger | navigate | Moves to next item       | When multiple items |
| Arrow Up    | Accordion.Trigger | navigate | Moves to previous item   | When multiple items |
| Home        | Accordion.Trigger | navigate | Moves to first item      | When multiple items |
| End         | Accordion.Trigger | navigate | Moves to last item       | When multiple items |

### Screen Reader Support

- **ARIA Roles**: Uses `region` role for content areas
- **ARIA States**: `aria-expanded` indicates open/closed state
- **ARIA Attributes**: Proper labeling and relationships
- **Focus Management**: Keyboard navigation between items
- **Live Regions**: Content changes are announced

### Focus Management

- Focus moves between trigger buttons
- Focus returns to trigger when content is closed
- Focus trapping within accordion when needed
- Visual focus indicators clearly visible

### States

- **Open**: `aria-expanded="true"`, content visible
- **Closed**: `aria-expanded="false"`, content hidden
- **Disabled**: `aria-disabled="true"`, non-interactive
- **Loading**: `aria-busy="true"`, content updating

## Related Components

- **Details** - For simple expand/collapse without multiple items
- **Tabs** - For tabbed content organization
- **Dialog** - For modal content overlays
- **Popover** - For contextual content overlays

## Implementation Notes

- Built as a **composer** component with proper state management
- Uses React Context for state sharing between sub-components
- Supports both controlled and uncontrolled usage patterns
- Implements smooth animations with CSS transitions
- Handles keyboard navigation and focus management
- Provides proper TypeScript types for all props and events
