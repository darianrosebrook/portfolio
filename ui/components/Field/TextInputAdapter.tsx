import React from 'react';
import Input from '@/ui/components/Input';
import { useFieldControl } from './useFieldControl';

export interface TextInputAdapterProps {
  placeholder?: string;
  className?: string;
  type?: string;
}

export function TextInputAdapter({
  placeholder,
  className,
  type = 'text',
}: TextInputAdapterProps) {
  const { controlProps, field } = useFieldControl<HTMLInputElement>();
  return (
    <Input
      {...controlProps}
      className={className}
      type={type}
      value={(field.value as string) ?? ''}
      onChange={(e) =>
        field.setValue((e.currentTarget as HTMLInputElement).value)
      }
    />
  );
}

export default TextInputAdapter;
