# Spinner

Primitive loading indicator with minimal API and CSS-driven variants.

## Usage

```tsx
import Spinner from '@/ui/components/Spinner';

// In-button loading (decorative)
<button disabled aria-busy="true">
  <Spinner size="sm" ariaHidden />
  Saving…
  </button>

// Announced loading region
<Spinner label="Loading data" variant="ring" />
```

## Props

- `size`: 'xs' | 'sm' | 'md' | 'lg' | number
- `thickness`: 'hairline' | 'regular' | 'bold' | number
- `variant`: 'ring' | 'dots' | 'bars'
- `ariaHidden`: boolean
- `label`: string (ignored if `ariaHidden`)
- `inline`: boolean
- `showAfterMs`: number (default 150)

## Accessibility

- If not decorative, the spinner exposes `role="status"` + `aria-live="polite"` and uses `label`.
- If decorative (e.g., inside a busy button), set `ariaHidden` to avoid duplicate announcements.
- Honors `prefers-reduced-motion: reduce`.
