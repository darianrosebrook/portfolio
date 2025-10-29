# Switch

Binary toggle control component with improved API and design token integration.

## Usage

```tsx
import { Switch } from '@/ui/components/Switch';

// Basic switch
<Switch checked={isEnabled} onChange={handleToggle}>
  Enable feature
</Switch>

// Controlled switch
const [checked, setChecked] = useState(false);
<Switch
  checked={checked}
  onChange={(e) => setChecked(e.target.checked)}
>
  Toggle setting
</Switch>

// Disabled switch
<Switch checked={false} disabled>
  Disabled option
</Switch>

// With custom ID and ARIA labels
<Switch
  id="notifications"
  checked={notifications}
  onChange={handleNotifications}
  ariaLabel="Enable email notifications"
>
  Email notifications
</Switch>
```

## Props

| Prop              | Type                       | Default | Description                          |
| ----------------- | -------------------------- | ------- | ------------------------------------ |
| `checked`         | `boolean`                  | -       | Whether switch is checked (required) |
| `onChange`        | `(e: ChangeEvent) => void` | -       | Change handler (required)            |
| `disabled`        | `boolean`                  | `false` | Whether switch is disabled           |
| `children`        | `ReactNode`                | -       | Label content (required)             |
| `className`       | `string`                   | `''`    | Additional CSS classes               |
| `id`              | `string`                   | -       | Unique identifier                    |
| `ariaLabel`       | `string`                   | -       | Accessible label                     |
| `ariaDescription` | `string`                   | -       | Accessible description               |

## Accessibility

- Proper `role="switch"` and ARIA attributes
- Keyboard navigation (Space/Enter to toggle)
- Screen reader support with proper labeling
- Focus management and visual focus indicators

## Design Tokens

### Colors

- `--switch-color-background-off`
- `--switch-color-background-on`
- `--switch-color-thumb`
- `--switch-color-border`

### Sizes

- `--switch-size-width`
- `--switch-size-height`
- `--switch-size-thumb`
- `--switch-size-border-radius`

### Animation

- `--switch-animation-duration`
- `--switch-animation-easing`

## Related Components

- [Checkbox](../Checkbox/) - Multi-select option
- [Radio](../Radio/) - Single-select option
- [ToggleSwitch](../ToggleSwitch/) - Legacy toggle component

