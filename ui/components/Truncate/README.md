# Truncate

A utility component that handles text overflow with ellipsis or expandable content.

## When to use

- Limit text to a specific number of lines in constrained layouts
- Provide expand/collapse functionality for long content
- Handle text overflow gracefully in cards or lists
- Create "read more" interactions for articles or descriptions

## Key ideas

- **Flexible truncation**: Single-line or multi-line support
- **Expandable content**: Optional show more/less functionality
- **Semantic HTML**: Can render as any HTML element
- **Responsive**: Adapts to container width and font size changes

## Props

### TruncateProps

| Prop           | Type                          | Default       | Description                                   |
| -------------- | ----------------------------- | ------------- | --------------------------------------------- |
| `as`           | `keyof JSX.IntrinsicElements` | `'div'`       | Element type to render                        |
| `lines`        | `number`                      | `1`           | Number of lines to show before truncating     |
| `expandable`   | `boolean`                     | `false`       | Whether to show expand/collapse functionality |
| `expandText`   | `string`                      | `'Show more'` | Custom expand text                            |
| `collapseText` | `string`                      | `'Show less'` | Custom collapse text                          |
| `onToggle`     | `(expanded: boolean) => void` | -             | Callback when expand/collapse state changes   |

Extends `React.HTMLAttributes<HTMLDivElement>`.

## Accessibility

- Uses semantic HTML elements
- Toggle button has proper `aria-expanded` attribute
- Maintains keyboard navigation and focus management
- Supports screen readers with clear expand/collapse states

## Examples

### Basic usage

```tsx
import { Truncate } from '@/ui/components/Truncate';

// Single line truncation
<Truncate>
  This is a very long text that will be truncated with an ellipsis when it exceeds the container width.
</Truncate>

// Multi-line truncation
<Truncate lines={3}>
  This is a longer piece of text that will be truncated after three lines.
  The content will be cut off and show an ellipsis or fade effect to indicate
  there is more content available.
</Truncate>
```

### Expandable content

```tsx
// With expand/collapse functionality
<Truncate lines={2} expandable>
  This is a long article or description that users can expand to read the full content.
  When truncated, it shows a "Show more" button that allows users to reveal the complete text.
  After expanding, they can collapse it back to the truncated view.
</Truncate>

// Custom expand/collapse text
<Truncate
  lines={3}
  expandable
  expandText="Read full article"
  collapseText="Show summary"
>
  Long article content here...
</Truncate>
```

### Different elements

```tsx
// As a paragraph
<Truncate as="p" lines={2} expandable>
  Paragraph content that can be expanded...
</Truncate>

// As a span for inline content
<Truncate as="span">
  Inline text that gets truncated
</Truncate>

// As a heading with truncation
<Truncate as="h3">
  Very Long Heading That Might Need Truncation
</Truncate>
```

### With state management

```tsx
function ArticlePreview() {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div>
      <h2>Article Title</h2>
      <Truncate lines={3} expandable onToggle={setIsExpanded}>
        {articleContent}
      </Truncate>
      {isExpanded && (
        <div className="article-meta">
          <p>Published: {publishDate}</p>
          <p>Author: {author}</p>
        </div>
      )}
    </div>
  );
}
```

### Card layouts

```tsx
// In a card component
<div className="card">
  <img src="image.jpg" alt="Article" />
  <div className="card-content">
    <h3>Article Title</h3>
    <Truncate lines={2} expandable>
      Article description or excerpt that might be quite long and needs to be
      truncated to maintain consistent card heights in a grid layout.
    </Truncate>
  </div>
</div>
```
