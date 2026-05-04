# BrandSwitcher

BrandSwitcher exposes controls for selecting the active brand theme, density, and typography settings.

## Usage

```tsx
import { BrandSwitcher } from '@/ui/components/BrandSwitcher';

<BrandSwitcher showDensity showFonts />;
```

## Props

- `showAutoCycle`: Shows controls for cycling through available brands.
- `showDensity`: Shows density controls.
- `showFonts`: Shows heading and body font controls.
- `compact`: Renders swatches only.
- `sticky`: Applies sticky positioning.
- `enableKeyboard`: Enables arrow-key theme switching while the switcher has focus.
- `className`: Additional class name.

## Accessibility

Theme swatches are buttons with `aria-label` and `aria-pressed`. Keyboard shortcuts are scoped to the switcher so page-level arrow key behavior is preserved.

## Design Tokens

Styles should use semantic, component, or local public CSS custom properties for spacing, color, and typography.
