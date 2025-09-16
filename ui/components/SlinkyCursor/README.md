# SlinkyCursor

An animated cursor component that creates a slinky-like trailing effect following the mouse pointer. Provides engaging visual feedback and enhances the interactive experience.

## Usage

```tsx
import { SlinkyCursor } from '@/ui/components/SlinkyCursor';

function App() {
  return (
    <>
      {/* Your app content */}
      <SlinkyCursor />
    </>
  );
}
```

## Props

SlinkyCursor doesn't accept any props - it automatically tracks mouse movement and scroll position.

## Examples

### Basic Usage

```tsx
// Simply add to your app layout
<SlinkyCursor />
```

## Design Tokens

This component uses the following design tokens:

- `--color-cursor-primary` - Default cursor color
- `--color-cursor-active` - Active state cursor color
- `--transition-duration-fast` - Animation timing

## Behavior

### Mouse Tracking

- Smoothly follows mouse movement with configurable laziness
- Responds to mouse press states with visual feedback
- Accounts for page scroll position

### Animation Settings

- **Size**: 40px (default), 32px (when pressed)
- **Laziness**: 4 (smoothing factor)
- **Stiffness**: 2 (stretch resistance)

### Visual Effects

- Stretches based on movement speed and direction
- Rotates to follow movement direction
- Changes size when mouse is pressed
- Smooth interpolation between states

## Accessibility

### Reduced Motion

- Respects `prefers-reduced-motion` setting
- Disables animations for users who prefer reduced motion
- Maintains functionality without motion effects

### Screen Readers

- Uses `pointer-events: none` to avoid interfering with interactions
- Doesn't impact keyboard navigation or assistive technologies
- Purely decorative enhancement

## Technical Details

### Performance

- Uses `requestAnimationFrame` for smooth 60fps animation
- Efficiently tracks position with refs to avoid re-renders
- Lazy evaluation of movement calculations

### Context Integration

- Integrates with `InteractionContext` for mouse and scroll tracking
- Automatically handles component lifecycle and cleanup
- No manual event listener management required

## Related Components

- **InteractionContext** - Provides mouse tracking data
- **GooeyHighlight** - Another animated interaction component
