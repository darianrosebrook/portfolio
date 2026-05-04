# AnimatedSection

A section wrapper that animates its children on scroll entry. Supports staggered child animation.

## Usage

```tsx
import { AnimatedSection } from '@/ui/components/AnimatedSection';

<AnimatedSection variant="stagger-children">
  <p>First paragraph</p>
  <p>Second paragraph</p>
</AnimatedSection>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Content to animate |
| `as` | `'section' \| 'div' \| 'article' \| ...` | `'section'` | Rendered element type |
| `variant` | `'fade-up' \| 'fade-in' \| 'slide-in' \| 'stagger-children'` | `'fade-up'` | Animation style |
| `duration` | `number` | — | Animation duration in seconds |

## Accessibility

- Respects `prefers-reduced-motion` — all animations are skipped when the system preference is set.
- Use the `as` prop to preserve correct landmark semantics.

## Design Tokens

Styles are defined in `AnimatedSection.module.scss`.
