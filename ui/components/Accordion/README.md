# Accordion

Collapsible content component supporting single or multiple open items.

## Usage

```tsx
import { Accordion } from '@/ui/components/Accordion';

// Basic accordion
<Accordion.Root type="single" collapsible>
  <Accordion.Item value="item-1">
    <Accordion.Trigger>Item 1</Accordion.Trigger>
    <Accordion.Content>
      Content for item 1
    </Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="item-2">
    <Accordion.Trigger>Item 2</Accordion.Trigger>
    <Accordion.Content>
      Content for item 2
    </Accordion.Content>
  </Accordion.Item>
</Accordion.Root>

// Multiple items open
<Accordion.Root type="multiple">
  {/* accordion items */}
</Accordion.Root>

// Controlled accordion
<Accordion.Root type="single" value={activeItem} onValueChange={setActiveItem}>
  {/* accordion items */}
</Accordion.Root>
```

## Components

### Accordion.Root

Main accordion container.

**Props:**

- `type?: 'single' | 'multiple'` - Allow single or multiple open items
- `value?: string | string[]` - Controlled value
- `onValueChange?: (value) => void` - Change handler
- `collapsible?: boolean` - Allow collapsing all items
- `disabled?: boolean` - Disable all items

### Accordion.Item

Individual accordion item.

**Props:**

- `value: string` - Unique value for the item
- `disabled?: boolean` - Disable this item

### Accordion.Trigger

Clickable trigger for expanding/collapsing.

### Accordion.Content

Collapsible content area.

## Accessibility

- Proper ARIA attributes (`aria-expanded`, `aria-controls`)
- Keyboard navigation (Arrow keys, Home/End, Enter/Space)
- Screen reader support
- Focus management

## Design Tokens

### Colors

- `--accordion-color-background`
- `--accordion-color-foreground`
- `--accordion-color-border`

### Spacing

- `--accordion-spacing-padding`
- `--accordion-spacing-gap`

### Animation

- `--accordion-animation-duration`
- `--accordion-animation-easing`

## Related Components

- [Disclosure](../Disclosure/) - Simple show/hide component
- [Tabs](../Tabs/) - Tabbed content navigation

