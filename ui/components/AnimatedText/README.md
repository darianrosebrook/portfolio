# AnimatedText

AnimatedText splits text into words and applies optional GSAP entrance motion.

## Usage

```tsx
import { AnimatedText } from '@/ui/components/AnimatedText';

<AnimatedText as="h2" text="Design systems need clear gates" />;
```

## Props

- `text`: Text content to split and render.
- `as`: Element to render. Defaults to `h1`.
- `variant`: Motion pattern, including `blur-in`, `fade-up`, and `slide-in`.
- `duration`, `stagger`, `delay`, `scrollStart`: Motion timing controls.
- `triggerOnScroll`: Uses ScrollTrigger when true.
- `onAnimationComplete`: Called after the configured animation completes.

## Accessibility

Use the `as` prop to preserve heading hierarchy or inline text semantics. The rendered words remain visible text content.

## Design Tokens

Styles consume component and semantic CSS custom properties from `AnimatedText.module.scss`.
