# BrandSwitcher

A control panel for selecting and cycling between brand themes. Renders swatches, auto-cycle controls, density controls, and font family options.

## Usage

```tsx
import { BrandSwitcher } from '@/ui/components/BrandSwitcher';

// Must be rendered inside a BrandProvider
<BrandSwitcher showAutoCycle showDensity showFonts />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showAutoCycle` | `boolean` | `false` | Show auto-cycle interval controls |
| `showDensity` | `boolean` | `false` | Show density (spacing) controls |
| `showFonts` | `boolean` | `false` | Show font family controls |
| `compact` | `boolean` | `false` | Compact mode — swatches only, no labels |
| `sticky` | `boolean` | `false` | Enable sticky positioning |
| `enableKeyboard` | `boolean` | `false` | Arrow-key navigation between brands |
| `className` | `string` | — | Additional CSS class |

## Accessibility

- Keyboard navigation is opt-in via `enableKeyboard`.
- Each swatch is a button with an accessible label describing the brand mood.

## Design Tokens

Styles are defined in `BrandSwitcher.module.scss`. The component reads the active brand from `data-brand` on `document.documentElement`.
