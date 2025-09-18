# PageTransition Component

A comprehensive page transition component that leverages the View Transitions API in supported browsers and provides graceful fallbacks for unsupported environments.

## Features

- **View Transitions API Support**: Automatically detects and uses the native View Transitions API when available
- **Graceful Fallbacks**: CSS-based animations for browsers without View Transitions API support
- **Accessibility Compliant**: Respects `prefers-reduced-motion` and provides appropriate ARIA attributes
- **Customizable**: Configurable transition names, durations, and styling
- **Performance Optimized**: Minimal JavaScript overhead with CSS-driven animations
- **TypeScript Ready**: Full TypeScript support with comprehensive type definitions

## Usage

### Basic Page Transition

```tsx
import { PageTransition } from '@/ui/components/PageTransition';

function MyPage() {
  return (
    <PageTransition transitionName="doc-content">
      <h1>Page Content</h1>
      <p>This content will transition smoothly between page navigations.</p>
    </PageTransition>
  );
}
```

### With Custom Configuration

```tsx
import { PageTransition } from '@/ui/components/PageTransition';

function MyPage() {
  return (
    <PageTransition
      transitionName="custom-content"
      duration={500}
      enabled={true}
      className="custom-transition"
    >
      <div>Custom page content</div>
    </PageTransition>
  );
}
```

### Navigation Links with Transitions

```tsx
import { TransitionLink } from '@/ui/components/PageTransition';

function Navigation() {
  return (
    <nav>
      <TransitionLink href="/about" aria-label="About page">
        About
      </TransitionLink>
      <TransitionLink href="/contact" aria-label="Contact page">
        Contact
      </TransitionLink>
    </nav>
  );
}
```

## API

### PageTransition Props

| Prop             | Type        | Default          | Description                          |
| ---------------- | ----------- | ---------------- | ------------------------------------ |
| `children`       | `ReactNode` | Required         | The content to be transitioned       |
| `transitionName` | `string`    | `'main-content'` | Unique identifier for the transition |
| `duration`       | `number`    | `300`            | Transition duration in milliseconds  |
| `enabled`        | `boolean`   | `true`           | Enable/disable transitions           |
| `className`      | `string`    | `undefined`      | Additional CSS classes               |

### TransitionLink Props

| Prop         | Type         | Default     | Description                        |
| ------------ | ------------ | ----------- | ---------------------------------- |
| `href`       | `string`     | Required    | Navigation target URL              |
| `children`   | `ReactNode`  | Required    | Link content                       |
| `className`  | `string`     | `undefined` | Additional CSS classes             |
| `aria-label` | `string`     | `undefined` | Accessibility label                |
| `onClick`    | `() => void` | `undefined` | Click handler                      |
| `replace`    | `boolean`    | `false`     | Replace instead of push to history |

## Browser Support

### View Transitions API

- **Chrome**: 111+
- **Edge**: 111+
- **Safari**: Not yet supported (fallback CSS animations used)
- **Firefox**: Behind flag (fallback CSS animations used)

### Fallback Support

- All modern browsers support the CSS-based fallback animations
- Gracefully degrades for older browsers with reduced animation

## Accessibility

- **Reduced Motion**: Automatically disables animations when `prefers-reduced-motion: reduce` is set
- **High Contrast**: Reduces animation duration in high contrast mode
- **Focus Management**: Maintains proper focus handling during transitions
- **Screen Readers**: Compatible with screen reader navigation

## CSS Custom Properties

You can customize transitions using CSS custom properties:

```css
.custom-transition {
  --transition-duration: 500ms;
  --transition-easing: cubic-bezier(0.4, 0, 0.2, 1);
}
```

## Advanced Usage

### Layout-specific Transitions

```tsx
// In your layout component
<PageTransition transitionName="doc-layout">
  <Breadcrumbs transitionName="breadcrumb" />
  <PageTransition transitionName="doc-content">{children}</PageTransition>
</PageTransition>
```

### Custom View Transition Names

Different sections can have different transition behaviors:

```tsx
// Main content area
<PageTransition transitionName="main-content">
  {children}
</PageTransition>

// Sidebar navigation
<PageTransition transitionName="sidebar">
  <Navigation />
</PageTransition>

// Header area
<PageTransition transitionName="header">
  <Header />
</PageTransition>
```

## Best Practices

1. **Consistent Naming**: Use consistent `transitionName` values across similar page types
2. **Performance**: Keep transition durations under 500ms for better perceived performance
3. **Content Structure**: Wrap semantic content blocks rather than individual elements
4. **Accessibility**: Always test with screen readers and reduced motion preferences
5. **Progressive Enhancement**: Design for no-transition scenarios first, then enhance

## Integration with Next.js 15

This component is optimized for Next.js 15's View Transitions API support. Ensure your `next.config.js` includes:

```javascript
module.exports = {
  experimental: {
    viewTransition: true,
  },
};
```

## Troubleshooting

### Transitions Not Working

1. Check browser support for View Transitions API
2. Verify `prefers-reduced-motion` settings
3. Ensure unique `transitionName` values
4. Check Next.js configuration

### Performance Issues

1. Limit concurrent transitions
2. Use shorter durations for frequently accessed pages
3. Consider using `will-change` CSS property sparingly
4. Profile with browser dev tools

### Accessibility Issues

1. Test with screen readers
2. Verify focus management
3. Check contrast ratios during transitions
4. Test with reduced motion preferences
