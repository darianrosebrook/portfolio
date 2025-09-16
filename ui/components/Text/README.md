# Text

A flexible typography component that provides consistent text styling and hierarchy across the design system.

## When to use

- Display text content with consistent typography
- Create visual hierarchy with different text variants
- Apply semantic meaning with appropriate HTML elements
- Ensure consistent spacing and color usage

## Key ideas

- **Typography scale**: Comprehensive variant and size system
- **Semantic HTML**: Renders appropriate elements (h1-h6, p, span, div)
- **Design tokens**: All styling driven by design system tokens
- **Flexible styling**: Weight, color, alignment, and transform options

## Props

### TextProps

| Prop        | Type                                                                                | Default     | Description                      |
| ----------- | ----------------------------------------------------------------------------------- | ----------- | -------------------------------- |
| `as`        | `'p' \| 'span' \| 'div' \| 'h1' \| 'h2' \| 'h3' \| 'h4' \| 'h5' \| 'h6'`            | `'p'`       | Element type to render           |
| `variant`   | `'display' \| 'headline' \| 'title' \| 'body' \| 'caption' \| 'overline' \| 'code'` | `'body'`    | Typography variant               |
| `size`      | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' \| '3xl'`                            | `'md'`      | Size within variant              |
| `weight`    | `'light' \| 'normal' \| 'medium' \| 'semibold' \| 'bold'`                           | `'normal'`  | Font weight                      |
| `align`     | `'left' \| 'center' \| 'right' \| 'justify'`                                        | `'left'`    | Text alignment                   |
| `color`     | `'default' \| 'muted' \| 'subtle' \| 'accent' \| 'success' \| 'warning' \| 'error'` | `'default'` | Text color variant               |
| `truncate`  | `boolean`                                                                           | `false`     | Whether text should be truncated |
| `transform` | `'none' \| 'uppercase' \| 'lowercase' \| 'capitalize'`                              | `'none'`    | Transform text case              |

Extends `React.HTMLAttributes<HTMLElement>`.

## Typography Variants

### Display

Large, bold text for major headings and hero content.

### Headline

Medium-large text for section headings and important content.

### Title

Smaller headings for subsections and card titles.

### Body

Standard text for paragraphs and general content.

### Caption

Small text for captions, labels, and secondary information.

### Overline

Small, uppercase text for categories and labels.

### Code

Monospace text for code snippets and technical content.

## Accessibility

- Uses semantic HTML elements for proper document structure
- Maintains proper heading hierarchy when using h1-h6
- Provides sufficient color contrast for all color variants
- Respects user's font size and zoom preferences

## Examples

### Basic usage

```tsx
import { Text } from '@/ui/components/Text';

// Default body text
<Text>This is default body text.</Text>

// Heading with semantic HTML
<Text as="h1" variant="display" size="xl">
  Main Page Title
</Text>

// Subtitle
<Text as="h2" variant="headline" size="lg" color="muted">
  Section Subtitle
</Text>
```

### Typography hierarchy

```tsx
// Display text for heroes
<Text as="h1" variant="display" size="3xl" weight="bold">
  Welcome to Our Platform
</Text>

// Headlines for sections
<Text as="h2" variant="headline" size="xl">
  Getting Started
</Text>

// Titles for subsections
<Text as="h3" variant="title" size="lg">
  Installation Guide
</Text>

// Body text for content
<Text variant="body" size="md">
  Follow these steps to get up and running quickly.
</Text>

// Captions for additional info
<Text variant="caption" size="sm" color="muted">
  Last updated: March 2024
</Text>
```

### Color variants

```tsx
// Default text
<Text>Standard text color</Text>

// Muted text for secondary content
<Text color="muted">Secondary information</Text>

// Accent text for highlights
<Text color="accent" weight="medium">
  Important highlight
</Text>

// Semantic colors
<Text color="success">Success message</Text>
<Text color="warning">Warning message</Text>
<Text color="error">Error message</Text>
```

### Styling options

```tsx
// Text alignment
<Text align="center">Centered text</Text>
<Text align="right">Right-aligned text</Text>

// Text transforms
<Text transform="uppercase">Uppercase text</Text>
<Text transform="capitalize">Capitalized text</Text>

// Truncated text
<Text truncate>
  This is a very long line of text that will be truncated with an ellipsis
</Text>

// Code text
<Text variant="code">const example = 'code';</Text>
```

### Inline elements

```tsx
// Inline text with spans
<Text>
  This paragraph contains <Text as="span" weight="bold">bold text</Text> and{' '}
  <Text as="span" color="accent">accented text</Text> inline.
</Text>

// Mixed formatting
<Text>
  Regular text with{' '}
  <Text as="span" variant="code" size="sm">
    inline code
  </Text>{' '}
  and emphasis.
</Text>
```

### Responsive text

```tsx
// Different sizes for different contexts
<Text variant="display" size="xl" className="md:text-2xl lg:text-3xl">
  Responsive Display Text
</Text>

// Adaptive body text
<Text variant="body" size="sm" className="md:text-md">
  Responsive body text that scales with viewport
</Text>
```
