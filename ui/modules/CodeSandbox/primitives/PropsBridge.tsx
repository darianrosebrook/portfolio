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

  React.useEffect(() => {
    try {
      const json = JSON.stringify(values ?? {}, null, 2);
      // Prefer updateFile when available; fallback to openFile no-op semantics if needed
      if (typeof sandpack.updateFile === 'function') {
        sandpack.updateFile(path, json);
      }
    } catch {
      // ignore
    }
  }, [sandpack, values, path]);

  return null;
}
