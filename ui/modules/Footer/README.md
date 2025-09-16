# Footer

A site footer module component that displays social links, copyright information, and other footer content with customizable styling and responsive design.

## Purpose

Footer provides a consistent site footer experience with social media links, copyright information, and flexible content areas. It supports both default social links and custom link configurations.

## Usage

```tsx
import Footer from '@/ui/modules/Footer';

function Example() {
  return <Footer />;
}
```

## Props

| Prop          | Type         | Default | Description                                  |
| ------------- | ------------ | ------- | -------------------------------------------- |
| className     | string       | ''      | Additional CSS class names                   |
| links         | FooterLink[] | []      | Custom social links (uses defaults if empty) |
| showCopyright | boolean      | true    | Whether to show copyright information        |
| copyrightText | string       | auto    | Custom copyright text                        |

### FooterLink Type

| Property | Type   | Description                     |
| -------- | ------ | ------------------------------- |
| title    | string | Display name for the link       |
| icon     | any    | Icon component from FontAwesome |
| url      | string | Link destination URL            |

## Examples

### Basic Footer

```tsx
<Footer />
```

### Custom Social Links

```tsx
<Footer
  links={[
    {
      title: 'GitHub',
      icon: faGithub,
      url: 'https://github.com/username',
    },
    {
      title: 'LinkedIn',
      icon: faLinkedin,
      url: 'https://linkedin.com/in/username',
    },
  ]}
/>
```

### Custom Copyright

```tsx
<Footer copyrightText="© 2024 My Company. All rights reserved." />
```

### Without Copyright

```tsx
<Footer showCopyright={false} />
```

### With Custom Styling

```tsx
<Footer className="custom-footer" />
```

## Default Social Links

The footer includes these default social links:

- **Resume** - Google Drive link to resume
- **GitHub** - GitHub profile
- **LinkedIn** - LinkedIn profile
- **Twitter** - Twitter profile
- **YouTube** - YouTube channel
- **Instagram** - Instagram profile

## Design Tokens

This component uses design tokens for consistent styling:

### Layout

- Footer padding and spacing
- Social links gap and alignment
- Copyright section spacing

### Typography

- Title font size and weight
- Copyright text styling
- Responsive font sizing

### Colors

- Background and text colors
- Border colors for sections
- Link and hover states

### Responsive Design

- Mobile-optimized spacing
- Flexible link layout
- Responsive typography

## Accessibility

### Screen Reader Support

- Proper semantic footer element
- Social links have descriptive titles
- Copyright information is clearly marked

### Keyboard Navigation

- All social links are keyboard accessible
- Focus indicators on interactive elements
- Logical tab order

### Focus Management

- Clear focus indicators
- Proper focus states for links
- Accessible link descriptions

## Related Components

- **Marquee** - Used for animated social link display
- **Icon** - FontAwesome icons for social links

## Implementation Notes

- Uses FontAwesome icons for social links
- Supports both default and custom link configurations
- Responsive design with mobile considerations
- Copyright year automatically updates
- Flexible content areas for customization
- Integrates with design system tokens
- Accessible by default
- Supports custom styling via className prop
