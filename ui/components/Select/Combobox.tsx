/**
 * @deprecated Combobox has been consolidated into Select component.
 * Use Select with mode="combobox" instead.
 * This alias will be removed in a future version.
 */
import React from 'react';
import Select, { SelectProps } from './Select';
import { Option } from '@/types/ui';

export interface ComboboxProps
  extends Omit<SelectProps, 'mode' | 'multiselect' | 'onChange'> {
  /**
   * Change handler for combobox (single selection only)
   */
  onChange: (option: Option | null) => void;
}

export const Combobox: React.FC<ComboboxProps> = (props) => {
  return (
    <Select
      mode="combobox"
      searchable={true}
      {...(props as unknown as SelectProps)}
    />
  );
};

export default Combobox;
