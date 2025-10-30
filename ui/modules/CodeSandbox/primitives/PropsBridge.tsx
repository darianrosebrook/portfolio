import * as React from 'react';
import { useSandpack } from '@codesandbox/sandpack-react';

export type PropsBridgeProps = {
  values: Record<string, unknown>;
  /** File path in the virtual FS that demos can import, e.g., `/props.json` */
  path?: string;
};

/**
 * Writes a JSON file into the Sandpack FS whenever `values` change so the demo
 * code can import it (e.g., `import props from '/props.json'`).
 */
export function PropsBridge({
  values,
  path = '/props.json',
}: PropsBridgeProps) {
  const { sandpack } = useSandpack();
  const sandpackRef = React.useRef(sandpack);
  const lastValuesRef = React.useRef<string>('');
  const fileCreatedRef = React.useRef(false);

  // Update ref when sandpack changes, but only if it's actually different
  React.useEffect(() => {
    if (sandpack && sandpack !== sandpackRef.current) {
      sandpackRef.current = sandpack;
      fileCreatedRef.current = false; // Reset flag when sandpack instance changes
    }
  }, [sandpack]);

  // Create file immediately when sandpack is ready (before module parsing)
  // This ensures the file exists when App.tsx tries to import it
  React.useLayoutEffect(() => {
    if (
      sandpackRef.current &&
      typeof sandpackRef.current.updateFile === 'function' &&
      !fileCreatedRef.current
    ) {
      try {
        const initialJson = JSON.stringify(values ?? {}, null, 2);
        sandpackRef.current.updateFile(path, initialJson);
        lastValuesRef.current = initialJson;
        fileCreatedRef.current = true;
      } catch {
        // ignore
      }
    }
  }, [sandpack, path, values]);

  // Update file when values actually change
  React.useEffect(() => {
    try {
      const json = JSON.stringify(values ?? {}, null, 2);
      
      // Compare serialized values to avoid unnecessary updates
      if (json === lastValuesRef.current) {
        return;
      }
      
      lastValuesRef.current = json;
      
      // Use ref to avoid dependency on sandpack object reference
      if (
        sandpackRef.current &&
        typeof sandpackRef.current.updateFile === 'function'
      ) {
        sandpackRef.current.updateFile(path, json);
        fileCreatedRef.current = true;
      }
    } catch {
      // ignore
    }
  }, [values, path]);

  return null;
}
