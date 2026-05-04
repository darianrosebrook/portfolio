# AnimatedText

A text component that animates each word on scroll entry. Supports blur-in, fade-up, and slide-in variants.

## Usage

```tsx
import { AnimatedText } from '@/ui/components/AnimatedText';

<AnimatedText text="Hello world" as="h2" variant="blur-in" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | `string` | — | Text content to animate |
| `as` | `'h1' \| 'h2' \| ... \| 'p' \| 'span'` | `'p'` | Rendered element type |
| `variant` | `'blur-in' \| 'fade-up' \| 'slide-in'` | `'fade-up'` | Per-word animation style |
| `duration` | `number` | — | Duration per word animation in seconds |

## Accessibility

- Respects `prefers-reduced-motion` — animations are skipped when the system preference is set.
- The rendered text content is the same regardless of animation state; screen readers receive the full string.

## Design Tokens

Styles are defined in `AnimatedText.module.scss`.
