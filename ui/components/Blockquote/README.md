# Blockquote

A semantic component for displaying quoted text with proper styling and attribution.

## When to use

- Display quotes, testimonials, or excerpts from other sources
- Highlight important statements or passages
- Provide visual emphasis for quoted content
- Show customer testimonials or reviews

## Key ideas

- **Semantic HTML**: Uses `<blockquote>` element for proper semantics
- **Visual hierarchy**: Multiple size and style variants
- **Flexible styling**: Default, bordered, and highlighted variants
- **Accessibility**: Proper citation support with `cite` attribute

## Props

### BlockquoteProps

| Prop      | Type                                       | Default     | Description                      |
| --------- | ------------------------------------------ | ----------- | -------------------------------- |
| `cite`    | `string`                                   | -           | Citation or source of the quote  |
| `variant` | `'default' \| 'bordered' \| 'highlighted'` | `'default'` | Visual variant of the blockquote |
| `size`    | `'sm' \| 'md' \| 'lg'`                     | `'md'`      | Size variant                     |

Extends `React.HTMLAttributes<HTMLQuoteElement>`.

## Accessibility

- Uses semantic `<blockquote>` element
- Supports `cite` attribute for source attribution
- Maintains proper text contrast ratios
- Respects user's font size preferences

## Examples

### Basic usage

```tsx
import { Blockquote } from '@/ui/components/Blockquote';

// Simple quote
<Blockquote>
  The best way to predict the future is to create it.
</Blockquote>

// With citation
<Blockquote cite="https://example.com/source">
  Design is not just what it looks like and feels like. Design is how it works.
</Blockquote>
```

### Size variants

```tsx
// Small quote
<Blockquote size="sm">
  Small quote text for subtle emphasis.
</Blockquote>

// Large quote for emphasis
<Blockquote size="lg">
  Large quote text for maximum impact and attention.
</Blockquote>
```

### Style variants

```tsx
// Default with left border
<Blockquote variant="default">
  Default blockquote with left border accent.
</Blockquote>

// Fully bordered
<Blockquote variant="bordered">
  Bordered blockquote with background and full border.
</Blockquote>

// Highlighted with accent
<Blockquote variant="highlighted">
  Highlighted blockquote with background and accent border.
</Blockquote>
```

### With attribution

```tsx
<figure>
  <Blockquote cite="https://example.com">
    The only way to do great work is to love what you do.
  </Blockquote>
  <figcaption>— Steve Jobs</figcaption>
</figure>
```
