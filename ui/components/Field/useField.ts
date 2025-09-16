import { useCallback, useId, useMemo, useState } from 'react';
import type { FieldApi, FieldProps, FieldStatus } from './types';

export function useField(props: FieldProps): FieldApi {
  const {
    name,
    id: providedId,
    required = false,
    disabled,
    readOnly,
    defaultValue,
    value,
    onChange,
    validate,
    label,
    helpText,
  } = props;

  const reactId = useId();
  const inputId = providedId ?? `fld-${name}-${reactId}`;
  const labelId = `lbl-${name}-${reactId}`;
  const helpId = `hlp-${name}-${reactId}`;
  const errId = `err-${name}-${reactId}`;

  const isControlled = typeof value !== 'undefined';
  const [internal, setInternal] = useState<unknown>(defaultValue ?? '');
  const current = isControlled ? value : internal;

  const [touched, setTouched] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<FieldStatus>('idle');
  const [errors, setErrors] = useState<string[]>([]);

  const runValidate = useCallback(
    async (val: unknown) => {
      if (!validate) {
        setErrors([]);
        setStatus('idle');
        return;
      }
      setStatus('validating');
      const res = await Promise.resolve(
        validate(val, { name, touched, dirty })
      );
      const arr = !res ? [] : Array.isArray(res) ? res : [res];
      setErrors(arr);
      setStatus(arr.length ? 'invalid' : 'valid');
    },
    [validate, name, touched, dirty]
  );

  const handleChange = useCallback(
    (val: unknown) => {
      if (!isControlled) setInternal(val);
      setDirty(true);
      onChange?.(val);
      // validate on change by default; can be policy-gated later
      runValidate(val);
    },
    [isControlled, onChange, runValidate]
  );

  const handleBlur = useCallback(() => {
    if (!touched) setTouched(true);
    runValidate(current);
  }, [touched, current, runValidate]);

  const describedBy = useMemo(() => {
    const ids: string[] = [];
    if (helpText) ids.push(helpId);
    if (errors.length) ids.push(errId);
    return ids.join(' ') || undefined;
  }, [helpText, helpId, errors.length, errId]);

  return {
    // identity
    name,
    inputId,
    labelId,
    helpId,
    errId,
    describedBy,
    // state
    value: current,
    required,
    disabled,
    readOnly,
    touched,
    dirty,
    status,
    errors,
    // handlers
    setValue: handleChange,
    onBlur: handleBlur,
    setTouched,
    // passthrough
    label,
    helpText,
  };
}
