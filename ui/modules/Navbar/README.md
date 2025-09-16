# Navbar

A comprehensive navigation header component with user authentication, theme controls, and responsive design features.

## Purpose

Navbar provides a complete site navigation experience with logo, navigation links, user authentication controls, theme switching, and accessibility preferences. It supports both authenticated and unauthenticated states with appropriate UI adaptations.

## Usage

```tsx
import Navbar from '@/ui/modules/Navbar';

function Example() {
  const pages = [
    { name: 'Home', path: 'home', admin: false },
    { name: 'About', path: 'about', admin: false },
    { name: 'Admin', path: 'admin', admin: true },
  ];

  return <Navbar pages={pages} />;
}
```

## Props

| Prop             | Type         | Default | Description                              |
| ---------------- | ------------ | ------- | ---------------------------------------- |
| pages            | NavbarPage[] | []      | Navigation pages to display              |
| className        | string       | ''      | Additional CSS class names               |
| showThemeToggle  | boolean      | true    | Whether to show theme toggle             |
| showMotionToggle | boolean      | true    | Whether to show motion preference toggle |

### NavbarPage Type

| Property | Type    | Description                        |
| -------- | ------- | ---------------------------------- |
| name     | string  | Display name for the page          |
| path     | string  | URL path for the page              |
| admin    | boolean | Whether page requires admin access |

## Examples

### Basic Navbar

```tsx
<Navbar
  pages={[
    { name: 'Home', path: 'home', admin: false },
    { name: 'About', path: 'about', admin: false },
  ]}
/>
```

### Without Theme Controls

```tsx
<Navbar pages={pages} showThemeToggle={false} showMotionToggle={false} />
```

### With Custom Styling

```tsx
<Navbar pages={pages} className="custom-navbar" />
```

### Admin Pages

```tsx
<Navbar
  pages={[
    { name: 'Home', path: 'home', admin: false },
    { name: 'Admin Panel', path: 'admin', admin: true },
  ]}
/>
```

## Features

### Navigation

- Dynamic page links based on props
- Active page highlighting
- Smooth page transitions with view transitions API
- Responsive navigation layout

### User Authentication

- User profile display with avatar
- Login/logout functionality
- User menu with account and dashboard links
- Conditional rendering based on auth state

### Theme Controls

- Light/dark theme switching
- System preference detection
- Theme persistence
- Smooth theme transitions

### Accessibility

- Reduced motion preference toggle
- Keyboard navigation support
- Screen reader compatibility
- Focus management

### Responsive Design

- Mobile-optimized layout
- Collapsible menu on smaller screens
- Touch-friendly controls
- Adaptive spacing

## Design Tokens

This component uses design tokens for consistent styling:

### Layout

- Header height and positioning
- Navigation spacing and alignment
- Logo and title sizing
- Menu dimensions

### Colors

- Background and border colors
- Text and link colors
- Active state colors
- Hover and focus states

### Typography

- Title font sizing and weight
- Link typography
- Menu item styling

### Interactive States

- Hover and focus indicators
- Active page highlighting
- Button states
- Menu item interactions

## Accessibility

### Keyboard Navigation

- Full keyboard support for all interactive elements
- Logical tab order through navigation
- Enter/Space key activation for buttons
- Escape key for closing menus

### Screen Reader Support

- Proper semantic HTML structure
- ARIA labels for interactive elements
- User state announcements
- Menu structure clearly defined

### Focus Management

- Clear focus indicators
- Focus trapping in popover menus
- Focus restoration after actions
- Skip links for main content

### Motion Preferences

- Respects `prefers-reduced-motion`
- Toggle for user preference override
- Smooth transitions when enabled

## Related Components

- **Logo** - Site logo component
- **AnimatedLink** - Animated navigation links
- **Popover** - Dropdown menus for settings and user menu
- **Button** - Action buttons
- **ToggleSwitch** - Theme and motion controls
- **Avatar** - User profile display

## Implementation Notes

- Uses Next.js view transitions for smooth page changes
- Integrates with user authentication context
- Supports both client and server-side rendering
- Responsive design with mobile considerations
- Theme switching with CSS custom properties
- Accessibility-first design approach
- Performance optimized with proper cleanup
- Integrates with design system tokens
