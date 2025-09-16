import React from 'react';
import { useFieldControl } from './useFieldControl';

export interface TextareaAdapterProps {
  placeholder?: string;
  className?: string;
  rows?: number;
}

export function TextareaAdapter({
  placeholder,
  className,
  rows = 4,
}: TextareaAdapterProps) {
  const { controlProps, field } = useFieldControl<HTMLTextAreaElement>();
  return (
    <textarea
      {...controlProps}
      className={className}
      rows={rows}
      placeholder={placeholder}
      value={(field.value as string) ?? ''}
      onChange={(e) =>
        field.setValue((e.currentTarget as HTMLTextAreaElement).value)
      }
    />
  );
}

export default TextareaAdapter;
