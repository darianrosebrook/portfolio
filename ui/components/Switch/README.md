# Switch

A binary toggle control component for on/off states. Provides an accessible alternative to checkboxes for simple binary choices.

## Usage

```tsx
import { Switch } from '@/ui/components/Switch';

function Example() {
  const [enabled, setEnabled] = useState(false);

  return (
    <Switch
      checked={enabled}
      onChange={(e) => setEnabled(e.target.checked)}
      ariaLabel="Enable notifications"
    >
      Enable notifications
    </Switch>
  );
}
```

## Props

### Switch

| Prop            | Type                     | Default | Description                                        |
| --------------- | ------------------------ | ------- | -------------------------------------------------- |
| checked         | boolean                  | -       | **Required.** Whether the switch is on/off         |
| onChange        | (e: ChangeEvent) => void | -       | **Required.** Change handler                       |
| children        | ReactNode                | -       | **Required.** Label content                        |
| disabled        | boolean                  | false   | Whether the switch is disabled                     |
| size            | 'sm' \| 'md' \| 'lg'     | 'md'    | Size variant using design tokens                   |
| id              | string                   | -       | Unique identifier (auto-generated if not provided) |
| ariaLabel       | string                   | -       | Accessible label (uses children if not provided)   |
| ariaDescription | string                   | -       | Accessible description                             |
| className       | string                   | ''      | Additional CSS classes                             |
| ...rest         | InputHTMLAttributes      | -       | Additional input props                             |

### SwitchGroup

| Prop        | Type                       | Default    | Description                     |
| ----------- | -------------------------- | ---------- | ------------------------------- |
| children    | ReactNode                  | -          | **Required.** Switch components |
| orientation | 'vertical' \| 'horizontal' | 'vertical' | Layout orientation              |
| className   | string                     | ''         | Additional CSS classes          |

## Examples

### Basic Switch

```tsx
function BasicSwitch() {
  const [notifications, setNotifications] = useState(false);

  return (
    <Switch
      checked={notifications}
      onChange={(e) => setNotifications(e.target.checked)}
    >
      Email notifications
    </Switch>
  );
}
```

### Switch with Custom Label

```tsx
<Switch
  checked={darkMode}
  onChange={(e) => setDarkMode(e.target.checked)}
  ariaLabel="Toggle dark mode"
>
  <span>🌙</span> Dark mode
</Switch>
```

### Disabled Switch

```tsx
<Switch
  checked={false}
  onChange={() => {}}
  disabled
  ariaLabel="Feature coming soon"
>
  Advanced settings
</Switch>
```

### Different Sizes

```tsx
<Switch size="sm" checked={value} onChange={handleChange}>
  Small switch
</Switch>

<Switch size="md" checked={value} onChange={handleChange}>
  Medium switch
</Switch>

<Switch size="lg" checked={value} onChange={handleChange}>
  Large switch
</Switch>
```

### Switch with Description

```tsx
<Switch
  checked={analytics}
  onChange={(e) => setAnalytics(e.target.checked)}
  ariaDescription="Help us improve the app by sharing usage data"
>
  Analytics tracking
</Switch>
```

### Switch Group

```tsx
import { Switch, SwitchGroup } from '@/ui/components/Switch';

function Settings() {
  return (
    <SwitchGroup orientation="vertical">
      <Switch checked={notifications} onChange={setNotifications}>
        Notifications
      </Switch>
      <Switch checked={darkMode} onChange={setDarkMode}>
        Dark mode
      </Switch>
      <Switch checked={analytics} onChange={setAnalytics}>
        Analytics
      </Switch>
    </SwitchGroup>
  );
}
```

### Horizontal Switch Group

```tsx
<SwitchGroup orientation="horizontal">
  <Switch checked={option1} onChange={setOption1}>
    Option 1
  </Switch>
  <Switch checked={option2} onChange={setOption2}>
    Option 2
  </Switch>
</SwitchGroup>
```

## Design Tokens

This component uses the following design tokens:

### Layout & Spacing

- `--switch-spacing-gap` - Gap between switch and label
- `--switch-spacing-padding` - Internal padding
- `--switch-spacing-margin` - External margins

### Colors

- `--switch-color-background` - Background color
- `--switch-color-foreground` - Text color
- `--switch-color-border` - Border color
- `--switch-color-hover` - Hover state color
- `--switch-color-active` - Active/checked state color
- `--switch-color-disabled` - Disabled state color

### Typography

- `--switch-font-size` - Font size
- `--switch-font-weight` - Font weight
- `--switch-line-height` - Line height

### Animation

- `--switch-transition-duration` - Animation duration
- `--switch-transition-easing` - Animation easing
- `--switch-thumb-transition` - Thumb movement animation

### Border & Shape

- `--switch-border-radius` - Border radius
- `--switch-border-width` - Border width
- `--switch-thumb-radius` - Thumb border radius

### Sizing

- `--switch-width-sm` - Small switch width
- `--switch-width-md` - Medium switch width
- `--switch-width-lg` - Large switch width
- `--switch-height-sm` - Small switch height
- `--switch-height-md` - Medium switch height
- `--switch-height-lg` - Large switch height

## Accessibility

### Keyboard Navigation

| Key   | When focus is on | Action   | Result                         | Notes                  |
| ----- | ---------------- | -------- | ------------------------------ | ---------------------- |
| Space | Switch           | activate | Toggles switch state           | Primary activation     |
| Enter | Switch           | activate | Toggles switch state           | Alternative activation |
| Tab   | Switch           | navigate | Move to next focusable element | Standard tab order     |

### Screen Reader Support

- **ARIA Roles**: Uses native checkbox semantics
- **ARIA States**: `aria-checked` indicates on/off state
- **ARIA Attributes**: Proper labeling and descriptions
- **Live Regions**: State changes are announced
- **Descriptive Labels**: Clear on/off descriptions

### Focus Management

- Focus moves to switch input element
- Visual focus indicators clearly visible
- Focus returns to switch after interaction
- Keyboard navigation works without mouse

### States

- **On**: `aria-checked="true"`, visually on state
- **Off**: `aria-checked="false"`, visually off state
- **Disabled**: `aria-disabled="true"`, non-interactive
- **Hover**: Visual hover state
- **Focus**: Clear focus indicators

### Best Practices

- Always provide clear, descriptive labels
- Use `ariaLabel` for complex labels or when children aren't descriptive
- Use `ariaDescription` for additional context
- Group related switches with `SwitchGroup`
- Ensure sufficient color contrast for all states

## Related Components

- **Checkbox** - For multiple selections or indeterminate states
- **ToggleSwitch** - Legacy toggle component (being replaced by Switch)
- **RadioGroup** - For single selection from multiple options
- **Button** - For actions rather than state toggles

## Implementation Notes

- Built as a **primitive** component with minimal dependencies
- Uses native checkbox input for proper semantics
- Supports both controlled and uncontrolled usage patterns
- Implements smooth animations with CSS transitions
- Provides proper TypeScript types for all props
- Auto-generates unique IDs when not provided
- Follows WAI-ARIA switch pattern guidelines

## Migration from ToggleSwitch

If migrating from the legacy `ToggleSwitch` component:

```tsx
// Before (ToggleSwitch)
<ToggleSwitch
  checked={value}
  onChange={handleChange}
  label="Enable feature"
  disabled={false}
/>

// After (Switch)
<Switch
  checked={value}
  onChange={handleChange}
  disabled={false}
>
  Enable feature
</Switch>
```

Key differences:

- `label` prop becomes `children`
- Improved accessibility with native semantics
- Better design token integration
- Consistent sizing with other form controls
