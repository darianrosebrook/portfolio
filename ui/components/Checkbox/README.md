# Checkbox Primitive

A boring, stable, minimal checkbox component for binary state control.

## Layer Classification

**Layer:** Primitive  
**Characteristics:** Boring, stable, minimal props, design tokens only

## When to Use

- Binary state controls (checked/unchecked)
- Form inputs requiring checkbox behavior
- Building blocks for higher-level components (Field composer, forms)
- List selections with indeterminate states

## Key Features

### ✅ Primitive Benefits

- **Boring & Stable:** Minimal API that rarely changes
- **Token-Driven:** All styling uses design tokens for consistency
- **Accessible:** Built-in ARIA support and keyboard interaction
- **Indeterminate Support:** Handles partial selection states

### 🎯 What This Component Does NOT Do

- **No Labels:** Labels belong to Field composer or external components
- **No Validation:** Validation logic belongs to higher layers
- **No Complex State:** Only handles checked/unchecked/indeterminate
- **No Layout:** Positioning and spacing handled by parent components

## Usage

### Basic Checkbox

```tsx
import { Checkbox } from '@/ui/components/Checkbox';

function BasicExample() {
  const [checked, setChecked] = useState(false);

  return (
    <Checkbox
      checked={checked}
      onChange={(e) => setChecked(e.target.checked)}
    />
  );
}
```

### Uncontrolled Checkbox

```tsx
function UncontrolledExample() {
  return (
    <Checkbox
      defaultChecked={true}
      onChange={(e) => console.log('Changed:', e.target.checked)}
    />
  );
}
```

### Size Variants

```tsx
function SizeExample() {
  return (
    <>
      <Checkbox size="sm" />
      <Checkbox size="md" /> {/* default */}
      <Checkbox size="lg" />
    </>
  );
}
```

### Indeterminate State

```tsx
function IndeterminateExample() {
  const [items, setItems] = useState([
    { id: 1, checked: true },
    { id: 2, checked: false },
    { id: 3, checked: true },
  ]);

  const checkedCount = items.filter((item) => item.checked).length;
  const isIndeterminate = checkedCount > 0 && checkedCount < items.length;
  const isAllChecked = checkedCount === items.length;

  return (
    <Checkbox
      checked={isAllChecked}
      indeterminate={isIndeterminate}
      onChange={(e) => {
        const newChecked = e.target.checked;
        setItems(items.map((item) => ({ ...item, checked: newChecked })));
      }}
    />
  );
}
```

### Disabled State

```tsx
function DisabledExample() {
  return (
    <>
      <Checkbox disabled />
      <Checkbox disabled checked />
      <Checkbox disabled indeterminate />
    </>
  );
}
```

## API Reference

```tsx
interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  // Size using design tokens
  size?: 'sm' | 'md' | 'lg'; // Default: 'md'

  // State (controlled)
  checked?: boolean; // Controlled checked state

  // State (uncontrolled)
  defaultChecked?: boolean; // Default checked state

  // Special states
  indeterminate?: boolean; // Partial selection state
  disabled?: boolean; // Disabled state

  // Event handlers
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;

  // Styling
  className?: string; // Additional CSS classes

  // Accessibility
  id?: string; // Custom ID (auto-generated if not provided)

  // All other standard input props are supported
}
```

## Accessibility

- **ARIA Support:** Proper `aria-checked` handling including "mixed" for indeterminate
- **Keyboard Support:** Standard checkbox keyboard interaction (Space to toggle)
- **Focus Management:** Visible focus indicators with proper outline
- **Screen Readers:** Semantic checkbox input with proper state announcements

## Styling

The component uses design tokens for all styling:

```scss
// Size tokens
--size-4, --size-5, --size-6  // Checkbox dimensions
--size-3, --size-4, --size-5  // Icon dimensions

// Color tokens
--color-border-default         // Default border
--color-border-hover          // Hover border
--color-border-focus          // Focus outline
--color-background-surface    // Default background
--color-background-brand      // Checked background
--color-background-brandHover // Checked hover background
--color-foreground-onBrand    // Check icon color

// Radius tokens
--radius-sm                   // Border radius
```

### Custom Styling

```scss
.myCustomCheckbox {
  // Override specific properties while maintaining token usage
  .checkboxIndicator {
    border-radius: var(--radius-md); // Different radius
  }
}
```

## Framework Alignment

This component exemplifies the **Primitive** layer:

- ✅ **Irreducible:** Cannot be broken down further without losing function
- ✅ **Boring:** Stable API that rarely changes
- ✅ **Token-Driven:** All styling uses design system tokens
- ✅ **Accessible:** Built-in ARIA and keyboard support
- ✅ **Minimal Props:** Only essential checkbox functionality
- ✅ **No Complex Logic:** No validation, labels, or orchestration

## Integration with Higher Layers

### With Field Composer

```tsx
import { Field } from '@/ui/components/Field';
import { Checkbox } from '@/ui/components/Checkbox';

<Field>
  <Field.Label>Accept terms</Field.Label>
  <Checkbox />
  <Field.Error />
</Field>;
```

### With Custom Labels

```tsx
<label>
  <Checkbox />
  <span>I agree to the terms</span>
</label>
```

## Examples

See the component showcase for interactive examples of all variants and states.
