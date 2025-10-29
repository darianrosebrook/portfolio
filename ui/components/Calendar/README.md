# Calendar

A calendar component for date selection and display. Built as a composer component with state management and accessibility features.

## Usage

```tsx
import { Calendar, CalendarProvider } from '@/ui/components/Calendar';

function Example() {
  return (
    <CalendarProvider>
      <Calendar>{/* Calendar content */}</Calendar>
    </CalendarProvider>
  );
}
```

## Props

### Calendar (Root)

| Prop      | Type           | Default | Description            |
| --------- | -------------- | ------- | ---------------------- |
| className | string         | ''      | Additional CSS classes |
| children  | ReactNode      | -       | Calendar content       |
| ...rest   | HTMLAttributes | -       | Additional div props   |

### CalendarProvider

| Prop     | Type      | Default | Description         |
| -------- | --------- | ------- | ------------------- |
| children | ReactNode | -       | Calendar components |

## Hook API

### useCalendar

Provides state management for calendar open/close functionality.

```tsx
import { useCalendar } from '@/ui/components/Calendar/useCalendar';

function CalendarExample() {
  const { isOpen, open, close, toggle } = useCalendar({
    defaultOpen: false,
  });

  return (
    <div>
      <button onClick={toggle}>{isOpen ? 'Close' : 'Open'} Calendar</button>
      {isOpen && <Calendar />}
    </div>
  );
}
```

#### useCalendar Options

| Prop        | Type    | Default | Description        |
| ----------- | ------- | ------- | ------------------ |
| defaultOpen | boolean | false   | Initial open state |

#### useCalendar Return

| Prop   | Type       | Description                   |
| ------ | ---------- | ----------------------------- |
| isOpen | boolean    | Current open state            |
| open   | () => void | Function to open calendar     |
| close  | () => void | Function to close calendar    |
| toggle | () => void | Function to toggle open state |

## Examples

### Basic Calendar

```tsx
<CalendarProvider>
  <Calendar>
    <div className="calendar-grid">{/* Calendar grid content */}</div>
  </Calendar>
</CalendarProvider>
```

### Calendar with State Management

```tsx
function CalendarWithState() {
  const { isOpen, toggle } = useCalendar();

  return (
    <CalendarProvider>
      <button onClick={toggle}>{isOpen ? 'Hide' : 'Show'} Calendar</button>
      {isOpen && <Calendar>{/* Calendar content */}</Calendar>}
    </CalendarProvider>
  );
}
```

### Styled Calendar

```tsx
<Calendar className="custom-calendar">
  <div className="calendar-header">
    <h3>Select Date</h3>
  </div>
  <div className="calendar-body">{/* Calendar grid */}</div>
</Calendar>
```

## Design Tokens

This component uses the following design tokens:

### Layout & Spacing

- `--calendar-spacing-gap` - Gap between calendar elements
- `--calendar-spacing-padding` - Internal padding
- `--calendar-spacing-margin` - External margins
- `--calendar-grid-gap` - Gap between grid items

### Colors

- `--calendar-color-background` - Background color
- `--calendar-color-foreground` - Text color
- `--calendar-color-border` - Border color
- `--calendar-color-hover` - Hover state color
- `--calendar-color-selected` - Selected date color
- `--calendar-color-disabled` - Disabled date color

### Typography

- `--calendar-font-size` - Font size
- `--calendar-font-weight` - Font weight
- `--calendar-line-height` - Line height

### Animation

- `--calendar-transition-duration` - Animation duration
- `--calendar-transition-easing` - Animation easing

### Border & Shape

- `--calendar-border-radius` - Border radius
- `--calendar-border-width` - Border width

### Sizing

- `--calendar-cell-size` - Individual date cell size
- `--calendar-header-height` - Header height
- `--calendar-min-width` - Minimum calendar width

## Accessibility

### Keyboard Navigation

| Key          | When focus is on | Action   | Result                         | Notes              |
| ------------ | ---------------- | -------- | ------------------------------ | ------------------ |
| Arrow Keys   | Date cells       | navigate | Move between dates             | Up/Down/Left/Right |
| Enter/Space  | Date cells       | activate | Select date                    | Primary activation |
| Tab          | Any              | navigate | Move to next focusable element | Standard tab order |
| Escape       | Any              | dismiss  | Close calendar                 | If applicable      |
| Home         | Date cells       | navigate | Move to first date of week     |                    |
| End          | Date cells       | navigate | Move to last date of week      |                    |
| Page Up/Down | Date cells       | navigate | Move by week                   |                    |
| Ctrl+Home    | Date cells       | navigate | Move to first date of month    |                    |
| Ctrl+End     | Date cells       | navigate | Move to last date of month     |                    |

### Screen Reader Support

- **ARIA Roles**: Uses `grid` role for calendar layout
- **ARIA States**: `aria-selected` for selected dates
- **ARIA Attributes**: Proper labeling and relationships
- **Live Regions**: Date selection announcements
- **Descriptive Labels**: Clear date descriptions

### Focus Management

- Focus moves between date cells
- Focus returns to trigger when calendar closes
- Focus trapping within calendar when open
- Visual focus indicators clearly visible

### States

- **Open**: Calendar is visible and interactive
- **Closed**: Calendar is hidden
- **Selected**: Date is selected
- **Disabled**: Date is not selectable
- **Today**: Current date is highlighted
- **Hover**: Date is being hovered

## Related Components

- **DatePicker** - For date input with calendar popup
- **TimePicker** - For time selection
- **DateRange** - For selecting date ranges
- **Input** - For date input fields
- **Popover** - For calendar positioning

## Implementation Notes

- Built as a **composer** component with proper state management
- Uses React Context for state sharing between components
- Supports both controlled and uncontrolled usage patterns
- Implements keyboard navigation for accessibility
- Provides proper TypeScript types for all props and events
- Extensible architecture for custom calendar implementations
- Follows WAI-ARIA date picker guidelines

## Future Enhancements

- Date range selection support
- Multiple date selection
- Custom date formatting
- Localization support
- Theme customization
- Integration with date libraries (date-fns, dayjs)
