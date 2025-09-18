/**
 * Select Composer - Provider-based orchestration exports
 *
 * Layer: Composer
 * Meta-patterns: Context provider, slotting & substitution, headless logic
 */

// Main composer components
export {
  Select as default,
  Select,
  SelectTrigger,
  SelectContent,
  SelectSearch,
  SelectOptions,
} from './Select';
export type {
  SelectProps,
  SelectTriggerProps,
  SelectContentProps,
  SelectSearchProps,
  SelectOptionsProps,
} from './Select';

// Provider for orchestration
export { SelectProvider, useSelectContext } from './SelectProvider';
export type { SelectContextValue } from './SelectProvider';

// Headless logic hook
export { useSelect } from './useSelect';
export type { UseSelectOptions, UseSelectReturn } from './useSelect';

// Legacy exports (keep for now, but deprecated)
export { default as Combobox } from './Combobox';
export type { ComboboxProps } from './Combobox';
