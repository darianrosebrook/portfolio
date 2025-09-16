/** Headless logic hook for OTP */
import * as React from 'react';

export type OTPGuardMode = 'numeric' | 'alphanumeric' | RegExp;

export interface UseOTPOptions {
  length?: number;
  mode?: OTPGuardMode;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onChange?(code: string): void;
  onComplete?(code: string): void;
}

export interface UseOTPResult {
  length: number;
  chars: string[];
  code: string;
  isComplete: boolean;
  disabled: boolean;
  readOnly: boolean;
  register(el: HTMLInputElement | null, index: number): void;
  setChar(index: number, ch: string): void;
  clearChar(index: number): void;
  handlePaste(index: number, text: string): void;
  focus(index: number): void;
  blur(index: number): void;
  refs: React.MutableRefObject<HTMLInputElement[]>;
}

function isAllowedChar(ch: string, mode: OTPGuardMode): boolean {
  if (mode === 'numeric') return /^[0-9]$/.test(ch);
  if (mode === 'alphanumeric') return /^[a-zA-Z0-9]$/.test(ch);
  return (mode as RegExp).test(ch);
}

export function useOTP(options: UseOTPOptions = {}): UseOTPResult {
  const {
    length: lengthProp = 6,
    mode = 'numeric',
    value,
    defaultValue,
    disabled = false,
    readOnly = false,
    onChange,
    onComplete,
  } = options;

  const length = Math.max(1, Math.min(12, Math.floor(lengthProp)));
  const isControlled = typeof value === 'string';

  const [internal, setInternal] = React.useState<string[]>(() => {
    if (defaultValue) return defaultValue.slice(0, length).split('');
    return Array.from({ length }, () => '');
  });

  // Re-initialize internal when length changes (uncontrolled only)
  React.useEffect(() => {
    if (!isControlled) {
      setInternal((prev) => {
        const next = Array.from({ length }, (_, i) => prev[i] ?? '');
        return next;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [length]);

  const refs = React.useRef<HTMLInputElement[]>([]);

  const code = isControlled ? value! : internal.join('');
  const chars = React.useMemo(() => {
    const codeChars = code.slice(0, length).split('');
    // Pad with empty strings to reach desired length
    while (codeChars.length < length) {
      codeChars.push('');
    }
    return codeChars;
  }, [code, length]);
  const isComplete = React.useMemo(
    () => chars.every((c) => c && c.length === 1),
    [chars]
  );

  const emitChange = React.useCallback(
    (next: string[]) => {
      const joined = next.join('');
      onChange?.(joined);
      if (next.every(Boolean)) onComplete?.(joined);
    },
    [onChange, onComplete]
  );

  const setChar = React.useCallback(
    (index: number, ch: string) => {
      if (disabled || readOnly) return;
      const last = ch.slice(-1);
      if (!isAllowedChar(last, mode)) return;
      const next = chars.slice();
      next[index] = last;
      if (!isControlled) setInternal(next);
      emitChange(next);
      // Advance focus to next field
      if (index < length - 1) {
        refs.current[index + 1]?.focus();
      } else if (next.every(Boolean)) {
        // All fields filled, call onComplete
        onComplete?.(next.join(''));
      }
    },
    [
      chars,
      disabled,
      readOnly,
      isControlled,
      mode,
      emitChange,
      length,
      onComplete,
      refs,
    ]
  );

  const clearChar = React.useCallback(
    (index: number) => {
      if (disabled || readOnly) return;
      const next = chars.slice();
      next[index] = '';
      if (!isControlled) setInternal(next);
      emitChange(next);
    },
    [chars, disabled, readOnly, isControlled, emitChange]
  );

  const handlePaste = React.useCallback(
    (index: number, text: string) => {
      if (disabled || readOnly) return;
      const allowed = Array.from(text).filter((c) => isAllowedChar(c, mode));
      if (allowed.length === 0) return;
      const next = chars.slice();
      // Fill from the paste position, respecting field boundaries
      for (let i = 0; i < allowed.length && index + i < length; i += 1) {
        next[index + i] = allowed[i];
      }
      if (!isControlled) setInternal(next);
      emitChange(next);
      const lastIndex = Math.min(index + allowed.length - 1, length - 1);
      refs.current[lastIndex]?.focus();
    },
    [chars, disabled, readOnly, mode, isControlled, emitChange, length, refs]
  );

  const register = React.useCallback(
    (el: HTMLInputElement | null, index: number) => {
      if (el) refs.current[index] = el;
    },
    []
  );

  const focus = React.useCallback((index: number) => {
    refs.current[index]?.focus();
  }, []);

  const blur = React.useCallback((index: number) => {
    refs.current[index]?.blur();
  }, []);

  return {
    length,
    chars,
    code,
    isComplete,
    disabled,
    readOnly,
    register,
    setChar,
    clearChar,
    handlePaste,
    focus,
    blur,
    refs,
  };
}
