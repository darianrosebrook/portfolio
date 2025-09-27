# Progress

A progress indicator component that displays the completion status of a task. Supports both determinate and indeterminate progress with linear and circular variants.

## Usage

```tsx
import { Progress } from '@/ui/components/Progress';

function Example() {
  return (
    <Progress
      value={75}
      variant="linear"
      label="Upload progress"
      showValue
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | number | - | Progress value (0-100). If undefined, shows indeterminate progress |
| max | number | 100 | Maximum value |
| variant | 'linear' \| 'circular' | 'linear' | Progress indicator style |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Size variant using design tokens |
| intent | 'info' \| 'success' \| 'warning' \| 'danger' | 'info' | Visual intent/color |
| label | string | - | Label for accessibility |
| showValue | boolean | false | Whether to show percentage text |
| formatValue | (value: number, max: number) => string | - | Custom value formatter |
| className | string | '' | Additional CSS classes |
| ...rest | HTMLAttributes | - | Additional div props |

## Examples

### Basic Progress

```tsx
<Progress value={50} />
```

### Progress with Label

```tsx
<Progress
  value={75}
  label="File upload progress"
  showValue
/>
```

### Indeterminate Progress

```tsx
<Progress label="Loading..." />
```

### Circular Progress

```tsx
<Progress
  value={60}
  variant="circular"
  size="lg"
  showValue
/>
```

### Different Intents

```tsx
<Progress value={25} intent="warning" label="Warning progress" />
<Progress value={90} intent="success" label="Success progress" />
<Progress value={10} intent="danger" label="Error progress" />
```

### Different Sizes

```tsx
<Progress value={50} size="sm" />
<Progress value={50} size="md" />
<Progress value={50} size="lg" />
```

### Custom Value Formatting

```tsx
<Progress
  value={3}
  max={10}
  showValue
  formatValue={(value, max) => `${value}/${max} steps`}
  label="Step progress"
/>
```

### File Upload Progress

```tsx
function FileUpload() {
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  return (
    <div>
      <Progress
        value={isUploading ? progress : undefined}
        label={isUploading ? "Uploading file..." : "Ready to upload"}
        showValue={!isUploading}
        intent={isUploading ? "info" : "success"}
      />
      {progress === 100 && (
        <span>Upload complete!</span>
      )}
    </div>
  );
}
```

### Multi-step Form Progress

```tsx
function FormProgress({ currentStep, totalSteps }) {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <Progress
      value={progress}
      label={`Form progress: step ${currentStep} of ${totalSteps}`}
      showValue
      formatValue={() => `${currentStep}/${totalSteps}`}
      intent="info"
    />
  );
}
```

## Design Tokens

This component uses the following design tokens:

### Layout & Spacing
- `--progress-spacing-gap` - Gap between progress and value text
- `--progress-spacing-padding` - Internal padding
- `--progress-spacing-margin` - External margins

### Colors
- `--progress-color-background` - Track background color
- `--progress-color-foreground` - Fill color
- `--progress-color-text` - Value text color
- `--progress-color-border` - Border color (if applicable)

### Intent Colors
- `--progress-color-info` - Info intent color
- `--progress-color-success` - Success intent color
- `--progress-color-warning` - Warning intent color
- `--progress-color-danger` - Danger intent color

### Typography
- `--progress-font-size` - Value text font size
- `--progress-font-weight` - Value text font weight
- `--progress-line-height` - Value text line height

### Animation
- `--progress-transition-duration` - Animation duration
- `--progress-transition-easing` - Animation easing
- `--progress-indeterminate-duration` - Indeterminate animation duration

### Border & Shape
- `--progress-border-radius` - Border radius
- `--progress-border-width` - Border width

### Sizing
- `--progress-height-sm` - Small progress height
- `--progress-height-md` - Medium progress height
- `--progress-height-lg` - Large progress height
- `--progress-width-sm` - Small progress width
- `--progress-width-md` - Medium progress width
- `--progress-width-lg` - Large progress width

### Circular Variant
- `--progress-circle-radius` - Circular progress radius
- `--progress-circle-stroke-width` - Stroke width
- `--progress-circle-size-sm` - Small circle size
- `--progress-circle-size-md` - Medium circle size
- `--progress-circle-size-lg` - Large circle size

## Accessibility

### Screen Reader Support

- **ARIA Role**: Uses `progressbar` role
- **ARIA States**: `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- **ARIA Attributes**: `aria-label` for description
- **Live Regions**: Progress updates are announced
- **Value Text**: `aria-valuetext` provides human-readable values

### Keyboard Navigation

Progress indicators are typically not interactive, but they support:

| Key | Action | Result | Notes |
|-----|--------|---------|-------|
| Tab | navigate | Move to next focusable element | If progress is focusable |
| Space/Enter | activate | No action | Progress is read-only |

### Focus Management

- Progress indicators are typically not focusable
- Visual focus indicators if made focusable
- Clear visual representation of progress state

### States

- **Determinate**: Shows specific progress value (0-100%)
- **Indeterminate**: Shows ongoing activity without specific value
- **Complete**: Shows 100% progress
- **Error**: Shows error state with appropriate intent

### Best Practices

- Always provide descriptive `label` prop
- Use `showValue` for determinate progress when helpful
- Use indeterminate progress for unknown duration tasks
- Choose appropriate `intent` based on context
- Provide meaningful `formatValue` for non-percentage values

## Related Components

- **Spinner** - For simple loading states
- **Skeleton** - For content loading placeholders
- **Toast** - For progress completion notifications
- **Button** - For progress-related actions

## Implementation Notes

- Built as a **primitive** component with minimal dependencies
- Uses native HTML progress semantics with ARIA enhancements
- Supports both controlled and uncontrolled usage patterns
- Implements smooth animations with CSS transitions
- Provides proper TypeScript types for all props
- Follows WAI-ARIA progress bar pattern guidelines
- Optimized for performance with minimal re-renders

## Browser Support

- **Linear Progress**: All modern browsers
- **Circular Progress**: All modern browsers with SVG support
- **Animations**: Respects `prefers-reduced-motion` setting
- **Accessibility**: Full screen reader support

## Performance Considerations

- Minimal DOM manipulation for smooth animations
- CSS-based animations for better performance
- Efficient re-rendering with proper memoization
- Lightweight SVG for circular variant



