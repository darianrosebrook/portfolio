# VisuallyHidden

A utility component that hides content visually while keeping it accessible to screen readers and other assistive technologies.

## When to use

- Provide additional context for screen readers
- Create skip links for keyboard navigation
- Add descriptive text that's redundant visually but helpful for accessibility
- Label form controls when visual labels aren't sufficient

## Key ideas

- **Screen reader accessible**: Content remains in the accessibility tree
- **Modern technique**: Uses `clip-path` and other modern CSS properties
- **Focusable variant**: Can reveal content when focused (useful for skip links)
- **Flexible element**: Can render as any HTML element via `as` prop

## Props

### VisuallyHiddenProps

| Prop        | Type                          | Default  | Description                          |
| ----------- | ----------------------------- | -------- | ------------------------------------ |
| `as`        | `keyof JSX.IntrinsicElements` | `'span'` | HTML element to render               |
| `focusable` | `boolean`                     | `false`  | Whether to show content when focused |

Extends `React.HTMLAttributes<HTMLSpanElement>`.

## Accessibility

- Content remains accessible to screen readers and keyboard navigation
- Uses modern visually hidden technique with `clip-path`
- Focusable variant provides visible focus indicator
- Supports all ARIA attributes and semantic HTML

## Examples

### Basic usage

```tsx
import { VisuallyHidden } from '@/ui/components/VisuallyHidden';

// Additional context for screen readers
<button>
  <Icon name="close" />
  <VisuallyHidden>Close dialog</VisuallyHidden>
</button>;
```

### Skip links

```tsx
// Skip link that appears when focused
<VisuallyHidden as="a" href="#main-content" focusable>
  Skip to main content
</VisuallyHidden>
```

### Form labels

```tsx
// When visual label isn't sufficient
<div>
  <label>
    Search
    <VisuallyHidden>products and articles</VisuallyHidden>
  </label>
  <input type="search" />
</div>
```

### Status announcements

```tsx
// Live region for status updates
<VisuallyHidden as="div" role="status" aria-live="polite">
  {statusMessage}
</VisuallyHidden>
```

### Navigation context

```tsx
// Additional navigation context
<nav>
  <VisuallyHidden as="h2">Main navigation</VisuallyHidden>
  <ul>
    <li>
      <a href="/">Home</a>
    </li>
    <li>
      <a href="/about">About</a>
    </li>
  </ul>
</nav>
```
