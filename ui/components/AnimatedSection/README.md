# AnimatedSection

AnimatedSection wraps page sections and applies optional entrance motion to the section or its children.

## Usage

```tsx
import { AnimatedSection } from '@/ui/components/AnimatedSection';

<AnimatedSection variant="fade-up">Section content</AnimatedSection>;
```

## Props

- `children`: Content rendered inside the section.
- `as`: Element to render. Defaults to `section`.
- `variant`: Motion pattern, including `fade-up`, `fade-in`, `slide-in`, and `stagger-children`.
- `duration`, `stagger`, `delay`, `scrollStart`: Motion timing controls.
- `triggerOnScroll`: Uses ScrollTrigger when true.
- `onAnimationComplete`: Called after the configured animation completes.

## Accessibility

Choose the `as` value that matches the document structure. The component preserves children and does not add interactive behavior.

## Design Tokens

Styles consume component and semantic CSS custom properties from `AnimatedSection.module.scss`.
