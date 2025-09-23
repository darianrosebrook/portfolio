import * as React from 'react';
import '../styles/responsive.scss';
import type { VariantAxis } from '../types';

export type VariantMatrixProps = {
  rows: VariantAxis;
  cols?: VariantAxis;
  template: (props: Record<string, any>) => React.ReactNode;
  onTileSelect?: (props: Record<string, any>) => void;
};

function toValues(axis: VariantAxis | undefined): string[] {
  if (!axis) return [];
  return Array.isArray(axis.values) ? axis.values : [];
}

export const VariantMatrix = React.memo(function VariantMatrix({
  rows,
  cols,
  template,
  onTileSelect,
}: VariantMatrixProps) {
  const rowValues = toValues(rows);
  const colValues = toValues(cols);
  const hasCols = colValues.length > 0;

  return (
    <div
      className="codesandbox-container codesandbox-variant-matrix"
      style={{ display: 'grid', gap: 'var(--codesandbox-gap-md)' }}
    >
      {rowValues.map((rowVal) => (
        <div
          key={rowVal}
          style={{ display: 'grid', gap: 'var(--codesandbox-gap-sm)' }}
        >
          <div
            style={{
              fontWeight: 600,
              color: 'var(--semantic-color-foreground-secondary)',
              fontSize: 'var(--semantic-typography-body-small-font-size, 14px)',
            }}
          >
            {rows.label}: {rowVal}
          </div>
          <div
            className="codesandbox-variant-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: hasCols
                ? `repeat(auto-fit, minmax(var(--codesandbox-variant-grid-min), 1fr))`
                : '1fr',
              gap: 'var(--codesandbox-gap-sm)',
            }}
          >
            {(hasCols ? colValues : ['_single']).map((colVal) => {
              const props = hasCols
                ? { [rows.id]: rowVal, [cols!.id]: colVal }
                : { [rows.id]: rowVal };
              return (
                <button
                  key={hasCols ? `${rowVal}::${colVal}` : rowVal}
                  type="button"
                  onClick={() => onTileSelect?.(props)}
                  style={{
                    textAlign: 'left',
                    border: '1px solid var(--semantic-color-border-subtle)',
                    borderRadius: 'var(--semantic-border-radius-md, 8px)',
                    padding: 'var(--codesandbox-padding-sm)',
                    background: 'var(--semantic-color-background-secondary)',
                    cursor: 'pointer',
                    minHeight: 'var(--codesandbox-min-height)',
                    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor =
                      'var(--semantic-color-border-focus)';
                    e.currentTarget.style.boxShadow =
                      '0 0 0 2px var(--semantic-color-border-focus-ring)';
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      'var(--semantic-color-border-subtle)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div
                    style={{
                      fontSize:
                        'var(--semantic-typography-body-small-font-size, 12px)',
                      color: 'var(--semantic-color-foreground-tertiary)',
                      marginBottom: 'var(--codesandbox-gap-xs)',
                    }}
                  >
                    {hasCols ? `${cols!.label}: ${colVal}` : 'Example'}
                  </div>
                  <div
                    style={{
                      height: 'clamp(120px, 20vh, 180px)',
                      borderRadius: 'var(--semantic-border-radius-sm, 6px)',
                      overflow: 'hidden',
                      background: 'var(--semantic-color-background-primary)',
                    }}
                  >
                    {template(props)}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
});
