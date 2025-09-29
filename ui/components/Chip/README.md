# Chip Component

A flexible chip component that supports multiple variants for different use cases.

## Features

- **Three variants**: `default`, `selected` (checkbox-like with checkmark), `dismissible` (with X icon)
- **Three sizes**: `small`, `medium` (default), `large`
- **GSAP animations**: Smooth entrance animations for icons and hover effects
- **Accessibility**: Full keyboard navigation, ARIA support, and screen reader compatibility
- **Customizable**: Support for custom content, icons, and styling
- **TypeScript**: Full type safety with comprehensive prop types

## Usage

### Basic Usage

```tsx
import { Chip } from '@/ui/components/Chip';

// Default chip
<Chip>Default</Chip>

// Selected variant (checkbox-like)
<Chip variant="selected">Selected</Chip>

// Dismissible variant
<Chip variant="dismissible">Dismissible</Chip>
```

### Interactive Example

```tsx
const [selectedItems, setSelectedItems] = useState<string[]>([]);

const toggleItem = (item: string) => {
  setSelectedItems(prev =>
    prev.includes(item)
      ? prev.filter(i => i !== item)
      : [...prev, item]
  );
};

return (
  <div>
    {items.map(item => {
      const isSelected = selectedItems.includes(item);
      return (
        <Chip
          key={item}
          variant={isSelected ? "selected" : "default"}
          onClick={() => toggleItem(item)}
          ariaPressed={isSelected}
        >
          {item}
        </Chip>
      );
    })}
  </div>
);
```

### Dismissible Example

```tsx
const [tags, setTags] = useState<string[]>(['React', 'TypeScript']);

const removeTag = (tag: string) => {
  setTags(prev => prev.filter(t => t !== tag));
};

return (
  <div>
    {tags.map(tag => (
      <Chip
        key={tag}
        variant="dismissible"
        onClick={() => removeTag(tag)}
        ariaLabel={`Remove ${tag}`}
      >
        {tag}
      </Chip>
    ))}
  </div>
);
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'selected' \| 'dismissible'` | `'default'` | Visual variant of the chip |
| `size` | `'small' \| 'medium' \| 'large'` | `'medium'` | Size of the chip |
| `disabled` | `boolean` | `false` | Whether the chip is disabled |
| `className` | `string` | `''` | Additional CSS classes |
| `title` | `string` | `''` | Tooltip text |
| `ariaLabel` | `string` | - | Accessible label for screen readers |
| `ariaPressed` | `boolean` | - | ARIA pressed state (useful for toggleable chips) |
| `role` | `React.AriaRole` | `'button'` | ARIA role |
| `asChild` | `boolean` | `false` | Render as child element |
| `children` | `React.ReactNode` | - | Content of the chip |

### Polymorphic Props

The Chip component supports polymorphic rendering:

```tsx
// Render as button (default)
<Chip>Button Chip</Chip>

// Render as link
<Chip as="a" href="/path">Link Chip</Chip>

// Render as child element
<Chip asChild>
  <span>Custom Element</span>
</Chip>
```

## Accessibility

- **Keyboard Navigation**: Supports Enter and Space key activation
- **ARIA Support**: Proper ARIA attributes for screen readers
- **Focus Management**: Visible focus indicators
- **Semantic HTML**: Uses appropriate semantic elements

## Styling

The component uses CSS modules with design tokens. Custom styling can be applied via the `className` prop:

```tsx
<Chip className="custom-chip">Styled Chip</Chip>
```

## Animation

The component uses GSAP for smooth animations:
- Icon entrance animations (scale and fade)
- Hover effects (subtle scale)
- Focus states with outline rings

## Examples

See the [demo page](/chip-demo) for comprehensive examples of all variants and use cases.
