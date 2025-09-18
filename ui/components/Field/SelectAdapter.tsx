import React from 'react';
import {
  Select,
  SelectProvider,
  SelectTrigger,
  SelectContent,
  SelectOptions,
} from '@/ui/components/Select';
import type { Option } from '@/types/ui';
import { useFieldControl } from './useFieldControl';

export interface SelectAdapterProps {
  options: Option[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function SelectAdapter({
  options,
  placeholder,
  className,
  disabled,
}: SelectAdapterProps) {
  const { controlProps, field } = useFieldControl<HTMLSelectElement>();

  return (
    <SelectProvider
      options={options}
      value={(field.value as string) ?? ''}
      onChange={(opt) =>
        field.setValue(opt ? (Array.isArray(opt) ? opt[0]?.id : opt.id) : '')
      }
    >
      <Select>
        <SelectTrigger
          placeholder={placeholder}
          className={className}
          name={controlProps.name}
          required={controlProps.required}
          onBlur={controlProps.onBlur as React.FocusEventHandler<HTMLElement>}
          aria-labelledby={controlProps['aria-labelledby'] as string}
          aria-describedby={
            controlProps['aria-describedby'] as string | undefined
          }
          aria-errormessage={
            controlProps['aria-errormessage'] as string | undefined
          }
          aria-invalid={controlProps['aria-invalid'] as boolean | undefined}
        />
        <SelectContent>
          <SelectOptions />
        </SelectContent>
      </Select>
    </SelectProvider>
  );
}

export default SelectAdapter;
