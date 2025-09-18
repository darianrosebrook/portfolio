# Select Composer

A composer for creating flexible select interfaces with provider-based orchestration for coordinating trigger, content, search, and options.

## Layer Classification

**Layer:** Composer  
**Meta-patterns:** Context provider, slotting & substitution, headless logic

## When to Use

- Dropdown selections with search/filtering capability
- Multi-select interfaces
- Custom styled selects that need to match design system
- Complex select behaviors (async loading, grouping, etc.)

## Key Features

### ✅ Composer Benefits

- **Orchestration:** Coordinates trigger, content, search, and options through provider context
- **Slotting:** Flexible composition with replaceable parts (trigger, search, options)
- **Headless Logic:** Separated state management via `useSelect` hook
- **Context Coordination:** Provider manages selection state, keyboard navigation, and filtering

### 🎯 Eliminated Problems

- **Boolean Prop Explosion:** Reduced from 6+ boolean props to slot-based composition
- **Monolithic Component:** Split into composable parts (trigger, content, search, options)
- **Inflexible Styling:** Each slot can be styled independently
- **Complex State Management:** Centralized through provider pattern

## Usage

### Basic Select

```tsx
import { SelectProvider, Select } from '@/ui/components/Select';

const options = [
  { id: '1', title: 'Option 1' },
  { id: '2', title: 'Option 2' },
  { id: '3', title: 'Option 3' },
];

function BasicSelect() {
  return (
    <SelectProvider
      options={options}
      onChange={(selected) => console.log(selected)}
    >
      <Select>
        <Select.Trigger placeholder="Choose an option..." />
        <Select.Content>
          <Select.Options />
        </Select.Content>
      </Select>
    </SelectProvider>
  );
}
```

### Searchable Select

```tsx
function SearchableSelect() {
  return (
    <SelectProvider
      options={options}
      onChange={(selected) => console.log(selected)}
    >
      <Select>
        <Select.Trigger placeholder="Search and select..." clearable />
        <Select.Content>
          <Select.Search placeholder="Type to filter..." />
          <Select.Options />
        </Select.Content>
      </Select>
    </SelectProvider>
  );
}
```

### Multi-Select

```tsx
function MultiSelect() {
  return (
    <SelectProvider
      options={options}
      multiple={true}
      onChange={(selected) => console.log(selected)}
    >
      <Select>
        <Select.Trigger placeholder="Select multiple..." clearable />
        <Select.Content>
          <Select.Search />
          <Select.Options />
        </Select.Content>
      </Select>
    </SelectProvider>
  );
}
```

### Custom Empty State

```tsx
function CustomSelect() {
  return (
    <SelectProvider options={options}>
      <Select>
        <Select.Trigger />
        <Select.Content>
          <Select.Search />
          <Select.Options
            emptyState={
              <div>
                <p>No results found</p>
                <button>Add new option</button>
              </div>
            }
          />
        </Select.Content>
      </Select>
    </SelectProvider>
  );
}
```

## API Reference

### SelectProvider Props

```tsx
interface UseSelectOptions {
  options: Option[]; // Required: available options
  multiple?: boolean; // Allow multiple selections
  value?: string | string[]; // Controlled value
  defaultValue?: string | string[]; // Uncontrolled default
  onChange?: (selected: Option[] | Option | null) => void;
  disabled?: boolean; // Disabled state
  id?: string; // Custom ID for accessibility
  filterFn?: (option: Option, searchTerm: string) => boolean; // Custom filter
}
```

### Select.Trigger Props

```tsx
interface SelectTriggerProps {
  placeholder?: string; // Placeholder text
  className?: string; // Additional CSS classes
  size?: 'sm' | 'md' | 'lg'; // Size variant
  clearable?: boolean; // Show clear button
  loading?: boolean; // Loading state
  name?: string; // Form name
  required?: boolean; // Required field
  onBlur?: FocusEventHandler; // Blur handler
  // ARIA attributes
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-errormessage'?: string;
  'aria-invalid'?: boolean;
}
```

### Select.Content Props

```tsx
interface SelectContentProps {
  children: React.ReactNode; // Content (search, options, etc.)
  className?: string; // Additional CSS classes
  maxHeight?: string; // Max height before scroll
  position?: 'bottom' | 'top' | 'auto'; // Positioning strategy
}
```

### Select.Search Props

```tsx
interface SelectSearchProps {
  placeholder?: string; // Search placeholder
  className?: string; // Additional CSS classes
}
```

### Select.Options Props

```tsx
interface SelectOptionsProps {
  className?: string; // Additional CSS classes
  emptyState?: React.ReactNode; // Custom empty state
}
```

## Accessibility

- **ARIA Attributes:** Automatic `aria-expanded`, `aria-multiselectable`, `role="combobox"`, `role="listbox"`
- **Keyboard Navigation:** Arrow keys, Enter, Space, Escape support
- **Focus Management:** Proper focus handling between trigger and options
- **Screen Readers:** Semantic roles and state announcements
- **Selection State:** `aria-selected` on options

## Styling

The component uses data attributes and CSS classes for styling:

```scss
.trigger {
  // Base trigger styles

  &[data-state='open'] {
    // Open state styles
  }

  &[data-loading] {
    // Loading state styles
  }
}

.content {
  // Dropdown content styles

  &[data-position='top'] {
    // Top positioning styles
  }
}

.option {
  // Base option styles

  &.selected {
    // Selected option styles
  }

  &.active {
    // Active (keyboard focused) option styles
  }

  &[data-disabled] {
    // Disabled option styles
  }
}
```

## Migration from Old API

### Before (Boolean Props)

```tsx
// ❌ Old API with boolean explosion
<Select
  options={options}
  multiselect={true}
  searchable={true}
  clearable={true}
  loading={false}
  disabled={false}
  required={true}
  onChange={handleChange}
/>
```

### After (Composer Pattern)

```tsx
// ✅ New composer API
<SelectProvider
  options={options}
  multiple={true}
  disabled={false}
  onChange={handleChange}
>
  <Select>
    <Select.Trigger clearable={true} loading={false} required={true} />
    <Select.Content>
      <Select.Search />
      <Select.Options />
    </Select.Content>
  </Select>
</SelectProvider>
```

## Framework Alignment

This component exemplifies the **Composer** layer:

- ✅ **Orchestration:** Provider coordinates trigger, content, and options
- ✅ **Context:** Shared state without prop drilling
- ✅ **Slotting:** Replaceable parts (trigger, search, options, empty state)
- ✅ **Headless Logic:** Separated via `useSelect` hook
- ✅ **No Prop Explosion:** Slots handle specific concerns
- ✅ **Accessibility:** Built-in ARIA and keyboard support
- ✅ **Keyboard Navigation:** Arrow keys, selection, escape handling

## Examples

See the component showcase for interactive examples of all variants and usage patterns.
