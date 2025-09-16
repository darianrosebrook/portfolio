# ComponentSVG

A module component that displays SVG representations of UI components, typically used for documentation or design system showcases.

## Purpose

ComponentSVG provides a standardized way to display component previews as SVG graphics, useful for documentation sites, design system galleries, and component showcases.

## Usage

```tsx
import ComponentSVG from '@/ui/modules/ComponentSVG';

function Example() {
  return <ComponentSVG className="component-preview" />;
}
```

## Props

| Prop      | Type   | Default | Description                |
| --------- | ------ | ------- | -------------------------- |
| className | string | -       | Additional CSS class names |

## Examples

### Basic Usage

```tsx
<ComponentSVG />
```

### With Custom Styling

```tsx
<ComponentSVG className="my-component-preview" />
```

## Design Tokens

This component uses design tokens for consistent styling:

### Layout

- Inline-block display for proper sizing
- Fit-content dimensions
- Responsive SVG scaling

### Colors

- Uses CSS custom properties for accent colors
- Maintains design system color consistency

## Accessibility

### Screen Reader Support

- SVG content is decorative and doesn't need alt text
- Component is purely visual representation

### Focus Management

- No interactive elements
- No focus requirements

## Implementation Notes

- Uses inline SVG for optimal performance
- SVG scales responsively with container
- Colors use CSS custom properties for theming
- Designed for documentation and showcase contexts
- No interactive functionality
