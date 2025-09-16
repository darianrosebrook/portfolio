import { useMemo } from 'react';
import { useFieldCtx } from './FieldProvider';

type FieldControlAriaProps = Readonly<{
  id: string;
  name: string;
  'aria-labelledby': string;
  'aria-describedby'?: string;
  'aria-errormessage'?: string;
  'aria-invalid'?: true;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  onBlur: () => void;
}>;

export function useFieldControl<
  T extends HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement,
>() {
  const f = useFieldCtx();
  return useMemo(
    () => ({
      controlProps: {
        id: f.inputId,
        name: f.name,
        'aria-labelledby': f.labelId,
        'aria-describedby': f.describedBy,
        'aria-errormessage': f.errors.length ? f.errId : undefined,
        'aria-invalid': f.errors.length ? true : undefined,
        required: f.required || undefined,
        disabled: f.disabled || undefined,
        readOnly: f.readOnly || undefined,
        onBlur: () => f.onBlur(),
      } satisfies FieldControlAriaProps,
      field: f,
    }),
    [f]
  );
}
