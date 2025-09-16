# Image

A responsive image component with built-in loading states, error handling, and aspect ratio control.

## When to use

- Display images with consistent styling and behavior
- Handle loading states and error scenarios gracefully
- Maintain aspect ratios across different screen sizes
- Provide fallback images for better user experience

## Key ideas

- **Responsive design**: Automatic sizing and aspect ratio handling
- **Loading states**: Built-in placeholder and loading indicators
- **Error handling**: Fallback images and error states
- **Performance**: Lazy loading by default with customizable behavior

## Props

### ImageProps

| Prop              | Type                                                               | Default    | Description                                 |
| ----------------- | ------------------------------------------------------------------ | ---------- | ------------------------------------------- |
| `aspectRatio`     | `'square' \| 'video' \| 'photo' \| 'wide' \| 'portrait' \| number` | -          | Aspect ratio preset                         |
| `objectFit`       | `'cover' \| 'contain' \| 'fill' \| 'scale-down' \| 'none'`         | `'cover'`  | Object fit behavior                         |
| `objectPosition`  | `string`                                                           | `'center'` | Object position                             |
| `loading`         | `'lazy' \| 'eager'`                                                | `'lazy'`   | Loading behavior                            |
| `size`            | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| 'full'`                   | `'full'`   | Size variant                                |
| `radius`          | `'none' \| 'sm' \| 'md' \| 'lg' \| 'full'`                         | `'none'`   | Border radius variant                       |
| `showPlaceholder` | `boolean`                                                          | `true`     | Whether to show a placeholder while loading |
| `fallbackSrc`     | `string`                                                           | -          | Fallback image source                       |
| `onError`         | `(event: React.SyntheticEvent<HTMLImageElement>) => void`          | -          | Callback when image fails to load           |
| `onLoad`          | `(event: React.SyntheticEvent<HTMLImageElement>) => void`          | -          | Callback when image loads successfully      |

Extends `React.ImgHTMLAttributes<HTMLImageElement>`.

### Aspect Ratio Presets

- `square`: 1:1 (1)
- `video`: 16:9 (1.778)
- `photo`: 4:3 (1.333)
- `wide`: 21:9 (2.333)
- `portrait`: 3:4 (0.75)

## Accessibility

- Requires `alt` attribute for screen readers
- Provides proper ARIA labels for error states
- Maintains semantic image structure
- Supports keyboard navigation when interactive

## Examples

### Basic usage

```tsx
import { Image } from '@/ui/components/Image';

// Basic image
<Image
  src="/path/to/image.jpg"
  alt="Description of the image"
/>

// Image with aspect ratio
<Image
  src="/path/to/image.jpg"
  alt="Description"
  aspectRatio="video"
/>
```

### Size variants

```tsx
// Fixed size images
<Image src="/avatar.jpg" alt="User avatar" size="sm" />
<Image src="/profile.jpg" alt="Profile" size="md" />
<Image src="/hero.jpg" alt="Hero image" size="xl" />

// Full width responsive
<Image src="/banner.jpg" alt="Banner" size="full" />
```

### Aspect ratios

```tsx
// Preset aspect ratios
<Image src="/image.jpg" alt="Square" aspectRatio="square" />
<Image src="/video.jpg" alt="Video thumbnail" aspectRatio="video" />
<Image src="/photo.jpg" alt="Photo" aspectRatio="photo" />

// Custom aspect ratio
<Image src="/custom.jpg" alt="Custom" aspectRatio={3/2} />
```

### Object fit and positioning

```tsx
// Cover (default) - fills container, may crop
<Image
  src="/image.jpg"
  alt="Cover image"
  objectFit="cover"
  aspectRatio="square"
/>

// Contain - fits entirely within container
<Image
  src="/image.jpg"
  alt="Contained image"
  objectFit="contain"
  aspectRatio="square"
/>

// Custom positioning
<Image
  src="/image.jpg"
  alt="Positioned image"
  objectFit="cover"
  objectPosition="top center"
/>
```

### Border radius

```tsx
// Rounded corners
<Image src="/image.jpg" alt="Rounded" radius="md" />

// Circular image
<Image
  src="/avatar.jpg"
  alt="Avatar"
  aspectRatio="square"
  radius="full"
/>
```

### Error handling and fallbacks

```tsx
// With fallback image
<Image
  src="/primary-image.jpg"
  fallbackSrc="/fallback-image.jpg"
  alt="Image with fallback"
/>

// With error handling
<Image
  src="/image.jpg"
  alt="Image"
  onError={(e) => console.log('Image failed to load')}
  onLoad={(e) => console.log('Image loaded successfully')}
/>
```

### Loading behavior

```tsx
// Eager loading for above-the-fold images
<Image
  src="/hero-image.jpg"
  alt="Hero"
  loading="eager"
/>

// Lazy loading (default) for below-the-fold
<Image
  src="/gallery-image.jpg"
  alt="Gallery item"
  loading="lazy"
/>

// Without placeholder
<Image
  src="/image.jpg"
  alt="No placeholder"
  showPlaceholder={false}
/>
```

### Gallery and grid layouts

```tsx
// Image gallery
<div className="grid grid-cols-3 gap-4">
  {images.map((image, index) => (
    <Image
      key={index}
      src={image.src}
      alt={image.alt}
      aspectRatio="square"
      objectFit="cover"
      radius="md"
    />
  ))}
</div>

// Card with image
<div className="card">
  <Image
    src="/card-image.jpg"
    alt="Card image"
    aspectRatio="video"
    radius="lg"
  />
  <div className="card-content">
    <h3>Card Title</h3>
    <p>Card description...</p>
  </div>
</div>
```

### Responsive images

```tsx
// Different sources for different screen sizes
<picture>
  <source
    media="(min-width: 768px)"
    srcSet="/large-image.jpg"
  />
  <Image
    src="/small-image.jpg"
    alt="Responsive image"
    size="full"
  />
</picture>

// With responsive aspect ratios
<Image
  src="/image.jpg"
  alt="Responsive"
  aspectRatio="video"
  className="md:aspect-square lg:aspect-video"
/>
```

### Performance optimization

```tsx
// Preload critical images
<Image
  src="/critical-image.jpg"
  alt="Critical"
  loading="eager"
  onLoad={() => console.log('Critical image loaded')}
/>

// Lazy load with intersection observer
<Image
  src="/lazy-image.jpg"
  alt="Lazy loaded"
  loading="lazy"
  style={{ minHeight: '200px' }}
/>
```
