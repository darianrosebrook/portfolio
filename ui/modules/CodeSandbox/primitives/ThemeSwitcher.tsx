import * as React from 'react';

export type ThemeSwitcherProps = {
  value: 'system' | 'light' | 'dark' | string;
  onChange: (v: 'system' | 'light' | 'dark' | string) => void;
  options?: Array<{ label: string; value: string }>;
};

export function ThemeSwitcher({
  value,
  onChange,
  options = [
    { label: 'System', value: 'system' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
  ],
}: ThemeSwitcherProps) {
  return (
    <div role="radiogroup" aria-label="Theme">
      {options.map((opt) => (
        <button
          key={opt.value}
          role="radio"
          aria-checked={value === opt.value}
          onClick={() => onChange(opt.value as any)}
          style={{
            appearance: 'none',
            border: 0,
            padding: '4px 8px',
            borderRadius: 6,
            background:
              value === opt.value
                ? 'var(--surface-accent-subtle)'
                : 'transparent',
            color:
              value === opt.value
                ? 'var(--text-accent)'
                : 'var(--text-secondary)',
            cursor: 'pointer',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
