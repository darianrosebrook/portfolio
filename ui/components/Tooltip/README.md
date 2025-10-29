# Tooltip

Non-interactive overlay for labels and descriptions. Complements Popover for interactive content.

## Usage

```tsx
import { Tooltip } from '@/ui/components/Tooltip';

// Basic tooltip
<Tooltip content="This is a helpful tooltip">
  <button>Hover me</button>
</Tooltip>

// Custom placement
<Tooltip content="Tooltip content" placement="bottom">
  <span>Bottom tooltip</span>
</Tooltip>

// Click trigger
<Tooltip content="Click to show" trigger="click">
  <button>Click me</button>
</Tooltip>

// Custom delay
<Tooltip content="Delayed tooltip" delay={1000}>
  <div>Hover with delay</div>
</Tooltip>
```

## Props

| Prop        | Type                 | Default   | Description                   |
| ----------- | -------------------- | --------- | ----------------------------- |
| `content`   | `React.ReactNode`    | -         | Tooltip content (required)    |
| `placement` | `Placement`          | `'auto'`  | Placement relative to trigger |
| `trigger`   | `TriggerStrategy`    | `'hover'` | How tooltip is triggered      |
| `delay`     | `number`             | `500`     | Delay before showing (ms)     |
| `disabled`  | `boolean`            | `false`   | Whether tooltip is disabled   |
| `className` | `string`             | `''`      | Additional CSS classes        |
| `children`  | `React.ReactElement` | -         | Trigger element (required)    |

## Accessibility

- Uses `role="tooltip"` and proper ARIA attributes
- Manages focus and keyboard navigation
- Respects `prefers-reduced-motion`
- Proper portal rendering to avoid clipping

## Design Tokens

### Colors

- `--tooltip-color-background`
- `--tooltip-color-foreground`
- `--tooltip-color-border`

### Spacing

- `--tooltip-spacing-padding`
- `--tooltip-spacing-gap` (from trigger)

### Typography

- `--tooltip-typography-font-size`
- `--tooltip-typography-line-height`

### Animation

- `--tooltip-animation-enter-duration`
- `--tooltip-animation-exit-duration`
- `--tooltip-animation-enter-easing`
- `--tooltip-animation-exit-easing`

