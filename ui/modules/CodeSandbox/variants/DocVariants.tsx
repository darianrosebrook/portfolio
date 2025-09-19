import * as React from 'react';
import { CodePreview } from '../primitives/CodePreview';
import { CodeWorkbench } from '../primitives/CodeWorkbench';
import { ErrorBoundary } from '../primitives/ErrorBoundary';
import { PropControls } from '../primitives/PropControls';
import { PropsBridge } from '../primitives/PropsBridge';
import { VariantMatrix } from '../primitives/VariantMatrix';
import type { ControlDef, VariantGrid, VirtualProject } from '../types';

export type DocVariantsProps = {
  project: VirtualProject;
  componentName: string;
  controls: ControlDef[];
  grid: VariantGrid;
  showCodeForSelection?: boolean;
  linkSelectionToURL?: boolean;
  onSelectionChange?: (props: Record<string, any>) => void;
  height?: number | string;
};

export function DocVariants({
  project,
  controls,
  grid,
  onSelectionChange,
  height = '70dvh',
  linkSelectionToURL,
}: DocVariantsProps) {
  const [values, setValues] = React.useState<Record<string, any>>({});
  const timeoutRef = React.useRef<NodeJS.Timeout | undefined>(undefined);

  const handleChange = (next: Record<string, any>) => {
    setValues(next);
    onSelectionChange?.(next);
  };

  // Initialize from URL query if enabled
  React.useEffect(() => {
    if (!linkSelectionToURL) return;
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const init: Record<string, any> = {};
    init[grid.rows.id] =
      params.get(grid.rows.id) ?? grid.rows.defaultValue ?? grid.rows.values[0];
    if (grid.cols) {
      init[grid.cols.id] =
        params.get(grid.cols.id) ??
        grid.cols.defaultValue ??
        grid.cols.values[0];
    }
    if (Object.keys(init).length) setValues((prev) => ({ ...prev, ...init }));
  }, [linkSelectionToURL, grid.rows, grid.cols]);

  // Reflect selection in URL if enabled (debounced)
  React.useEffect(() => {
    if (!linkSelectionToURL) return;
    if (typeof window === 'undefined') return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce URL updates to prevent history spam
    timeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams(window.location.search);
      const rowVal = values[grid.rows.id];
      if (rowVal) {
        params.set(grid.rows.id, String(rowVal));
      } else {
        params.delete(grid.rows.id);
      }

      if (grid.cols) {
        const colVal = values[grid.cols.id];
        if (colVal) {
          params.set(grid.cols.id, String(colVal));
        } else {
          params.delete(grid.cols.id);
        }
      }

      const queryString = params.toString();
      const next = `${window.location.pathname}${queryString ? `?${queryString}` : ''}${window.location.hash}`;

      // Only update if different to avoid unnecessary history entries
      if (next !== window.location.href) {
        window.history.replaceState(null, '', next);
      }
    }, 150); // 150ms debounce

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [linkSelectionToURL, values, grid.rows, grid.cols]);

  // Template: render preview using the current props (inline preview only for MVP)
  const template = React.useCallback(
    (propsForTile: Record<string, any>) => (
      <CodeWorkbench project={project} engine="sandpack" height="40dvh">
        <PropsBridge values={{ ...values, ...propsForTile }} />
        <CodePreview height="100%" />
      </CodeWorkbench>
    ),
    [project, values]
  );

  // Create reset keys from identifiers
  const projectKey = JSON.stringify(project.files.map((f) => f.path).sort());
  const controlsKey = JSON.stringify(controls.map((c) => c.id).sort());
  const gridKey = JSON.stringify(grid);

  return (
    <ErrorBoundary
      resetKeys={[projectKey, controlsKey, gridKey]}
      onError={(error, errorInfo) => {
        console.error('DocVariants Error:', error, errorInfo);
        onSelectionChange?.({ error: error.message });
      }}
    >
      <div
        style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 16 }}
      >
        <div>
          <PropControls
            controls={controls}
            values={values}
            onChange={handleChange}
          />
        </div>
        <div style={{ minHeight: 320, height }}>
          <VariantMatrix
            rows={grid.rows}
            cols={grid.cols}
            template={template}
            onTileSelect={handleChange}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}
