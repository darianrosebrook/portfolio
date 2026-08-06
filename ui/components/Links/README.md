# Links (AnimatedLink)

An animated link component that creates smooth character-by-character text animations on hover and focus using GSAP.

## Purpose

AnimatedLink provides an engaging micro-interaction for navigation links by animating individual characters with a staggered effect. The animation creates a smooth transition where characters slide up and are replaced by duplicates sliding in from below.

## Usage

```tsx
import { AnimatedLink } from '@/ui/components/Links';

function Example() {
  return <AnimatedLink href="/about">About Us</AnimatedLink>;
}
```

## Props

| Prop       | Type                                          | Default | Description                                   |
| ---------- | --------------------------------------------- | ------- | --------------------------------------------- |
| href       | string                                        | -       | URL for the link destination                  |
| children   | string                                        | -       | Plain text content (will be split into chars) |
| className  | string                                        | ''      | Additional CSS class names                    |
| onClick    | (e: MouseEvent) => void                       | -       | Click handler function                        |
| staggerMs  | number                                        | 28      | Delay between character animations (ms)       |
| durationMs | number                                        | 400     | Duration of each character animation (ms)     |
| ...rest    | React.AnchorHTMLAttributes<HTMLAnchorElement> | -       | Standard anchor attributes                    |

## Examples

### Basic Animated Link

```tsx
<AnimatedLink href="/products">View Products</AnimatedLink>
```

### Custom Animation Timing

```tsx
<AnimatedLink href="/contact" staggerMs={50} durationMs={600}>
  Contact Us
</AnimatedLink>
```

### With Click Handler

```tsx
<AnimatedLink
  href="/dashboard"
  onClick={(e) => {
    console.log('Navigating to dashboard');
  }}
>
  Dashboard
</AnimatedLink>
```

### With Custom Styling

```tsx
<AnimatedLink href="/special" className="highlight-link">
  Special Offer
</AnimatedLink>
```

## Animation Details

### Character Animation

- Text is split into individual characters using GSAP SplitText
- Each character animates with a staggered delay
- Original characters slide up (-100% yPercent)
- Clone characters slide in from below (100% to 0% yPercent)

### Triggers

- **Mouse enter/leave**: Plays/reverses animation
- **Focus/blur**: Plays/reverses animation for keyboard users
- **Smooth easing**: Uses `expo.inOut` for natural motion

### Performance

- Animations are paused by default
- Only plays when triggered by user interaction
- Properly cleans up event listeners and GSAP instances

## Design Tokens

This component uses design tokens through its CSS module:

### Layout

- Proper masking for character overflow
- Consistent spacing and alignment

### Typography

- Inherits text styles from design system
- Maintains readability during animation

## Accessibility

### Keyboard Navigation

- Fully keyboard accessible
- Focus triggers the same animation as hover
- Clear focus indicators maintained

### Screen Reader Support

- Clone text marked with `aria-hidden="true"`
- Original semantic structure preserved
- Works with screen reader navigation

### Motion Preferences

- Respects user motion preferences
- Animation can be disabled via CSS media queries
- Fallback to standard link behavior

### Focus Management

- Focus remains on the link during animation
- Focus indicators work properly with animated text
- Tab order is maintained

## Related Components

- **Link** - Next.js Link component used internally
- **Breadcrumbs** - Uses AnimatedLink for breadcrumb navigation

## Implementation Notes

- Requires GSAP and SplitText plugin
- Uses `useFontsLoaded` hook to ensure proper text measurement
- Waits for fonts to load before initializing animations
- Children must be plain text (no nested elements)
- Uses Next.js Link for client-side navigation
- Properly cleans up GSAP instances on unmount
- Animation timeline is reusable and reversible
- Character splitting is recalculated when text changes

## Performance Considerations

- Animations are GPU-accelerated using transforms
- SplitText instances are properly cleaned up
- Event listeners are removed on component unmount
- Animation only runs when fonts are loaded
- Minimal impact on layout and paint operations
