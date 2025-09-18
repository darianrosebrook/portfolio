# {{componentName}} Primitive

{{description}}

## Layer Classification

**Layer:** Primitive  
**Characteristics:** Boring, stable, minimal props, design tokens only

## When to Use

- {{useCases}}

## Key Features

### ✅ Primitive Benefits

- **Boring & Stable:** Minimal API that rarely changes
- **Token-Driven:** All styling uses design tokens for consistency
- **Accessible:** Built-in ARIA support and keyboard interaction
- **Minimal Props:** Only essential functionality

### 🎯 What This Component Does NOT Do

- **No Complex Logic:** No validation, orchestration, or layout concerns
- **No Labels/Descriptions:** Those belong to higher layers (Field composer, etc.)
- **No State Management:** Only handles basic component state

## Usage

### Basic Usage

```tsx
import { {{componentName}} } from '@/ui/components/{{componentName}}';

function BasicExample() {
  return (
    <{{componentName}}>
      Basic content
    </{{componentName}}>
  );
}
```

### Size Variants

```tsx
function SizeExample() {
  return (
    <>
      <{{componentName}} size="sm">Small</{{componentName}}>
      <{{componentName}} size="md">Medium</{{componentName}}>
      <{{componentName}} size="lg">Large</{{componentName}}>
    </>
  );
}
```

### Variants

```tsx
function VariantExample() {
  return (
    <>
      <{{componentName}} variant="primary">Primary</{{componentName}}>
      <{{componentName}} variant="secondary">Secondary</{{componentName}}>
    </>
  );
}
```

### Disabled State

```tsx
function DisabledExample() {
  return (
    <{{componentName}} disabled>
      Disabled content
    </{{componentName}}>
  );
}
```

## API Reference

```tsx
interface {{componentName}}Props {
  // Size using design tokens
  size?: 'sm' | 'md' | 'lg';                    // Default: 'md'

  // Visual variant
  variant?: 'primary' | 'secondary';            // Default: 'primary'

  // State
  disabled?: boolean;                           // Disabled state

  // Content
  children?: React.ReactNode;                   // Content

  // Styling
  className?: string;                           // Additional CSS classes

  // Accessibility
  id?: string;                                  // Custom ID (auto-generated if not provided)

  // All other standard HTML attributes are supported
}
```

## Accessibility

- **ARIA Support:** Proper semantic HTML and ARIA attributes
- **Keyboard Support:** Standard keyboard interaction patterns
- **Focus Management:** Visible focus indicators
- **Screen Readers:** Semantic elements with proper announcements

## Styling

The component uses design tokens for all styling:

```scss
// Size tokens
--size-8, --size-10, --size-12        // Component dimensions
--space-100, --space-200, --space-300 // Padding values
--font-size-sm, --font-size-base      // Typography

// Color tokens
--color-border-default                // Default border
--color-border-hover                  // Hover border
--color-background-surface            // Default background
--color-foreground-default            // Text color

// Other tokens
--radius-md                           // Border radius
--font-family-base                    // Font family
```

## Framework Alignment

This component exemplifies the **Primitive** layer:

- ✅ **Irreducible:** Cannot be broken down further without losing function
- ✅ **Boring:** Stable API that rarely changes
- ✅ **Token-Driven:** All styling uses design system tokens
- ✅ **Accessible:** Built-in ARIA and keyboard support
- ✅ **Minimal Props:** Only essential functionality
- ✅ **No Complex Logic:** No orchestration or validation

## Integration with Higher Layers

### With Field Composer

```tsx
import { Field } from '@/ui/components/Field';
import { {{componentName}} } from '@/ui/components/{{componentName}}';

<Field>
  <Field.Label>Label text</Field.Label>
  <{{componentName}} />
  <Field.Error />
</Field>
```

## Examples

See the component showcase for interactive examples of all variants and states.
