import React from 'react';
import { useFieldControl } from './useFieldControl';

export interface RadioOption {
  value: string;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface RadioGroupAdapterProps {
  options: RadioOption[];
  className?: string;
}

export function RadioGroupAdapter({
  options,
  className,
}: RadioGroupAdapterProps) {
  const { controlProps, field } = useFieldControl<HTMLInputElement>();
  return (
    <div
      role="radiogroup"
      aria-labelledby={controlProps['aria-labelledby'] as string}
      className={className}
    >
      {options.map((opt, i) => {
        const id = `${controlProps.id}-${i}`;
        return (
          <div key={id}>
            <input
              type="radio"
              id={id}
              name={controlProps.name as string}
              value={opt.value}
              checked={field.value === opt.value}
              onChange={(e) =>
                field.setValue((e.currentTarget as HTMLInputElement).value)
              }
              aria-describedby={controlProps['aria-describedby'] as string}
              aria-errormessage={controlProps['aria-errormessage'] as string}
              aria-invalid={field.errors.length ? true : undefined}
              disabled={opt.disabled || !!controlProps.disabled}
            />
            <label htmlFor={id}>{opt.label}</label>
          </div>
        );
      })}
    </div>
  );
}

export default RadioGroupAdapter;
