import * as React from 'react';
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

export function VariantMatrix({
  rows,
  cols,
  template,
  onTileSelect,
}: VariantMatrixProps) {
  const rowValues = toValues(rows);
  const colValues = toValues(cols);
  const hasCols = colValues.length > 0;

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {rowValues.map((rowVal) => (
        <div key={rowVal} style={{ display: 'grid', gap: 12 }}>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
            {rows.label}: {rowVal}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: hasCols
                ? `repeat(${colValues.length}, minmax(160px, 1fr))`
                : '1fr',
              gap: 12,
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
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 8,
                    padding: 8,
                    background: 'var(--surface-raised)',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--text-tertiary)',
                      marginBottom: 8,
                    }}
                  >
                    {hasCols ? `${cols!.label}: ${colVal}` : 'Example'}
                  </div>
                  <div
                    style={{ height: 160, borderRadius: 6, overflow: 'hidden' }}
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
}
