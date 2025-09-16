import React from 'react';
import { useFieldControl } from './useFieldControl';

export interface CheckboxAdapterProps {
  className?: string;
}

export function CheckboxAdapter({ className }: CheckboxAdapterProps) {
  const { controlProps, field } = useFieldControl<HTMLInputElement>();
  return (
    <input
      {...controlProps}
      className={className}
      type="checkbox"
      checked={!!field.value}
      onChange={(e) =>
        field.setValue((e.currentTarget as HTMLInputElement).checked)
      }
    />
  );
}

export default CheckboxAdapter;
