# Editor

A rich text editor module built on Tiptap that provides a comprehensive writing experience with formatting, media support, and collaborative features.

## Purpose

Editor provides a powerful rich text editing experience for content creation, supporting markdown-style formatting, media embeds, tables, and advanced features like collaborative editing and real-time updates.

## Usage

```tsx
import Editor from '@/ui/modules/Editor';

function Example() {
  const [article, setArticle] = useState({
    id: 1,
    articleBody: { type: 'doc', content: [] },
  });

  return <Editor article={article} handleUpdate={setArticle} />;
}
```

## Props

| Prop         | Type                       | Default  | Description                       |
| ------------ | -------------------------- | -------- | --------------------------------- |
| article      | Article                    | -        | Article object containing content |
| handleUpdate | (article: Article) => void | () => {} | Callback when content changes     |

### Article Type

| Property    | Type        | Description                       |
| ----------- | ----------- | --------------------------------- |
| id          | number      | Unique identifier for the article |
| articleBody | JSONContent | Tiptap JSON content structure     |

## Examples

### Basic Editor

```tsx
<Editor
  article={{
    id: 1,
    articleBody: {
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: 'Start writing...' }],
        },
      ],
    },
  }}
/>
```

### With Update Handler

```tsx
const [article, setArticle] = useState(initialArticle);

<Editor
  article={article}
  handleUpdate={(updatedArticle) => {
    setArticle(updatedArticle);
    // Save to backend, update state, etc.
  }}
/>;
```

### Pre-populated Content

```tsx
<Editor
  article={{
    id: 2,
    articleBody: {
      type: 'doc',
      content: [
        {
          type: 'heading',
          attrs: { level: 1 },
          content: [{ type: 'text', text: 'My Article' }],
        },
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'This is the ' },
            { type: 'text', marks: [{ type: 'bold' }], text: 'introduction' },
            { type: 'text', text: ' to my article.' },
          ],
        },
      ],
    },
  }}
/>
```

## Features

### Text Formatting

- **Bold**, _italic_, ~~strikethrough~~
- Headings (H1-H6)
- Lists (ordered and unordered)
- Blockquotes
- Code blocks and inline code
- Links and references

### Media Support

- Image uploads and embedding
- Video embedding
- Drag and drop support
- Responsive media handling

### Advanced Features

- Table support
- Collaborative editing
- Real-time updates
- Undo/redo functionality
- Keyboard shortcuts
- Bubble menus for media

## Design Tokens

This component uses design tokens for consistent styling:

### Layout

- Editor container padding and spacing
- Border radius and focus states
- Minimum height and responsive sizing

### Typography

- Font family and sizing
- Line height and spacing
- Heading hierarchy
- Code block formatting

### Colors

- Background and text colors
- Border and focus colors
- Link and accent colors
- Code block backgrounds

### Interactive States

- Focus indicators
- Hover states for interactive elements
- Selection highlighting

## Accessibility

### Keyboard Navigation

- Full keyboard support for all features
- Standard text editing shortcuts
- Tab navigation for toolbar
- Escape key for closing menus

### Screen Reader Support

- Proper ARIA labels and roles
- Content structure announced correctly
- Toolbar controls properly labeled
- Focus management for modal dialogs

### Focus Management

- Clear focus indicators
- Logical tab order
- Focus trapping in modals
- Focus restoration after actions

## Related Components

- **ToolbarWrapper** - Editor toolbar with formatting controls
- **ImageBubbleMenu** - Context menu for image editing
- **VideoBubbleMenu** - Context menu for video editing
- **Tiptap Extensions** - Core editor functionality

## Implementation Notes

- Built on Tiptap React framework
- Uses JSONContent for content structure
- Supports real-time collaborative editing
- Extensible through Tiptap extensions
- Optimized for performance with large documents
- Handles media uploads and embedding
- Supports custom keyboard shortcuts
- Integrates with design system tokens
- Mobile-responsive design
- Accessible by default
