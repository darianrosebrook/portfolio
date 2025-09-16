# SideNavigation (Composer)

Scaffolded component following system standards.

## Usage

```tsx
import SideNavigation from '@/ui/components/SideNavigation';

<SideNavigation>{/* content */}</SideNavigation>;

// Tokens live in SideNavigation.tokens.json and are bootstrapped in SideNavigation.tokens.generated.scss
```

## Files

- index.tsx
- SideNavigation.tsx
- SideNavigation.module.scss
- SideNavigation.tokens.json
- SideNavigation.tokens.generated.scss (placeholder; replaced by tokens build)
- SideNavigationProvider.tsx
- useSideNavigation.ts

## Next Steps

- Fill out tokens JSON and run `npm run tokens:build`
- Implement a11y per COMPONENT_STANDARDS
- Add stories/tests as needed
