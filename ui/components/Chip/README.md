# Chip

A primitive chip component for tags, filters, or labels. Supports GSAP-powered hover animations and follows design system conventions.

## Usage

```tsx
import { Chip } from '@/ui/components/Chip';

// Basic chip
<Chip>Tag</Chip>

// Clickable chip with hover animation
<Chip clickable onClick={handleClick}>
  Filter
</Chip>

// Different sizes
<Chip size="small">Small</Chip>
<Chip size="medium">Medium</Chip>
<Chip size="large">Large</Chip>

// Different variants
<Chip variant="default">Default</Chip>
<Chip variant="filled">Filled</Chip>
<Chip variant="outlined">Outlined</Chip>
```

## Props

| Prop        | Type                                  | Default     | Description                                              |
| ----------- | ------------------------------------- | ----------- | -------------------------------------------------------- |
| `clickable` | `boolean`                             | `false`     | Whether the chip is clickable and shows hover animations |
| `size`      | `'small' \| 'medium' \| 'large'`      | `'medium'`  | Size variant of the chip                                 |
| `variant`   | `'default' \| 'filled' \| 'outlined'` | `'default'` | Visual style variant                                     |
| `className` | `string`                              | `''`        | Additional CSS classes                                   |
| `children`  | `React.ReactNode`                     | -           | Chip content                                             |

All standard `div` HTML attributes are also supported.

## Accessibility

- When `clickable` is true, the chip becomes keyboard focusable with `tabIndex={0}`
- Appropriate ARIA roles: `role="button"` when clickable, `role="generic"` otherwise
- Focus management with visible focus outline
- Respects `prefers-reduced-motion` (no animations when enabled)

## Design Tokens

### Colors

- `--chip-color-background-default`
- `--chip-color-foreground-primary`
- `--chip-color-background-filled`
- `--chip-color-foreground-filled`
- `--chip-color-border-outlined`
- `--chip-color-foreground-outlined`

### Sizes

- `--chip-size-padding-default`
- `--chip-size-padding-small`
- `--chip-size-padding-large`
- `--chip-size-radius-default`
- `--chip-size-font-small`
- `--chip-size-font-default`
- `--chip-size-font-large`

### Elevation

- `--chip-elevation-default`

## Animation

Uses GSAP for smooth hover animations:

- Transform: `translateY(-2px)` on hover
- Box-shadow elevation change
- Duration: `150ms` with `power2.out` easing

Animations are disabled when `prefers-reduced-motion: reduce` is set.

## Related Components

- [Button](../Button/) - For primary actions
- [Badge](../Badge/) - For status indicators
- [Tag](../Tag/) - For metadata labels

