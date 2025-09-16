# ProfileFlag

A display component for showing user profile information with avatar, name, and additional metadata in a compact flag-style layout.

## Purpose

ProfileFlag provides a consistent way to display user profile information across the application, typically used in headers, comments, author bylines, and user lists.

## Usage

```tsx
import ProfileFlag from '@/ui/components/ProfileFlag';

function Example() {
  return (
    <ProfileFlag name="John Doe" handle="@johndoe" avatar="/avatars/john.jpg" />
  );
}
```

## Props

| Prop      | Type            | Default | Description                 |
| --------- | --------------- | ------- | --------------------------- |
| name      | string          | -       | Display name of the user    |
| handle    | string          | -       | Username or handle          |
| avatar    | string          | -       | URL to user's avatar image  |
| subtitle  | string          | -       | Optional subtitle or role   |
| className | string          | ''      | Additional CSS class names  |
| children  | React.ReactNode | -       | Optional additional content |

## Examples

### Basic Profile Flag

```tsx
<ProfileFlag name="Jane Smith" handle="@janesmith" avatar="/avatars/jane.jpg" />
```

### With Subtitle

```tsx
<ProfileFlag
  name="John Developer"
  handle="@johndev"
  avatar="/avatars/john.jpg"
  subtitle="Senior Frontend Engineer"
/>
```

### With Custom Content

```tsx
<ProfileFlag name="Design Team" handle="@design" avatar="/avatars/team.jpg">
  <span className="badge">Team Account</span>
</ProfileFlag>
```

## Design Tokens

This component uses design tokens for consistent styling:

### Layout

- Avatar size and spacing
- Text alignment and hierarchy
- Overall component padding

### Typography

- Name text styling
- Handle/subtitle formatting
- Consistent font weights

### Colors

- Text colors for different elements
- Avatar border and background
- Interactive state colors

## Accessibility

### Screen Reader Support

- Proper semantic structure
- Avatar images have descriptive alt text
- Handle and subtitle are properly associated

### Keyboard Navigation

- If interactive, supports keyboard focus
- Clear focus indicators
- Logical tab order

## Related Components

- **Avatar** - Used for profile image display
- **Badge** - Can be used with children for status indicators

## Implementation Notes

- Avatar images are optimized for performance
- Handles graceful fallbacks for missing avatars
- Responsive design considerations
- Supports both static display and interactive variants
- Consistent spacing and alignment across different contexts
