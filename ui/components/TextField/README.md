# TextField

A compound component that combines Label, Input, and validation messaging into a complete form field with proper accessibility and error handling.

## Purpose

TextField provides a complete form field solution by composing primitive components (Label + Input) with description and error messaging, handling accessibility associations and validation states automatically.

## Usage

```tsx
import { TextField } from '@/ui/components/TextField';

function Example() {
  return (
    <TextField
      label="Email Address"
      type="email"
      placeholder="Enter your email"
      description="We'll never share your email"
    />
  );
}
```

## Props

| Prop        | Type            | Default | Description                                       |
| ----------- | --------------- | ------- | ------------------------------------------------- |
| label       | React.ReactNode | -       | Label content for the input                       |
| description | React.ReactNode | -       | Help text displayed below the input               |
| error       | React.ReactNode | -       | Error message (automatically sets invalid)        |
| id          | string          | auto    | ID for the input (auto-generated if not provided) |
| className   | string          | ''      | Additional CSS class names for the container      |
| ...rest     | InputProps      | -       | All Input component props are supported           |

Note: When `error` is provided, the `invalid` state is automatically set to `true`.

## Examples

### Basic TextField

```tsx
<TextField label="Full Name" type="text" placeholder="Enter your full name" />
```

### TextField with Description

```tsx
<TextField
  label="Username"
  type="text"
  description="Must be 3-20 characters, letters and numbers only"
  placeholder="Choose a username"
/>
```

### TextField with Error

```tsx
<TextField
  label="Email"
  type="email"
  error="Please enter a valid email address"
  value="invalid-email"
/>
```

### TextField with All Features

```tsx
<TextField
  label="Password"
  type="password"
  description="Must be at least 8 characters"
  error={passwordError}
  required
  minLength={8}
/>
```

### Controlled TextField

```tsx
const [email, setEmail] = useState('');
const [error, setError] = useState('');

<TextField
  label="Email Address"
  type="email"
  value={email}
  onChange={(e) => {
    setEmail(e.target.value);
    setError(''); // Clear error on change
  }}
  error={error}
  required
/>;
```

## Design Tokens

This component inherits tokens from its child components:

### From Label

- `--label-color-text` - Label text color
- `--label-typo-weight` - Label font weight

### From Input

- `--input-color-bg` - Input background
- `--input-color-border` - Input border
- `--input-color-focus` - Focus ring color
- `--input-color-invalid` - Invalid state border

### Component-specific

- Description text uses reduced opacity
- Error text uses semantic danger color

## Accessibility

### Form Association

- Label is properly associated with input via `htmlFor`/`id`
- Description and error are linked via `aria-describedby`
- Error messages use `role="alert"` for immediate announcement

### Screen Reader Support

- Complete field context announced when input receives focus
- Error messages announced immediately when they appear
- Description provides helpful context without being intrusive

### Keyboard Navigation

- Standard form navigation (Tab/Shift+Tab)
- Label click focuses the input
- All standard input keyboard behavior preserved

### Validation States

- `aria-invalid` automatically set when error is present
- Visual and programmatic feedback for validation states
- Error messages are persistent until resolved

## Related Components

- **Input** - The underlying input primitive
- **Label** - The label primitive used internally
- **Form** - For form layout and validation orchestration

## Implementation Notes

- Uses compound composition pattern (primitive + primitive + layout)
- Automatically generates unique IDs when not provided
- Handles `aria-describedby` association automatically
- Error state overrides `invalid` prop (error presence = invalid)
- Forwards ref to the underlying Input component
- Uses CSS Grid for consistent spacing and alignment
