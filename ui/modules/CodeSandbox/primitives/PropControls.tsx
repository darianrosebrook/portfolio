import * as React from 'react';
import '../styles/responsive.scss';
import type { ControlDef } from '../types';

// Extract style objects to prevent recreation on each render
const CONTROL_STYLES = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 'var(--codesandbox-gap-sm)',
  },
  controlRow: {
    display: 'grid',
    gridTemplateColumns: '1fr auto',
    gap: 'var(--codesandbox-gap-xs)',
    alignItems: 'center',
    marginBottom: 'var(--codesandbox-gap-xs)',
  },
  label: {
    color: 'var(--semantic-color-foreground-secondary)',
    fontSize: 'var(--semantic-typography-body-small-font-size, 14px)',
  },
  numberInput: {
    width: 'var(--codesandbox-input-width-narrow)',
    minHeight: 'var(--codesandbox-input-min-height, 32px)',
    padding: 'var(--codesandbox-padding-xs)',
  },
  textInput: {
    width: 'var(--codesandbox-input-width-wide)',
    minHeight: 'var(--codesandbox-input-min-height, 32px)',
    padding: 'var(--codesandbox-padding-xs)',
  },
  selectInput: {
    width: 'var(--codesandbox-input-width-wide)',
    minHeight: 'var(--codesandbox-input-min-height, 32px)',
    padding: 'var(--codesandbox-padding-xs)',
  },
  radioGroup: {
    display: 'flex',
    gap: 'var(--codesandbox-gap-sm)',
    flexWrap: 'wrap' as const,
  },
  radioLabel: {
    display: 'inline-flex',
    gap: 'var(--codesandbox-gap-xs)',
    alignItems: 'center',
    minHeight: 'var(--codesandbox-button-min-height, 32px)',
  },
  jsonContainer: {
    marginBottom: 'var(--codesandbox-gap-sm)',
  },
  jsonLabel: {
    color: 'var(--semantic-color-foreground-secondary)',
    marginBottom: 'var(--codesandbox-gap-xs)',
    fontSize: 'var(--semantic-typography-body-small-font-size, 14px)',
  },
  jsonTextarea: {
    width: '100%',
    minHeight: '120px',
    padding: 'var(--codesandbox-padding-sm)',
    fontSize: 'var(--semantic-typography-font-family-mono, monospace)',
  },
} as const;

export type PropControlsProps = {
  controls: ControlDef[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
};

const ControlRow = React.memo(function ControlRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={CONTROL_STYLES.controlRow}>
      <span style={CONTROL_STYLES.label}>{label}</span>
      {children}
    </label>
  );
});

export const PropControls = React.memo(function PropControls({
  controls,
  values,
  onChange,
}: PropControlsProps) {
  const handleSet = React.useCallback(
    (id: string, v: unknown) => {
      onChange({ ...values, [id]: v });
    },
    [onChange, values]
  );

  return (
    <div
      className="codesandbox-container codesandbox-controls"
      style={CONTROL_STYLES.container}
    >
      {controls.map((c) => {
        const value = values[c.id] ?? c.defaultValue;
        switch (c.kind) {
          case 'boolean':
            return (
              <ControlRow key={c.id} label={c.label}>
                <input
                  type="checkbox"
                  checked={Boolean(value)}
                  onChange={(e) => handleSet(c.id, e.target.checked)}
                />
              </ControlRow>
            );
          case 'number':
            return (
              <ControlRow key={c.id} label={c.label}>
                <input
                  type="number"
                  value={Number(value ?? 0)}
                  min={c.min}
                  max={c.max}
                  step={c.step}
                  onChange={(e) =>
                    handleSet(
                      c.id,
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                  style={CONTROL_STYLES.numberInput}
                />
              </ControlRow>
            );
          case 'text':
            return (
              <ControlRow key={c.id} label={c.label}>
                <input
                  type="text"
                  value={String(value ?? '')}
                  onChange={(e) => handleSet(c.id, e.target.value)}
                  style={CONTROL_STYLES.textInput}
                />
              </ControlRow>
            );
          case 'color':
            return (
              <ControlRow key={c.id} label={c.label}>
                <input
                  type="color"
                  value={String(value ?? '#000000')}
                  onChange={(e) => handleSet(c.id, e.target.value)}
                />
              </ControlRow>
            );
          case 'select':
            return (
              <ControlRow key={c.id} label={c.label}>
                <select
                  value={String(value ?? c.options?.[0]?.value ?? '')}
                  onChange={(e) => handleSet(c.id, e.target.value)}
                  style={CONTROL_STYLES.selectInput}
                >
                  {(c.options ?? []).map((opt) => (
                    <option key={String(opt.value)} value={String(opt.value)}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </ControlRow>
            );
          case 'radio':
            return (
              <div key={c.id} style={CONTROL_STYLES.jsonContainer}>
                <div style={CONTROL_STYLES.jsonLabel}>{c.label}</div>
                <div role="radiogroup" style={CONTROL_STYLES.radioGroup}>
                  {(c.options ?? []).map((opt) => {
                    const checked = String(value) === String(opt.value);
                    return (
                      <label
                        key={String(opt.value)}
                        style={CONTROL_STYLES.radioLabel}
                      >
                        <input
                          type="radio"
                          name={c.id}
                          checked={checked}
                          onChange={() => handleSet(c.id, opt.value)}
                        />
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          case 'json':
            return (
              <div key={c.id} style={CONTROL_STYLES.jsonContainer}>
                <div style={CONTROL_STYLES.jsonLabel}>{c.label}</div>
                <textarea
                  value={(() => {
                    try {
                      return JSON.stringify(
                        value ?? c.defaultValue ?? {},
                        null,
                        2
                      );
                    } catch {
                      return String(value ?? '');
                    }
                  })()}
                  onChange={(e) => {
                    try {
                      const v = JSON.parse(e.target.value);
                      handleSet(c.id, v);
                    } catch {
                      // ignore until valid JSON
                    }
                  }}
                  rows={6}
                  style={CONTROL_STYLES.jsonTextarea}
                />
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
});
