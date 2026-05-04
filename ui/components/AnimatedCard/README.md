# AnimatedCard

A card component with scroll-triggered entry animations and optional hover effects.

## Usage

```tsx
import { AnimatedCard, AnimatedCardImage, AnimatedCardTitle } from '@/ui/components/AnimatedCard';

<AnimatedCard>
  <AnimatedCardImage src="..." alt="..." />
  <AnimatedCardTitle>Card title</AnimatedCardTitle>
</AnimatedCard>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Card content |
| `as` | `'article' \| 'div' \| 'li' \| 'a'` | `'article'` | Rendered element type |
| `duration` | `number` | — | Entry animation duration in seconds |
| `delay` | `number` | — | Delay before animation starts |
| `triggerOnScroll` | `boolean` | `true` | Trigger animation on scroll into view |
| `enableHover` | `boolean` | `false` | Enable hover effects |

## Accessibility

- Respects `prefers-reduced-motion` — animations are skipped when the user has requested reduced motion.
- Use semantic `as` prop to match document outline (e.g. `as="article"` inside a list).

## Design Tokens

Styles are defined in `AnimatedCard.module.scss` and inherit layout tokens from the parent context.
