# Calendar

Date picker and calendar display component.

## Usage

```tsx
import { Calendar } from '@/ui/components/Calendar';

// Basic calendar
<Calendar />

// With custom styling
<Calendar className="my-calendar" />
```

## Props

| Prop        | Type              | Default | Description            |
| ----------- | ----------------- | ------- | ---------------------- |
| `className` | `string`          | `''`    | Additional CSS classes |
| `children`  | `React.ReactNode` | -       | Calendar content       |

All standard `div` HTML attributes are also supported.

## Accessibility

- Keyboard navigation support
- Screen reader announcements
- Focus management

## Design Tokens

### Colors

- `--calendar-color-background`
- `--calendar-color-foreground`
- `--calendar-color-border`

### Layout

- `--calendar-size-padding`
- `--calendar-size-border-radius`

## Related Components

- [DatePicker](../DatePicker/) - Date input with calendar dropdown
- [TimePicker](../TimePicker/) - Time selection component

