# ToggleSwitch

A form control component that allows users to toggle between two states (on/off) with a sliding switch interface and proper accessibility support.

## Purpose

ToggleSwitch provides an intuitive binary choice interface, commonly used for settings, preferences, and feature toggles. It offers clear visual feedback and maintains accessibility standards for keyboard and screen reader users.

## Usage

```tsx
import ToggleSwitch from '@/ui/components/ToggleSwitch';

function Example() {
  const [enabled, setEnabled] = useState(false);

  return (
    <ToggleSwitch
      checked={enabled}
      onChange={setEnabled}
      label="Enable notifications"
    />
  );
}
```

## Props

| Prop        | Type                           | Default  | Description                       |
| ----------- | ------------------------------ | -------- | --------------------------------- |
| checked     | boolean                        | false    | Current toggle state              |
| onChange    | (checked: boolean) => void     | -        | Handler called when state changes |
| disabled    | boolean                        | false    | Whether the toggle is disabled    |
| label       | string                         | -        | Accessible label for the toggle   |
| description | string                         | -        | Additional description text       |
| size        | 'small' \| 'medium' \| 'large' | 'medium' | Size variant of the toggle        |
| className   | string                         | ''       | Additional CSS class names        |
| id          | string                         | auto     | ID for the input element          |

## Examples

### Basic Toggle

```tsx
<ToggleSwitch checked={darkMode} onChange={setDarkMode} label="Dark mode" />
```

### With Description

```tsx
<ToggleSwitch
  checked={notifications}
  onChange={setNotifications}
  label="Push notifications"
  description="Receive notifications about important updates"
/>
```

### Different Sizes

```tsx
<ToggleSwitch size="small" checked={false} onChange={() => {}} label="Small" />
<ToggleSwitch size="medium" checked={true} onChange={() => {}} label="Medium" />
<ToggleSwitch size="large" checked={false} onChange={() => {}} label="Large" />
```

### Disabled State

```tsx
<ToggleSwitch
  checked={true}
  onChange={() => {}}
  disabled
  label="Disabled toggle"
  description="This setting cannot be changed"
/>
```

## Design Tokens

This component uses design tokens for consistent styling:

### Colors

- Track colors for on/off states
- Thumb (handle) colors
- Focus ring colors
- Disabled state colors

### Sizing

- Track width and height for different sizes
- Thumb dimensions and positioning
- Focus ring thickness

### Animation

- Smooth transition timing
- Easing functions for natural motion
- Reduced motion support

## Accessibility

### Keyboard Navigation

- Space key toggles the switch
- Enter key toggles the switch
- Tab navigation to/from the control
- Clear focus indicators

### Screen Reader Support

- Uses proper `role="switch"` semantics
- `aria-checked` reflects current state
- `aria-labelledby` for associated labels
- `aria-describedby` for descriptions

### Visual Indicators

- Clear on/off visual states
- High contrast mode support
- Focus indicators meet WCAG requirements
- Motion respects `prefers-reduced-motion`

### States Communicated

- Current checked/unchecked state
- Disabled state
- Focus state
- Hover state (when not disabled)

## Related Components

- **Checkbox** - For multi-select scenarios
- **Radio** - For exclusive choice scenarios
- **Button** - For action-based toggles

## Implementation Notes

- Uses native input with custom styling
- Maintains form integration capabilities
- Supports controlled and uncontrolled modes
- Smooth animations with performance optimization
- Proper event handling for mouse and keyboard
- Consistent with system toggle conventions
- Works with form libraries and validation
- Responsive design considerations built-in
