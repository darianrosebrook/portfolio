# List

A semantic list component that provides consistent styling for ordered, unordered, and definition lists.

## When to use

- Display collections of related items
- Create navigation menus or link collections
- Show structured data with proper semantic meaning
- Present content with consistent spacing and typography

## Key ideas

- **Semantic HTML**: Uses appropriate list elements (ul, ol, dl)
- **Flexible variants**: Multiple styling options for different contexts
- **Design tokens**: Consistent spacing, typography, and colors
- **Accessibility**: Proper list semantics for screen readers

## Props

### ListProps

| Prop      | Type                                                                                       | Default     | Description                              |
| --------- | ------------------------------------------------------------------------------------------ | ----------- | ---------------------------------------- |
| `as`      | `'ul' \| 'ol' \| 'dl'`                                                                     | `'ul'`      | List type                                |
| `variant` | `'default' \| 'unstyled' \| 'inline' \| 'divided' \| 'spaced'`                             | `'default'` | Visual variant                           |
| `size`    | `'sm' \| 'md' \| 'lg'`                                                                     | `'md'`      | Size variant                             |
| `marker`  | `'default' \| 'none' \| 'disc' \| 'circle' \| 'square' \| 'decimal' \| 'alpha' \| 'roman'` | `'default'` | Marker style for ordered/unordered lists |
| `spacing` | `'none' \| 'sm' \| 'md' \| 'lg'`                                                           | `'md'`      | Spacing between items                    |

Extends `React.HTMLAttributes<HTMLElement>`.

## Accessibility

- Uses semantic list elements for proper document structure
- Maintains list semantics for screen readers
- Supports keyboard navigation for interactive list items
- Provides proper heading hierarchy when used with headings

## Examples

### Basic usage

```tsx
import { List } from '@/ui/components/List';

// Unordered list (default)
<List>
  <li>First item</li>
  <li>Second item</li>
  <li>Third item</li>
</List>

// Ordered list
<List as="ol">
  <li>Step one</li>
  <li>Step two</li>
  <li>Step three</li>
</List>

// Definition list
<List as="dl">
  <dt>Term 1</dt>
  <dd>Definition for term 1</dd>
  <dt>Term 2</dt>
  <dd>Definition for term 2</dd>
</List>
```

### Variants

```tsx
// Unstyled list (no markers)
<List variant="unstyled">
  <li>Clean item</li>
  <li>Another clean item</li>
</List>

// Inline list
<List variant="inline">
  <li>Tag 1</li>
  <li>Tag 2</li>
  <li>Tag 3</li>
</List>

// Divided list
<List variant="divided">
  <li>Item with border</li>
  <li>Another item with border</li>
  <li>Last item (no border)</li>
</List>

// Spaced list
<List variant="spaced">
  <li>Item with extra spacing</li>
  <li>Another spaced item</li>
</List>
```

### Marker styles

```tsx
// Different bullet styles
<List marker="disc">
  <li>Disc bullet</li>
</List>

<List marker="circle">
  <li>Circle bullet</li>
</List>

<List marker="square">
  <li>Square bullet</li>
</List>

// Ordered list markers
<List as="ol" marker="decimal">
  <li>1. Decimal</li>
</List>

<List as="ol" marker="alpha">
  <li>a. Alphabetic</li>
</List>

<List as="ol" marker="roman">
  <li>i. Roman numerals</li>
</List>
```

### Size variants

```tsx
// Small list
<List size="sm">
  <li>Small text item</li>
  <li>Another small item</li>
</List>

// Large list
<List size="lg">
  <li>Large text item</li>
  <li>Another large item</li>
</List>
```

### Spacing control

```tsx
// Tight spacing
<List spacing="sm">
  <li>Closely spaced item</li>
  <li>Another close item</li>
</List>

// Loose spacing
<List spacing="lg">
  <li>Loosely spaced item</li>
  <li>Another loose item</li>
</List>

// No spacing
<List spacing="none">
  <li>No space item</li>
  <li>Another no space item</li>
</List>
```

### Navigation lists

```tsx
// Navigation menu
<nav>
  <List variant="unstyled" spacing="sm">
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
    <li><a href="/contact">Contact</a></li>
  </List>
</nav>

// Breadcrumb navigation
<nav aria-label="Breadcrumb">
  <List variant="inline" marker="none">
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li aria-current="page">Current Page</li>
  </List>
</nav>
```

### Definition lists

```tsx
// Default definition list
<List as="dl">
  <dt>HTML</dt>
  <dd>HyperText Markup Language</dd>
  <dt>CSS</dt>
  <dd>Cascading Style Sheets</dd>
  <dt>JS</dt>
  <dd>JavaScript</dd>
</List>

// Inline definition list
<List as="dl" variant="inline">
  <dt>Name:</dt>
  <dd>John Doe</dd>
  <dt>Email:</dt>
  <dd>john@example.com</dd>
  <dt>Role:</dt>
  <dd>Developer</dd>
</List>
```

### Complex content

```tsx
// List with rich content
<List variant="spaced" size="lg">
  <li>
    <h3>Feature One</h3>
    <p>Description of the first feature with detailed explanation.</p>
  </li>
  <li>
    <h3>Feature Two</h3>
    <p>Description of the second feature with more details.</p>
  </li>
</List>

// List with mixed content
<List variant="divided">
  <li>
    <strong>Important:</strong> This is a critical item
  </li>
  <li>
    <em>Note:</em> This is a secondary item
  </li>
  <li>
    Regular list item with normal text
  </li>
</List>
```
