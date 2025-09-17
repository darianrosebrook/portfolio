# Select (Composer)

Unified select with native and combobox modes. Exposes headless state for orchestration and provides a provider for composition.

## Usage

```tsx
import Select, { SelectProvider } from '@/ui/components/Select';
import type { Option } from '@/types/ui';

const options: Option[] = [
  { id: 'red', title: 'Red' },
  { id: 'green', title: 'Green' },
  { id: 'blue', title: 'Blue' },
];

function Example() {
  const [value, setValue] = React.useState<string | null>(null);
  return (
    <Select
      options={options}
      mode="native"
      value={value ?? undefined}
      onChange={(opt) =>
        setValue(Array.isArray(opt) ? (opt[0]?.id ?? null) : (opt?.id ?? null))
      }
      placeholder="Choose a color"
      clearable
    />
  );
}

// Tokens live in Select.tokens.json and are bootstrapped in Select.tokens.generated.scss
```

## Headless Hook

### useSelect(options)

Options:

- `defaultOpen` (boolean, default `false`)
- `value` (string | null): controlled selected key
- `options` (Option[]): available options for `selectedOption` lookup

Returns:

- `isOpen`, `open()`, `close()`, `toggle()`
- `selectedKey`, `setSelectedKey()`
- `selectedOption` (Option | null)

## Accessibility

- Native mode follows platform semantics automatically.
- Combobox mode follows WAI-ARIA Authoring Practices (role="combobox" with `aria-expanded`, listbox popup with role="listbox"/`option`).
- Keyboard: Up/Down to navigate, Enter to commit, Escape to close.

## Design Tokens

- Size, padding, indicator spacing, and colors flow from design tokens in `Select.tokens.json` → `Select.tokens.generated.scss`.
