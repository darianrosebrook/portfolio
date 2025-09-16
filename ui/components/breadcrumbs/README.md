# Breadcrumbs

A navigation component that shows the current page's location within a website's hierarchy, with intelligent overflow handling for long paths.

## Purpose

Breadcrumbs help users understand their current location within the site structure and provide an easy way to navigate back to previous levels. This implementation includes smart overflow handling that collapses intermediate items when the path becomes too long.

## Usage

```tsx
import Breadcrumbs from '@/ui/components/Breadcrumbs';

function Example() {
  const base = { label: 'Home', href: '/' };
  const crumbs = [
    { label: 'Products', href: '/products' },
    { label: 'Electronics', href: '/products/electronics' },
    { label: 'Laptops', href: '/products/electronics/laptops' },
  ];

  return <Breadcrumbs base={base} crumbs={crumbs} />;
}
```

## Props

| Prop   | Type    | Default | Description                            |
| ------ | ------- | ------- | -------------------------------------- |
| base   | Crumb   | -       | The root/home link (always visible)    |
| crumbs | Crumb[] | -       | Ordered path from base to current page |

### Crumb Type

| Property | Type   | Description                     |
| -------- | ------ | ------------------------------- |
| label    | string | Display text for the breadcrumb |
| href     | string | URL for the breadcrumb link     |

## Examples

### Simple Breadcrumbs

```tsx
<Breadcrumbs
  base={{ label: 'Home', href: '/' }}
  crumbs={[{ label: 'About', href: '/about' }]}
/>
```

### Multi-level Navigation

```tsx
<Breadcrumbs
  base={{ label: 'Documentation', href: '/docs' }}
  crumbs={[
    { label: 'Components', href: '/docs/components' },
    { label: 'Navigation', href: '/docs/components/navigation' },
    { label: 'Breadcrumbs', href: '/docs/components/navigation/breadcrumbs' },
  ]}
/>
```

### Long Path with Overflow

```tsx
// When crumbs.length > 3, intermediate items are collapsed into "..."
<Breadcrumbs
  base={{ label: 'Store', href: '/store' }}
  crumbs={[
    { label: 'Electronics', href: '/store/electronics' },
    { label: 'Computers', href: '/store/electronics/computers' },
    { label: 'Laptops', href: '/store/electronics/computers/laptops' },
    { label: 'Gaming', href: '/store/electronics/computers/laptops/gaming' },
    {
      label: 'High Performance',
      href: '/store/electronics/computers/laptops/gaming/high-performance',
    },
  ]}
/>
```

## Overflow Behavior

The component intelligently handles long breadcrumb paths:

- **≤ 3 items**: All items are shown
- **> 3 items**: Intermediate items are collapsed into an expandable "..." menu
- **Always visible**: Base link, previous link, and current page
- **Expandable menu**: Contains all collapsed intermediate items

## Design Tokens

This component uses design tokens for consistent styling:

### Layout

- Consistent spacing between breadcrumb items
- Proper alignment and typography

### Interactive States

- Hover and focus states for links
- Expandable menu styling

## Accessibility

### Navigation Semantics

- Uses `<nav>` with `aria-label="Breadcrumb"`
- Current page marked with `aria-current="page"`
- Proper list structure with `<ul>` and `<li>`

### Keyboard Navigation

- All links are keyboard accessible
- Expandable overflow menu supports keyboard interaction
- Tab order follows visual order

### Screen Reader Support

- Overflow menu has descriptive `aria-label="More"`
- Current page is announced as current
- Navigation landmark is properly labeled

### Focus Management

- Clear focus indicators on all interactive elements
- Focus remains visible during keyboard navigation

## Related Components

- **AnimatedLink** - Used for breadcrumb links with hover animations
- **Link** - Next.js Link component for client-side navigation

## Implementation Notes

- Uses Next.js Link for client-side navigation
- Overflow menu uses native `<details>/<summary>` for accessibility
- Current page is not a link (follows accessibility best practices)
- Separators are decorative and not announced to screen readers
- Smart overflow algorithm preserves most important navigation context
- Responsive design considerations built into the layout
