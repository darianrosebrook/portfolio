# {{componentName}} Composer

{{description}}

## Layer Classification

**Layer:** Composer  
**Meta-patterns:** Context provider, slotting & substitution, headless logic

## When to Use

- {{useCases}}

## Key Features

### ✅ Composer Benefits

- **Orchestration:** Coordinates multiple children through provider context
- **Slotting:** Flexible composition with replaceable parts
- **Headless Logic:** Separated state management via `use{{componentName}}` hook
- **Context Coordination:** Provider manages shared state without prop drilling

### 🎯 Eliminated Problems

- **Boolean Prop Explosion:** Reduced to slot-based composition
- **Scattered Logic:** Centralized orchestration through provider pattern
- **Inconsistent Behavior:** Standardized interaction patterns

## Usage

### Basic Usage

```tsx
import { {{componentName}}Provider, {{componentName}} } from '@/ui/components/{{componentName}}';

function BasicExample() {
  return (
    <{{componentName}}Provider>
      <{{componentName}}>
        <{{componentName}}.Trigger>
          Click me
        </{{componentName}}.Trigger>
        <{{componentName}}.Content>
          Content goes here
        </{{componentName}}.Content>
      </{{componentName}}>
    </{{componentName}}Provider>
  );
}
```

### Controlled Usage

```tsx
function ControlledExample() {
  const [isActive, setIsActive] = useState(false);

  return (
    <{{componentName}}Provider
      active={isActive}
      onToggle={setIsActive}
    >
      <{{componentName}}>
        <{{componentName}}.Trigger>
          Toggle
        </{{componentName}}.Trigger>
        <{{componentName}}.Content>
          Controlled content
        </{{componentName}}.Content>
      </{{componentName}}>
    </{{componentName}}Provider>
  );
}
```

### Custom Slots

```tsx
function CustomExample() {
  return (
    <{{componentName}}Provider>
      <{{componentName}}>
        <{{componentName}}.Trigger>
          Custom trigger
        </{{componentName}}.Trigger>
        <{{componentName}}.Content>
          <div>Custom content structure</div>
          <button>Custom action</button>
        </{{componentName}}.Content>
      </{{componentName}}>
    </{{componentName}}Provider>
  );
}
```

## API Reference

### {{componentName}}Provider Props

```tsx
interface Use{{componentName}}Options {
  // State (controlled)
  active?: boolean;                     // Controlled active state
  onToggle?: (active: boolean) => void; // Toggle callback

  // State (uncontrolled)
  defaultActive?: boolean;              // Default active state

  // Configuration
  disabled?: boolean;                   // Disabled state
  id?: string;                          // Custom ID for accessibility

  // Styling
  className?: string;                   // Container CSS class
}
```

### {{componentName}} Props

```tsx
interface {{componentName}}Props {
  children: React.ReactNode;            // Content to orchestrate
  className?: string;                   // Additional CSS classes
  onKeyDown?: (e: KeyboardEvent) => void; // Custom keyboard handler
}
```

### {{componentName}}.Trigger Props

```tsx
interface {{componentName}}TriggerProps {
  children: React.ReactNode;            // Trigger content
  className?: string;                   // Additional CSS classes
}
```

### {{componentName}}.Content Props

```tsx
interface {{componentName}}ContentProps {
  children: React.ReactNode;            // Content
  className?: string;                   // Additional CSS classes
}
```

### use{{componentName}} Hook

```tsx
interface Use{{componentName}}Return {
  isActive: boolean;                    // Current active state
  id: string;                           // Unique ID
  toggle: () => void;                   // Toggle function
  setActive: (active: boolean) => void; // Set active directly
  disabled: boolean;                    // Disabled state
  ariaAttributes: {                     // ARIA attributes
    'aria-expanded': boolean;
    'aria-disabled'?: boolean;
  };
}
```

## Accessibility

- **ARIA Attributes:** Automatic `aria-expanded`, `aria-disabled` management
- **Keyboard Support:** Enter, Space, Escape key handling
- **Focus Management:** Proper focus handling between slots
- **Screen Readers:** Semantic roles and state announcements
- **Group Semantics:** Provider adds appropriate grouping and labeling

## Styling

The component uses data attributes for styling:

```scss
.{{componentNameLower}} {
  // Base styles

  &[data-state="active"] {
    // Active state styles
  }

  &[data-disabled] {
    // Disabled state styles
  }
}

.trigger {
  // Trigger styles
}

.content {
  // Content styles
}
```

## Migration from Prop-Heavy API

### Before (Boolean Props)

```tsx
// ❌ Old API with boolean explosion
<{{componentName}}
  showTrigger={true}
  isOpen={false}
  disabled={false}
  onToggle={handleToggle}
>
  Content
</{{componentName}}>
```

### After (Composer Pattern)

```tsx
// ✅ New composer API
<{{componentName}}Provider
  disabled={false}
  onToggle={handleToggle}
>
  <{{componentName}}>
    <{{componentName}}.Trigger>Trigger</{{componentName}}.Trigger>
    <{{componentName}}.Content>Content</{{componentName}}.Content>
  </{{componentName}}>
</{{componentName}}Provider>
```

## Framework Alignment

This component exemplifies the **Composer** layer:

- ✅ **Orchestration:** Provider coordinates multiple children
- ✅ **Context:** Shared state without prop drilling
- ✅ **Slotting:** Replaceable parts for flexible composition
- ✅ **Headless Logic:** Separated via `use{{componentName}}` hook
- ✅ **No Prop Explosion:** Slots handle specific concerns
- ✅ **Accessibility:** Built-in ARIA and keyboard support

## Examples

See the component showcase for interactive examples of all variants and usage patterns.
