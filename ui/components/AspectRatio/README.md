# AspectRatio

A container component that maintains a consistent width-to-height ratio for its content.

## When to use

- Maintain consistent proportions for images, videos, or media content
- Create responsive containers that scale proportionally
- Ensure consistent layout ratios across different screen sizes
- Placeholder containers for dynamic content

## Key ideas

- **Modern CSS**: Uses `aspect-ratio` property with fallback support
- **Flexible ratios**: Support for custom ratios or common presets
- **Responsive**: Automatically scales with container width
- **Fallback support**: Works in browsers without `aspect-ratio` support

## Props

### AspectRatioProps

| Prop     | Type                                                     | Default | Description                                  |
| -------- | -------------------------------------------------------- | ------- | -------------------------------------------- |
| `ratio`  | `number`                                                 | -       | Aspect ratio as width/height (e.g., 16/9, 1) |
| `preset` | `'square' \| 'video' \| 'photo' \| 'wide' \| 'portrait'` | -       | Predefined aspect ratio                      |

Extends `React.HTMLAttributes<HTMLDivElement>`.

### Preset Ratios

- `square`: 1:1 (1)
- `video`: 16:9 (1.778)
- `photo`: 4:3 (1.333)
- `wide`: 21:9 (2.333)
- `portrait`: 3:4 (0.75)

## Accessibility

- Container maintains semantic structure of child content
- Preserves focus order and keyboard navigation
- Supports all ARIA attributes and roles

## Examples

### Basic usage

```tsx
import { AspectRatio } from '@/ui/components/AspectRatio';

// Square container
<AspectRatio preset="square">
  <img src="profile.jpg" alt="Profile" />
</AspectRatio>

// Video aspect ratio
<AspectRatio preset="video">
  <iframe src="https://youtube.com/embed/..." />
</AspectRatio>
```

### Custom ratios

```tsx
// Custom 2:1 ratio
<AspectRatio ratio={2}>
  <div>Custom content with 2:1 ratio</div>
</AspectRatio>

// Golden ratio
<AspectRatio ratio={1.618}>
  <img src="hero-image.jpg" alt="Hero" />
</AspectRatio>
```

### Responsive images

```tsx
// Responsive image container
<AspectRatio preset="photo">
  <img
    src="image.jpg"
    alt="Description"
    style={{
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    }}
  />
</AspectRatio>
```

### Video embeds

```tsx
// YouTube embed
<AspectRatio preset="video">
  <iframe
    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
    title="Video title"
    style={{
      width: '100%',
      height: '100%',
      border: 'none',
    }}
  />
</AspectRatio>
```

### Placeholder content

```tsx
// Empty container shows placeholder
<AspectRatio preset="square" />

// With loading state
<AspectRatio preset="video">
  {isLoading ? (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f5f5f5'
    }}>
      Loading...
    </div>
  ) : (
    <video controls>
      <source src="video.mp4" type="video/mp4" />
    </video>
  )}
</AspectRatio>
```
