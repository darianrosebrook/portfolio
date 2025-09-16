# Skeleton

Compound placeholder with presets (text, avatar, media, dataviz, actions) and animation variants (shimmer, wipe, pulse).

## Usage

```tsx
import { Skeleton, SkeletonShape } from '@/ui/components/Skeleton';

// Text placeholder
<Skeleton variant="text" lines={{ min: 2, max: 4 }} density="regular" />

// Media card
<Skeleton variant="media" aspectRatio="16/9" animate="shimmer" />

// Custom block with shapes
<Skeleton variant="block" animate="wipe">
  <div style={{ display: 'flex', gap: 12 }}>
    <SkeletonShape kind="circle" width={48} height={48} />
    <div style={{ display: 'grid', gap: 8 }}>
      <SkeletonShape kind="line" width="80%" />
      <SkeletonShape kind="line" width="50%" />
    </div>
  </div>
  </Skeleton>
```

## Props

- `variant`: 'block' | 'text' | 'avatar' | 'media' | 'dataviz' | 'actions'
- `animate`: 'shimmer' | 'wipe' | 'pulse' | 'none'
- `density`: 'compact' | 'regular' | 'spacious'
- `aspectRatio`: string
- `lines`: number | { min: number; max: number }
- `radius`: 'sm' | 'md' | 'lg'
- `decorative`: boolean (default true)
- `children`: ReactNode (slot for custom shapes)

## Accessibility

- Decorative by default (`aria-hidden`). Pair the parent region with `aria-busy="true"` or a single live message.
- Motion preferences: honors `prefers-reduced-motion`; high contrast uses token fallbacks.
