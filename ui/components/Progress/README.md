# Progress

Determinate and indeterminate progress indicators with linear and circular variants.

## Usage

```tsx
import { Progress } from '@/ui/components/Progress';

// Determinate progress
<Progress value={75} />

// Indeterminate progress
<Progress />

// Circular variant
<Progress variant="circular" value={50} />

// Different sizes
<Progress size="small" value={25} />
<Progress size="medium" value={50} />
<Progress size="large" value={75} />

// Different intents
<Progress intent="success" value={100} />
<Progress intent="warning" value={60} />
<Progress intent="error" value={20} />
```

## Props

| Prop      | Type                     | Default     | Description                                        |
| --------- | ------------------------ | ----------- | -------------------------------------------------- |
| `value`   | `number`                 | -           | Progress value (0-100). Indeterminate if undefined |
| `max`     | `number`                 | `100`       | Maximum value                                      |
| `variant` | `'linear' \| 'circular'` | `'linear'`  | Progress variant                                   |
| `size`    | `ControlSize`            | `'medium'`  | Size of the progress indicator                     |
| `intent`  | `Intent`                 | `'primary'` | Visual intent/color                                |

All standard `div` HTML attributes are also supported.

## Accessibility

- Uses appropriate ARIA attributes (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`)
- Screen reader announcements for progress changes
- Proper role assignment for progress bars

## Design Tokens

### Colors

- `--progress-color-background-track`
- `--progress-color-background-fill-{intent}`
- `--progress-color-foreground`

### Sizes

- `--progress-size-height-{size}`
- `--progress-size-width-{size}` (for circular)
- `--progress-size-border-radius`

### Animation

- `--progress-animation-duration`
- `--progress-animation-easing`

