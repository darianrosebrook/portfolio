# Details Composer

A composer for creating collapsible content sections with provider-based orchestration for coordinating multiple details in groups.

## Layer Classification

**Layer:** Composer  
**Meta-patterns:** Context provider, slotting & substitution, headless logic

## When to Use

- Collapsible content sections (FAQ, case studies, documentation)
- Accordion-style interfaces where only one item should be open
- Grouped details where coordination is needed between items

## Key Features

### ✅ Composer Benefits

- **Orchestration:** Coordinates multiple details through provider context
- **Slotting:** Flexible composition with variant slots and icon positioning
- **Headless Logic:** Separated state management via `useDetails` hook
- **Context Coordination:** Optional provider for group behavior (accordion mode)

### 🎯 Eliminated Problems

- **Boolean Prop Explosion:** Reduced from 6 boolean props to variant-based API
- **Scattered Logic:** Centralized orchestration through provider pattern
- **Inconsistent Behavior:** Standardized interaction patterns across all instances

## Usage

### Basic Details (Standalone)

```tsx
import { Details } from '@/ui/components/Details';

function BasicExample() {
  return (
    <Details summary="Click to expand" defaultOpen={false}>
      <p>This content is collapsible.</p>
    </Details>
  );
}
```

### Coordinated Group (Accordion)

```tsx
import { Details, DetailsProvider } from '@/ui/components/Details';

function AccordionExample() {
  return (
    <DetailsProvider allowMultiple={false}>
      <Details summary="Section 1">
        <p>Only one section can be open at a time.</p>
      </Details>
      <Details summary="Section 2">
        <p>Opening this closes the others.</p>
      </Details>
      <Details summary="Section 3">
        <p>This creates accordion behavior.</p>
      </Details>
    </DetailsProvider>
  );
}
```

### Variant Slots

```tsx
import {
  Details,
  DetailsInline,
  DetailsCompact,
} from '@/ui/components/Details';

function VariantExample() {
  return (
    <>
      {/* Default variant */}
      <Details summary="Standard details" icon="left">
        <p>Standard appearance with left icon.</p>
      </Details>

      {/* Inline variant */}
      <DetailsInline summary="Inline details">
        <p>Compact inline styling.</p>
      </DetailsInline>

      {/* Compact variant (no icon) */}
      <DetailsCompact summary="Minimal details">
        <p>Minimal styling without icon.</p>
      </DetailsCompact>
    </>
  );
}
```

## API Reference

### Details Props

```tsx
interface DetailsProps {
  // Content
  summary: string; // Required: toggle button text
  children: React.ReactNode; // Required: collapsible content

  // State (from useDetails)
  open?: boolean; // Controlled open state
  defaultOpen?: boolean; // Uncontrolled default state
  onToggle?: (open: boolean) => void; // Toggle callback
  disabled?: boolean; // Disabled state
  id?: string; // Custom ID for accessibility

  // Presentation
  variant?: 'default' | 'inline' | 'compact'; // Visual style
  icon?: 'left' | 'right' | 'none'; // Icon configuration
  className?: string; // Additional CSS classes
  onKeyDown?: (e: KeyboardEvent) => void; // Custom keyboard handler
}
```

### DetailsProvider Props

```tsx
interface DetailsProviderProps {
  children: React.ReactNode;
  allowMultiple?: boolean; // Allow multiple open (default: false)
  onToggle?: (
    // Group toggle callback
    id: string,
    isOpen: boolean,
    openDetails: Set<string>
  ) => void;
  className?: string; // Container CSS class
}
```

### useDetails Hook

```tsx
interface UseDetailsOptions {
  open?: boolean;
  defaultOpen?: boolean;
  onToggle?: (open: boolean) => void;
  disabled?: boolean;
  id?: string;
}

interface UseDetailsReturn {
  isOpen: boolean;
  id: string;
  toggle: () => void;
  setOpen: (open: boolean) => void;
  disabled: boolean;
  ariaAttributes: {
    'aria-expanded': boolean;
    'aria-disabled'?: boolean;
  };
}
```

## Accessibility

- **ARIA Attributes:** Automatic `aria-expanded` and `aria-disabled` management
- **Keyboard Support:** Enter and Space keys toggle state
- **Focus Management:** Proper focus handling in group contexts
- **Screen Readers:** Semantic `<details>` and `<summary>` elements
- **Group Semantics:** Provider adds `role="group"` with appropriate labeling

## Styling

The component uses data attributes for styling variants:

```scss
.details {
  // Base styles

  &[data-variant='inline'] {
    // Inline variant styles
  }

  &[data-variant='compact'] {
    // Compact variant styles
  }

  &[data-icon='none'] {
    // No icon styles
  }

  &[data-state='open'] {
    // Open state styles
  }
}
```

## Migration from Old API

### Before (Boolean Props)

```tsx
// ❌ Old API with boolean explosion
<Details
  inline={true}
  showIcon={false}
  multipleOpen={true}
  defaultOpen={false}
  disabled={false}
  iconPosition="right"
  summary="Old API"
>
  Content
</Details>
```

### After (Composer Pattern)

```tsx
// ✅ New composer API
<DetailsProvider allowMultiple={true}>
  <Details
    variant="inline"
    icon="right"
    defaultOpen={false}
    disabled={false}
    summary="New API"
  >
    Content
  </Details>
</DetailsProvider>
```

## Framework Alignment

This component exemplifies the **Composer** layer:

- ✅ **Orchestration:** Provider coordinates multiple children
- ✅ **Context:** Shared state without prop drilling
- ✅ **Slotting:** Variant components for common patterns
- ✅ **Headless Logic:** Separated via `useDetails` hook
- ✅ **No Prop Explosion:** Variants instead of boolean flags
- ✅ **Accessibility:** Built-in ARIA and keyboard support

## Examples

See the component showcase for interactive examples of all variants and usage patterns.
