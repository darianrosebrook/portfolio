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

  // Initialize default values from controls
  // Use stable controls reference to prevent infinite loops
  const controlsKey = React.useMemo(
    () =>
      JSON.stringify(controls.map((c) => `${c.id}:${c.defaultValue}`).sort()),
    [controls]
  );

  React.useEffect(() => {
    // Use functional update to check previous state and avoid including values in deps
    setValues((prev) => {
      const defaults: Record<string, any> = {};
      controls.forEach((control) => {
        if (
          control.defaultValue !== undefined &&
          prev[control.id] === undefined
        ) {
          defaults[control.id] = control.defaultValue;
        }
      });
      if (Object.keys(defaults).length > 0) {
        return { ...prev, ...defaults };
      }
      return prev;
    });
  }, [controlsKey, controls]);

  // Initialize from URL query if enabled
  // Use stable grid reference to prevent re-initialization loops
  const gridKey = React.useMemo(
    () =>
      JSON.stringify({
        rowsId: grid.rows.id,
        colsId: grid.cols?.id,
        rowsDefault: grid.rows.defaultValue,
        colsDefault: grid.cols?.defaultValue,
        rowsValues: grid.rows.values.join(','),
        colsValues: grid.cols?.values.join(','),
      }),
    [
      grid.rows.id,
      grid.rows.defaultValue,
      grid.rows.values,
      grid.cols?.id,
      grid.cols?.defaultValue,
      grid.cols?.values,
    ]
  );

  React.useEffect(() => {
    if (!linkSelectionToURL) return;
    if (typeof window === 'undefined') return;

    // Use functional update to check previous state and avoid including values in deps
    setValues((prev) => {
      const params = new URLSearchParams(window.location.search);
      const init: Record<string, any> = {};
      const rowVal =
        params.get(grid.rows.id) ??
        grid.rows.defaultValue ??
        grid.rows.values[0];
      const colVal = grid.cols
        ? (params.get(grid.cols.id) ??
          grid.cols.defaultValue ??
          grid.cols.values[0])
        : undefined;

      // Only update if values are different from current
      if (
        prev[grid.rows.id] !== rowVal ||
        (grid.cols && prev[grid.cols.id] !== colVal)
      ) {
        init[grid.rows.id] = rowVal;
        if (grid.cols && colVal !== undefined) {
          init[grid.cols.id] = colVal;
        }
        return Object.keys(init).length > 0 ? { ...prev, ...init } : prev;
      }
      return prev;
    });
  }, [linkSelectionToURL, gridKey]);

  // Reflect selection in URL if enabled (debounced)
  // Use stable values reference to prevent unnecessary updates
  const valuesKey = React.useMemo(() => JSON.stringify(values), [values]);

  // Capture grid properties in refs to avoid dependency issues
  const gridRowsIdRef = React.useRef(grid.rows.id);
  const gridRowsDefaultRef = React.useRef(grid.rows.defaultValue);
  const gridRowsValuesRef = React.useRef(grid.rows.values);
  const gridColsRef = React.useRef(grid.cols);

  React.useEffect(() => {
    gridRowsIdRef.current = grid.rows.id;
    gridRowsDefaultRef.current = grid.rows.defaultValue;
    gridRowsValuesRef.current = grid.rows.values;
    gridColsRef.current = grid.cols;
  }, [grid.rows.id, grid.rows.defaultValue, grid.rows.values, grid.cols]);

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
      const rowVal = values[gridRowsIdRef.current];
      if (rowVal) {
        params.set(gridRowsIdRef.current, String(rowVal));
      } else {
        params.delete(gridRowsIdRef.current);
      }

      if (gridColsRef.current) {
        const colVal = values[gridColsRef.current.id];
        if (colVal) {
          params.set(gridColsRef.current.id, String(colVal));
        } else {
          params.delete(gridColsRef.current.id);
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
  }, [linkSelectionToURL, valuesKey]);

  // Create reset keys from identifiers
  const resetProjectKey = JSON.stringify(
    project.files.map((f) => f.path).sort()
  );
  const resetControlsKey = JSON.stringify(controls.map((c) => c.id).sort());
  const resetGridKey = JSON.stringify(grid);

  return (
    <ErrorBoundary
      resetKeys={[resetProjectKey, resetControlsKey, resetGridKey]}
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
          <CodeWorkbench project={project} engine="sandpack" height={height}>
            <PropsBridge values={values} />
            <CodePreview height="100%" />
          </CodeWorkbench>
        </div>
      </div>
    </ErrorBoundary>
  );
}
