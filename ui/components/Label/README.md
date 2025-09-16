# Label

A primitive label component that provides consistent styling and accessibility for form labels across the design system.

## Purpose

The Label component is a styled wrapper around the native HTML label element, providing design token integration and proper form association while maintaining full compatibility with standard label attributes.

## Usage

```tsx
import { Label } from '@/ui/components/Label';

function Example() {
  return <Label htmlFor="email">Email Address</Label>;
}
```

## Props

| Prop      | Type                                        | Default | Description                                      |
| --------- | ------------------------------------------- | ------- | ------------------------------------------------ |
| htmlFor   | string                                      | -       | Associates the label with a form control         |
| className | string                                      | ''      | Additional CSS class names                       |
| children  | React.ReactNode                             | -       | The label text or content                        |
| ...rest   | React.LabelHTMLAttributes<HTMLLabelElement> | -       | All standard HTML label attributes are supported |

## Examples

### Basic Label

```tsx
<Label htmlFor="username">Username</Label>
```

### Label with Custom Styling

```tsx
<Label htmlFor="password" className="required-field">
  Password *
</Label>
```

### Label with Rich Content

```tsx
<Label htmlFor="terms">
  I agree to the <a href="/terms">Terms of Service</a>
</Label>
```

### Label for Checkbox/Radio

```tsx
<Label htmlFor="newsletter">
  <input type="checkbox" id="newsletter" />
  Subscribe to newsletter
</Label>
```

## Design Tokens

This component uses the following design tokens:

### Typography

- `--label-color-text` - Text color
- `--label-typo-weight` - Font weight
- `--label-typo-lineHeight` - Line height

## Accessibility

### Form Association

- Properly associates with form controls via `htmlFor` attribute
- Clicking the label focuses the associated input
- Screen readers announce the label when the input receives focus

### Screen Reader Support

- Uses semantic `<label>` element
- Supports all standard ARIA attributes
- Works with form validation and error messaging

### Keyboard Navigation

- No special keyboard behavior (labels are not focusable)
- Clicking transfers focus to associated form control

## Related Components

- **Input** - For text input controls
- **TextField** - Compound component that includes Label + Input
- **Checkbox** - For checkbox controls
- **Radio** - For radio button controls

## Implementation Notes

- Uses `forwardRef` to support ref forwarding to the native label
- Maintains full compatibility with HTML label attributes
- Styled with CSS modules and design tokens only
- Inherits font properties from parent by default, with design token overrides
