# LogoMarquee

An animated marquee component that displays a continuous horizontal scroll of logo sprites with GSAP-powered animations and customizable speed controls.

## Purpose

LogoMarquee provides an engaging way to showcase partner logos, client logos, or brand assets in a continuous scrolling animation. It uses GSAP for smooth performance and supports customizable animation parameters.

## Usage

```tsx
import LogoMarquee from '@/ui/modules/LogoMarquee';

function Example() {
  return <LogoMarquee />;
}
```

## Props

| Prop      | Type     | Default | Description                         |
| --------- | -------- | ------- | ----------------------------------- |
| className | string   | ''      | Additional CSS class names          |
| speed     | number   | 1       | Animation speed multiplier          |
| repeat    | number   | -1      | Number of repeats (-1 for infinite) |
| paused    | boolean  | false   | Whether animation is paused         |
| logos     | string[] | []      | Custom logo IDs to display          |

## Examples

### Basic LogoMarquee

```tsx
<LogoMarquee />
```

### Custom Speed

```tsx
<LogoMarquee speed={2} />
```

### Paused Animation

```tsx
<LogoMarquee paused={true} />
```

### Custom Styling

```tsx
<LogoMarquee className="custom-marquee" />
```

### Slow Animation

```tsx
<LogoMarquee speed={0.5} />
```

## Features

### Animation

- Smooth horizontal scrolling using GSAP
- Configurable speed and repeat settings
- Pause/resume functionality
- Performance optimized with `will-change`

### Logo Display

- SVG sprite-based logo system
- Hover effects on individual logos
- Responsive sizing
- High-quality vector graphics

### Visual Effects

- Gradient fade-out on edges
- Hover animations for logos
- Smooth transitions
- Perspective transforms

## Design Tokens

This component uses design tokens for consistent styling:

### Layout

- Container height and width
- Box dimensions and spacing
- Logo sizing and positioning

### Colors

- Background and border colors
- Logo fill colors
- Hover state colors
- Gradient cover colors

### Animation

- Transition durations
- Speed multipliers
- Easing functions

### Responsive Design

- Mobile-optimized sizing
- Responsive logo dimensions
- Adaptive spacing

## Accessibility

### Motion Preferences

- Respects `prefers-reduced-motion`
- Disables animations when requested
- Maintains functionality without motion

### Screen Reader Support

- Decorative content (no alt text needed)
- Proper semantic structure
- Focus management

### Keyboard Navigation

- No interactive elements requiring focus
- Purely visual component

## Related Components

- **LogoSprite** - SVG sprite component for logo definitions
- **horizontalLoop** - GSAP utility for marquee animation

## Implementation Notes

- Uses GSAP for smooth animations
- SVG sprite system for efficient logo rendering
- 20 clones for seamless infinite loop
- Perspective transforms for 3D effects
- Responsive design considerations
- Performance optimized with proper cleanup
- Integrates with design system tokens
- Supports custom logo configurations
- Mobile-friendly responsive behavior
