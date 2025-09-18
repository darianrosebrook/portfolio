import * as React from 'react';
import type { ControlDef } from '../types';

export type PropControlsProps = {
  controls: ControlDef[];
  values: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
};

function ControlRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto',
        gap: 8,
        alignItems: 'center',
        marginBottom: 8,
      }}
    >
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      {children}
    </label>
  );
}

export function PropControls({
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
    <div style={{ display: 'flex', flexDirection: 'column' }}>
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
                  style={{ width: 120 }}
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
                  style={{ width: 160 }}
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
                  style={{ width: 160 }}
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
              <div key={c.id} style={{ marginBottom: 8 }}>
                <div
                  style={{ color: 'var(--text-secondary)', marginBottom: 4 }}
                >
                  {c.label}
                </div>
                <div
                  role="radiogroup"
                  style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}
                >
                  {(c.options ?? []).map((opt) => {
                    const checked = String(value) === String(opt.value);
                    return (
                      <label
                        key={String(opt.value)}
                        style={{
                          display: 'inline-flex',
                          gap: 4,
                          alignItems: 'center',
                        }}
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
              <div key={c.id} style={{ marginBottom: 8 }}>
                <div
                  style={{ color: 'var(--text-secondary)', marginBottom: 4 }}
                >
                  {c.label}
                </div>
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
                  style={{ width: '100%' }}
                />
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
