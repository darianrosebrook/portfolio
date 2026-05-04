# AnimatedCard

AnimatedCard renders a card-like element with optional GSAP entrance motion and hover styling.

## Usage

```tsx
import { AnimatedCard } from '@/ui/components/AnimatedCard';

<AnimatedCard triggerOnScroll={false}>Project summary</AnimatedCard>;
```

## Props

- `children`: Content rendered inside the card.
- `as`: Element to render. Defaults to `article`.
- `duration`, `delay`, `scrollStart`: Motion timing controls.
- `triggerOnScroll`: Uses ScrollTrigger when true.
- `enableHover`: Enables hover class styling.
- `href`: Required when rendering as an anchor.
- `onAnimationComplete`: Called after the configured animation completes.

## Accessibility

Use the `as` prop to choose the semantic element for the content. Pass link text or labelled content when rendering as an anchor.

## Design Tokens

Styles consume component and semantic CSS custom properties from `AnimatedCard.module.scss`.
