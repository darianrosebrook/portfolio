# Button

A versatile button component that supports multiple variants, sizes, and can render as either a button or anchor element. Essential for user interactions throughout the design system.

## Usage

```tsx
import { Button } from '@/ui/components/Button';

function Example() {
  return (
    <Button variant="primary" size="medium">
      Click me
    </Button>
  );
}
```

## Props

| Prop         | Type                                   | Default   | Description                        |
| ------------ | -------------------------------------- | --------- | ---------------------------------- |
| children     | ReactNode                              | -         | The content of the button          |
| as           | 'button' \| 'a'                        | 'button'  | Render as button or anchor element |
| variant      | 'primary' \| 'secondary' \| 'tertiary' | 'primary' | Visual style variant               |
| size         | 'small' \| 'medium' \| 'large'         | 'medium'  | Button size                        |
| loading      | boolean                                | false     | Shows loading spinner              |
| disabled     | boolean                                | false     | Disables the button                |
| className    | string                                 | ''        | Additional CSS classes             |
| title        | string                                 | ''        | Tooltip text                       |
| ariaLabel    | string                                 | -         | Accessibility label                |
| ariaExpanded | boolean                                | -         | ARIA expanded state                |
| ariaPressed  | boolean                                | -         | ARIA pressed state                 |
| role         | AriaRole                               | -         | Custom ARIA role                   |

### Button-specific Props

| Prop    | Type                            | Default  | Description   |
| ------- | ------------------------------- | -------- | ------------- |
| type    | 'button' \| 'submit' \| 'reset' | 'button' | Button type   |
| onClick | (event: MouseEvent) => void     | -        | Click handler |

### Anchor-specific Props

| Prop | Type   | Default | Description                             |
| ---- | ------ | ------- | --------------------------------------- |
| href | string | -       | Link destination (required when as="a") |

## Examples

### Basic Button

```tsx
<Button>Default Button</Button>
```

### Variants

```tsx
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="tertiary">Tertiary</Button>
```

### Sizes

```tsx
<Button size="small">Small</Button>
<Button size="medium">Medium</Button>
<Button size="large">Large</Button>
```

### Loading State

```tsx
<Button loading>Loading...</Button>
```

### As Link

```tsx
<Button as="a" href="/example">
  Link Button
</Button>
```

### Disabled

```tsx
<Button disabled>Disabled</Button>
```

## Design Tokens

This component uses the following design tokens:

- `--color-background-primary` - Primary button background
- `--color-text-on-primary` - Text color on primary background
- `--color-background-secondary` - Secondary button background
- `--color-border-primary` - Button border color
- `--border-radius-medium` - Button border radius
- `--space-sm`, `--space-md` - Button padding
- `--font-family-base` - Button font family
- `--transition-duration-fast` - Animation timing

## Accessibility

### Keyboard Navigation

- Buttons are focusable with Tab key
- Can be activated with Space or Enter keys
- Focus indicators are clearly visible

### Screen Reader Support

- Proper button semantics
- Loading state announced to screen readers
- Custom aria-label support for complex buttons
- Icon-only buttons automatically get aria-label

### States

- Disabled buttons are excluded from tab order
- Loading state prevents interaction
- ARIA expanded/pressed states for toggle buttons

## Related Components

- **Icon** - For button icons
- **ToggleSwitch** - For toggle interactions
- **Links** - For text-based navigation
