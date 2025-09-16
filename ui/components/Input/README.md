# Input

A primitive input component that provides a consistent foundation for text input across the design system.

## Purpose

The Input component is a styled wrapper around the native HTML input element, providing design token integration, validation states, and accessibility features while maintaining full compatibility with standard input attributes.

## Usage

```tsx
import { Input } from '@/ui/components/Input';

function Example() {
  return (
    <Input
      type="text"
      placeholder="Enter your name"
      onChange={(e) => console.log(e.target.value)}
    />
  );
}
```

## Props

| Prop      | Type                                        | Default | Description                                      |
| --------- | ------------------------------------------- | ------- | ------------------------------------------------ |
| invalid   | boolean                                     | false   | Whether the input is in an invalid state         |
| className | string                                      | ''      | Additional CSS class names                       |
| ...rest   | React.InputHTMLAttributes<HTMLInputElement> | -       | All standard HTML input attributes are supported |

Note: The `size` attribute is omitted to avoid conflicts with CSS sizing.

## Examples

### Basic Input

```tsx
<Input type="text" placeholder="Basic input" />
```

### Invalid State

```tsx
<Input type="email" placeholder="Email" invalid />
```

### With Custom Styling

```tsx
<Input type="password" placeholder="Password" className="custom-input" />
```

### Controlled Input

```tsx
const [value, setValue] = useState('');

<Input
  type="text"
  value={value}
  onChange={(e) => setValue(e.target.value)}
  placeholder="Controlled input"
/>;
```

## Design Tokens

This component uses the following design tokens:

### Colors

- `--input-color-bg` - Background color
- `--input-color-text` - Text color
- `--input-color-border` - Border color
- `--input-color-focus` - Focus ring color
- `--input-color-invalid` - Invalid state border color

### Sizing

- `--input-size-height` - Input height
- `--input-size-radius` - Border radius

### Spacing

- `--input-space-inline` - Horizontal padding

## Accessibility

### Focus Management

- Clear focus indicators with sufficient contrast
- Focus ring uses design system focus color
- Keyboard navigation supported

### Screen Reader Support

- `aria-invalid` automatically set when `invalid` prop is true
- Compatible with form labels and descriptions
- Supports all standard ARIA attributes

### Validation

- Invalid state communicated through `aria-invalid`
- Works with form validation libraries
- Visual and programmatic feedback for errors

## Related Components

- **Label** - For input labeling
- **TextField** - Compound component combining Input + Label + validation
- **Form** - For form layout and validation

## Implementation Notes

- Uses `forwardRef` to support ref forwarding to the native input
- Maintains full compatibility with HTML input attributes
- Invalid state can be controlled via `invalid` prop or `aria-invalid`
- Styled with CSS modules and design tokens only
