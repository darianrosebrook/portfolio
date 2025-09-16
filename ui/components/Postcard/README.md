# Postcard

A composer component for displaying social media posts with rich content, author information, engagement stats, and interactive elements.

## Purpose

Postcard provides a complete social media post interface with composable parts for displaying author information, post content, media embeds, and engagement statistics. It uses a context provider pattern to share post data across all child components.

## Usage

```tsx
import Postcard from '@/ui/components/Postcard';

function Example() {
  return (
    <Postcard
      postId="123"
      author={{
        name: 'John Doe',
        handle: '@johndoe',
        avatar: '/avatars/john.jpg',
      }}
      timestamp="2024-01-15T10:30:00Z"
      content="Just shipped a new feature! 🚀"
      stats={{
        likes: 42,
        replies: 8,
        reposts: 12,
      }}
    >
      <Postcard.Header />
      <Postcard.Content />
      <Postcard.Actions />
    </Postcard>
  );
}
```

## Props

### Postcard (Provider) Props

| Prop      | Type                   | Default | Description                    |
| --------- | ---------------------- | ------- | ------------------------------ |
| postId    | string                 | -       | Unique identifier for the post |
| author    | AuthorObject           | -       | Author information             |
| timestamp | string                 | -       | ISO timestamp of the post      |
| content   | string                 | -       | Text content of the post       |
| embed     | EmbedObject (optional) | -       | Media embed information        |
| stats     | StatsObject            | -       | Engagement statistics          |
| children  | React.ReactNode        | -       | Child components               |

### Author Object

| Property | Type   | Description                  |
| -------- | ------ | ---------------------------- |
| name     | string | Display name of the author   |
| handle   | string | Username/handle (with @)     |
| avatar   | string | URL to author's avatar image |

### Embed Object

| Property    | Type                              | Description              |
| ----------- | --------------------------------- | ------------------------ |
| type        | 'image' \| 'video' \| 'audio'     | Type of media embed      |
| url         | string                            | URL to the media file    |
| aspectRatio | { width: number, height: number } | Aspect ratio for display |

### Stats Object

| Property | Type   | Description                |
| -------- | ------ | -------------------------- |
| likes    | number | Number of likes/hearts     |
| replies  | number | Number of replies/comments |
| reposts  | number | Number of reposts/shares   |

## Sub-components

### Postcard.Header

Displays author information and timestamp.

### Postcard.Content

Displays the post text content.

### Postcard.Embed

Displays media embeds (images, videos, audio).

### Postcard.Actions

Displays engagement buttons (like, reply, repost, share).

## Examples

### Basic Post

```tsx
<Postcard
  postId="basic-post"
  author={{
    name: 'Jane Smith',
    handle: '@janesmith',
    avatar: '/avatars/jane.jpg',
  }}
  timestamp="2024-01-15T14:20:00Z"
  content="Working on some exciting new designs today!"
  stats={{ likes: 15, replies: 3, reposts: 2 }}
>
  <Postcard.Header />
  <Postcard.Content />
  <Postcard.Actions />
</Postcard>
```

### Post with Image Embed

```tsx
<Postcard
  postId="image-post"
  author={{
    name: 'Designer Co',
    handle: '@designerco',
    avatar: '/avatars/company.jpg',
  }}
  timestamp="2024-01-15T16:45:00Z"
  content="Check out our latest design system update!"
  embed={{
    type: 'image',
    url: '/images/design-system.jpg',
    aspectRatio: { width: 16, height: 9 },
  }}
  stats={{ likes: 89, replies: 12, reposts: 24 }}
>
  <Postcard.Header />
  <Postcard.Content />
  <Postcard.Embed />
  <Postcard.Actions />
</Postcard>
```

### Minimal Post

```tsx
<Postcard
  postId="minimal"
  author={{
    name: 'Quick Update',
    handle: '@updates',
    avatar: '/avatars/bot.jpg',
  }}
  timestamp="2024-01-15T18:00:00Z"
  content="System maintenance complete ✅"
  stats={{ likes: 5, replies: 0, reposts: 1 }}
>
  <Postcard.Header />
  <Postcard.Content />
</Postcard>
```

## Design Tokens

This component uses design tokens for consistent styling:

### Layout

- Card padding and spacing
- Border radius and shadows
- Grid layout for post structure

### Typography

- Author name and handle styling
- Content text formatting
- Timestamp styling

### Colors

- Background and border colors
- Text colors for different elements
- Interactive state colors

### Interactive Elements

- Button hover and focus states
- Icon colors and sizing
- Engagement counter styling

## Accessibility

### Screen Reader Support

- Proper semantic structure with headings and landmarks
- Author information properly associated
- Engagement statistics announced clearly
- Media embeds have appropriate alt text

### Keyboard Navigation

- All interactive elements are keyboard accessible
- Focus indicators on buttons and links
- Logical tab order through post elements

### ARIA Labels

- Engagement buttons have descriptive labels
- Media embeds have appropriate roles
- Time stamps are properly formatted for screen readers

## Related Components

- **Icon** - Used for engagement action buttons
- **Image** - Next.js Image component for media embeds
- **Link** - For external links and navigation

## Implementation Notes

- Uses context provider pattern for data sharing
- Supports flexible composition of post elements
- Handles different media types (image, video, audio)
- Engagement statistics are display-only (no interaction logic)
- Timestamps should be provided in ISO format
- Avatar images are optimized using Next.js Image component
- External links include appropriate security attributes
- Component is designed for social media feed contexts
