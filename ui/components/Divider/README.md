# Divider

A semantic separator element that creates visual and logical divisions between content sections.

## When to use

- Separate sections of content within a page or component
- Create visual breaks in lists, menus, or form sections
- Provide semantic structure for screen readers

## Key ideas

- **Semantic HTML**: Uses `<hr>` element with proper ARIA roles
- **Flexible orientation**: Supports both horizontal and vertical layouts
- **Accessibility first**: Proper separator semantics by default
- **Customizable**: Thickness and color variants via tokens

## Props

### DividerProps

| Prop          | Type                         | Default        | Description                                                    |
| ------------- | ---------------------------- | -------------- | -------------------------------------------------------------- |
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | Visual orientation of the divider                              |
| `decorative`  | `boolean`                    | `false`        | If true, uses `role="presentation"` for purely visual dividers |
| `thickness`   | `string`                     | -              | Custom thickness (overrides token values)                      |

Extends `React.HTMLAttributes<HTMLHRElement>`.

## Accessibility

- Uses semantic `<hr>` element
- Includes `role="separator"` by default (or `role="presentation"` when decorative)
- Provides `aria-orientation` for screen readers
- Respects user's motion preferences

## Examples

### Basic usage

```tsx
import { Divider } from '@/ui/components/Divider';

// Horizontal divider (default)
<Divider />

// Vertical divider
<Divider orientation="vertical" />

// Decorative divider (no semantic meaning)
<Divider decorative />
```

### Custom styling

```tsx
// Custom thickness
<Divider thickness="3px" />

// With custom className
<Divider className="my-custom-divider" />
```

### In layouts

```tsx
// Between content sections
<section>
  <h2>Section 1</h2>
  <p>Content...</p>
</section>

<Divider />

<section>
  <h2>Section 2</h2>
  <p>More content...</p>
</section>

// In a vertical layout
<div style={{ display: 'flex', height: '200px' }}>
  <div>Left content</div>
  <Divider orientation="vertical" />
  <div>Right content</div>
</div>
```
