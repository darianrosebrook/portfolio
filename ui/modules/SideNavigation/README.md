# SideNavigation (Composer)

Headless navigation container that orchestrates expanded/collapsed state and provides context for nested navigation items.

## Usage

```tsx
import SideNavigation, {
  SideNavigationProvider,
} from '@/ui/components/SideNavigation';
import { useSideNavigationContext } from '@/ui/components/SideNavigation/SideNavigationProvider';

function NavToggle() {
  const { isExpanded, toggle } = useSideNavigationContext();
  return (
    <button type="button" onClick={toggle} aria-pressed={isExpanded}>
      {isExpanded ? 'Collapse' : 'Expand'}
    </button>
  );
}

<SideNavigationProvider storageKey="app-sidenav" defaultExpanded>
  <SideNavigation>
    <NavToggle />
    {/* nav content */}
  </SideNavigation>
  {/* children can read context for responsive layouts */}
</SideNavigationProvider>;

// Tokens live in SideNavigation.tokens.json and are bootstrapped in SideNavigation.tokens.generated.scss
```

## API

### useSideNavigation(options)

- `defaultExpanded` (boolean, default `false`): initial expanded state.
- `storageKey` (string, optional): persist expanded state to `localStorage`.

Returns:

- `isExpanded` (boolean)
- `expand()` / `collapse()` / `toggle()`

### SideNavigationProvider props

- Inherits `useSideNavigation` options. Provides the same return values via context.

## Accessibility

- Toggle buttons should set `aria-pressed` reflecting `isExpanded`.
- Expose collapsed state via data-attributes on the container if styling requires: `data-state="expanded|collapsed"`.
- Keyboard: Enter/Space to toggle; Escape can be wired in consuming items to collapse if desired.

## Design Tokens

- Background, border, elevation, and padding map to design tokens defined in `SideNavigation.tokens.json` → `SideNavigation.tokens.generated.scss`.

## Related

- Consider pairing with `Disclosure`/`Accordion` patterns for nested groups.
