# AlertNotice

A compound component for displaying contextual alerts and notifications with different severity levels and dismissal options.

## Purpose

AlertNotice provides a flexible alert system with composable parts (Container, Title, Body, Icon) that can be used to communicate important information to users with appropriate visual styling and accessibility features.

## Usage

```tsx
import AlertNotice from '@/ui/components/AlertNotice';

function Example() {
  return (
    <AlertNotice.Container status="success" level="page" index={0}>
      <AlertNotice.Icon status="success" />
      <AlertNotice.Title>Success!</AlertNotice.Title>
      <AlertNotice.Body>Your changes have been saved.</AlertNotice.Body>
    </AlertNotice.Container>
  );
}
```

## Props

### Container Props

| Prop        | Type                                         | Default | Description                                    |
| ----------- | -------------------------------------------- | ------- | ---------------------------------------------- |
| status      | 'info' \| 'success' \| 'warning' \| 'danger' | 'info'  | Visual style and semantic meaning of the alert |
| level       | 'page' \| 'section' \| 'inline'              | -       | Layout level affecting size and positioning    |
| index       | number                                       | -       | Unique identifier for dismissal tracking       |
| dismissible | boolean                                      | false   | Whether the alert can be dismissed             |
| onDismiss   | (e: MouseEvent) => void                      | -       | Handler called when dismiss button is clicked  |
| children    | React.ReactNode                              | -       | Alert content                                  |
| ...rest     | React.HTMLAttributes<HTMLDivElement>         | -       | Standard div attributes                        |

### Icon Props

| Prop   | Type   | Default | Description                         |
| ------ | ------ | ------- | ----------------------------------- |
| status | string | -       | Status type to determine which icon |

### Title Props

| Prop     | Type            | Default | Description   |
| -------- | --------------- | ------- | ------------- |
| children | React.ReactNode | -       | Title content |

### Body Props

| Prop     | Type            | Default | Description  |
| -------- | --------------- | ------- | ------------ |
| children | React.ReactNode | -       | Body content |

## Examples

### Basic Alert

```tsx
<AlertNotice.Container status="info" level="page" index={0}>
  <AlertNotice.Icon status="info" />
  <AlertNotice.Body>This is an informational message.</AlertNotice.Body>
</AlertNotice.Container>
```

### Alert with Title

```tsx
<AlertNotice.Container status="warning" level="section" index={1}>
  <AlertNotice.Icon status="warning" />
  <AlertNotice.Title>Warning</AlertNotice.Title>
  <AlertNotice.Body>
    Please review your input before continuing.
  </AlertNotice.Body>
</AlertNotice.Container>
```

### Dismissible Alert

```tsx
<AlertNotice.Container
  status="danger"
  level="inline"
  index={2}
  dismissible
  onDismiss={(e) => console.log('Alert dismissed')}
>
  <AlertNotice.Icon status="danger" />
  <AlertNotice.Title>Error</AlertNotice.Title>
  <AlertNotice.Body>Something went wrong. Please try again.</AlertNotice.Body>
</AlertNotice.Container>
```

### Different Status Types

```tsx
{
  /* Success */
}
<AlertNotice.Container status="success" level="page" index={3}>
  <AlertNotice.Icon status="success" />
  <AlertNotice.Body>Operation completed successfully!</AlertNotice.Body>
</AlertNotice.Container>;

{
  /* Warning */
}
<AlertNotice.Container status="warning" level="page" index={4}>
  <AlertNotice.Icon status="warning" />
  <AlertNotice.Body>This action cannot be undone.</AlertNotice.Body>
</AlertNotice.Container>;

{
  /* Danger */
}
<AlertNotice.Container status="danger" level="page" index={5}>
  <AlertNotice.Icon status="danger" />
  <AlertNotice.Body>
    An error occurred while processing your request.
  </AlertNotice.Body>
</AlertNotice.Container>;
```

## Design Tokens

This component uses design tokens for consistent styling:

### Colors

- Status-specific colors for backgrounds, borders, and text
- Semantic color tokens for different alert levels
- Focus colors for dismiss button

### Spacing

- Consistent padding and margins
- Level-specific spacing adjustments

### Typography

- Title uses heading styles
- Body uses standard text styles

## Accessibility

### Screen Reader Support

- Uses `role="alert"` for immediate announcement
- Icon has `aria-hidden="true"` to avoid redundant announcements
- Dismiss button includes screen reader text

### Keyboard Navigation

- Dismiss button is keyboard accessible
- Focus management follows standard button behavior
- Tab order is logical and predictable

### Color and Contrast

- Status colors meet WCAG contrast requirements
- Information is not conveyed by color alone (icons provide visual cues)

## Related Components

- **Button** - Used for dismiss functionality
- **Icon** - Provides status-specific visual indicators

## Implementation Notes

- Uses compound component pattern for flexible composition
- Each sub-component can be used independently
- Status determines both visual styling and icon selection
- Level affects sizing and layout positioning
- Dismissible alerts require both `dismissible` prop and `onDismiss` handler
- Index prop is used for tracking which alert was dismissed
