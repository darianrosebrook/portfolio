/**
 * @deprecated Combobox has been consolidated into Select component.
 * Use SelectProvider with SelectSearch instead.
 * This alias will be removed in a future version.
 */
import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectSearch,
  SelectOptions,
} from './Select';
import { SelectProvider } from './SelectProvider';
import { Option } from '@/types/ui';

export interface ComboboxProps {
  /** Options to display */
  options: Option[];
  /** Current value */
  value?: Option | null;
  /** Change handler for combobox (single selection only) */
  onChange: (option: Option | null) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Additional CSS classes */
  className?: string;
  /** Disabled state */
  disabled?: boolean;
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onChange,
  placeholder,
  className,
  disabled,
}) => {
  const handleChange = (selected: Option[] | Option | null) => {
    // For combobox (single selection), extract the single option
    if (Array.isArray(selected)) {
      onChange(selected[0] || null);
    } else {
      onChange(selected);
    }
  };

  // Convert Option to string ID for SelectProvider
  const valueId = value?.id;

  return (
    <SelectProvider options={options} value={valueId} onChange={handleChange}>
      <Select>
        <SelectTrigger placeholder={placeholder} className={className} />
        <SelectContent>
          <SelectSearch />
          <SelectOptions />
        </SelectContent>
      </Select>
    </SelectProvider>
  );
};

export default Combobox;
