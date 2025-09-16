# PerformanceDashboard

A real-time performance monitoring dashboard component that displays Core Web Vitals, cache statistics, and other performance metrics for development and debugging purposes.

## Purpose

PerformanceDashboard provides developers and administrators with real-time insights into application performance, including Core Web Vitals metrics, cache hit rates, and other performance indicators. It's designed for development environments and production debugging.

## Usage

```tsx
import PerformanceDashboard from '@/ui/modules/PerformanceDashboard';

function Example() {
  return <PerformanceDashboard />;
}
```

## Features

### Core Web Vitals

- **FCP (First Contentful Paint)** - Time to first contentful paint
- **LCP (Largest Contentful Paint)** - Time to largest contentful paint
- **CLS (Cumulative Layout Shift)** - Visual stability metric
- **FID (First Input Delay)** - Interactivity metric
- **TBT (Total Blocking Time)** - Main thread blocking time

### Cache Statistics

- Cache hit/miss rates
- Individual cache performance
- Overall cache efficiency
- Real-time cache monitoring

### Performance Monitoring

- Real-time metric updates
- Historical performance tracking
- Performance threshold alerts
- Development-only visibility

## Props

This component doesn't accept props as it's designed to be self-contained and automatically detect its environment.

## Examples

### Basic Usage

```tsx
<PerformanceDashboard />
```

### Conditional Rendering

```tsx
{
  process.env.NODE_ENV === 'development' && <PerformanceDashboard />;
}
```

## Environment Detection

The dashboard automatically shows in:

- Development environment (`NODE_ENV === 'development'`)
- When `localStorage.getItem('showPerformanceDashboard') === 'true'`

## Design Tokens

This component uses design tokens for consistent styling:

### Layout

- Dashboard container sizing and positioning
- Metric card dimensions and spacing
- Grid layout for metrics display

### Colors

- Background and border colors
- Text colors for different metric states
- Alert and warning colors
- Success and error indicators

### Typography

- Metric value font sizing
- Label typography
- Status text styling

### Interactive States

- Hover effects on metric cards
- Focus indicators for interactive elements
- Animation states for updates

## Accessibility

### Screen Reader Support

- Proper semantic structure for metrics
- ARIA labels for performance indicators
- Status announcements for metric changes
- Clear hierarchy for metric information

### Keyboard Navigation

- Tab navigation through metric cards
- Focus indicators on interactive elements
- Keyboard shortcuts for toggling visibility

### Focus Management

- Clear focus indicators
- Logical tab order
- Focus management for dynamic content

## Implementation Notes

- Uses Web Vitals API for Core Web Vitals metrics
- Integrates with browser performance APIs
- Real-time updates with React state management
- Development-only visibility by default
- Production visibility via localStorage flag
- Responsive design for different screen sizes
- Performance optimized with minimal re-renders
- Integrates with design system tokens
- Supports both client and server-side rendering
- Automatic cleanup of performance observers

## Related Components

- **Card** - Used for metric display containers
- **Badge** - Used for status indicators
- **Button** - Used for dashboard controls

## Performance Considerations

- Minimal impact on application performance
- Efficient metric collection and updates
- Automatic cleanup of observers
- Conditional rendering to avoid production overhead
- Optimized re-rendering patterns
