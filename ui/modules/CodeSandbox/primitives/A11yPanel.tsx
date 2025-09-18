import * as React from 'react';
import { LoadingSpinner } from './LoadingSpinner';

export type A11yPanelProps = {
  /** If provided, runs axe in this window (e.g., the preview iframe window) */
  targetWindow?: Window | null;
  /** Run automatically on mount */
  runOnMount?: boolean;
  /** Optional: limit rule tags, e.g. ['wcag2a','wcag2aa'] */
  runTags?: string[];
};

type AxeViolation = {
  id: string;
  impact?: string;
  help: string;
  helpUrl: string;
  nodes: { target: string[]; html?: string }[];
};

export function A11yPanel({
  targetWindow,
  runOnMount = false,
  runTags,
}: A11yPanelProps) {
  const [isRunning, setIsRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [violations, setViolations] = React.useState<AxeViolation[]>([]);

  const resolveTargetWindow = React.useCallback((): Window | null => {
    if (targetWindow) return targetWindow;
    try {
      const iframe =
        document.querySelector<HTMLIFrameElement>('.sp-preview-iframe');
      return iframe?.contentWindow ?? null;
    } catch {
      return null;
    }
  }, [targetWindow]);

  const runAxe = React.useCallback(async () => {
    setIsRunning(true);
    setError(null);
    try {
      const win = resolveTargetWindow() ?? window;
      // Dynamic import to avoid SSR/edge issues
      const axeModule = (await import('axe-core')).default;
      const options =
        runTags && runTags.length
          ? { runOnly: { type: 'tag', values: runTags } }
          : undefined;
      const result = (await axeModule.run(win.document, options as any)) as any;
      const v: AxeViolation[] = (result?.violations || []).map((vi: any) => ({
        id: vi.id,
        impact: vi.impact,
        help: vi.help,
        helpUrl: vi.helpUrl,
        nodes: (vi.nodes || []).map((n: any) => ({
          target: n.target,
          html: n.html,
        })),
      }));
      setViolations(v);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Failed to run accessibility checks'
      );
    } finally {
      setIsRunning(false);
    }
  }, [resolveTargetWindow, runTags]);

  React.useEffect(() => {
    if (runOnMount) runAxe();
  }, [runOnMount, runAxe]);

  const exportJson = React.useCallback(() => {
    const blob = new Blob([JSON.stringify({ violations }, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'a11y-report.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [violations]);

  return (
    <div
      style={{
        border: '1px solid var(--border-subtle)',
        borderRadius: 8,
        padding: 12,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: 8,
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <strong>Accessibility</strong>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            type="button"
            onClick={runAxe}
            disabled={isRunning}
            style={{
              padding: '4px 8px',
              borderRadius: 6,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {isRunning && <LoadingSpinner size="small" />}
            {isRunning ? 'Running…' : 'Run checks'}
          </button>
          <button
            type="button"
            onClick={exportJson}
            disabled={!violations.length}
            style={{ padding: '4px 8px', borderRadius: 6 }}
          >
            Export JSON
          </button>
        </div>
      </div>
      {error && (
        <div style={{ color: 'var(--text-danger)', marginTop: 8 }}>
          Error: {error}
        </div>
      )}
      <div
        style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}
      >
        {violations.length === 0 && !isRunning
          ? 'No violations found (or not run yet).'
          : `${violations.length} violation(s)`}
      </div>
      {violations.length > 0 && (
        <ul style={{ marginTop: 8, display: 'grid', gap: 8 }}>
          {violations.map((v) => (
            <li
              key={v.id}
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 6,
                padding: 8,
              }}
            >
              <div style={{ fontWeight: 600 }}>{v.help}</div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                {v.id} • {v.impact || 'impact n/a'} •{' '}
                <a href={v.helpUrl} target="_blank" rel="noreferrer">
                  Learn more
                </a>
              </div>
              <div style={{ marginTop: 6 }}>
                {v.nodes.slice(0, 5).map((n, i) => (
                  <div
                    key={i}
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {n.target.join(' ')}
                  </div>
                ))}
                {v.nodes.length > 5 && (
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                    +{v.nodes.length - 5} more nodes…
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
