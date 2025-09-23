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

/**
 * Accessibility testing panel that runs axe-core accessibility checks on target content.
 *
 * Features:
 * - Runs axe-core accessibility audits
 * - Supports custom rule tags (WCAG 2.0, 2.1, etc.)
 * - Provides screen reader announcements of results
 * - Exports violation reports as JSON
 * - Can target specific windows (useful for iframe content)
 *
 * @example
 * ```tsx
 * <A11yPanel
 *   targetWindow={previewIframe.contentWindow}
 *   runOnMount={true}
 *   runTags={['wcag2a', 'wcag2aa']}
 * />
 * ```
 *
 * @param props - Configuration options for the accessibility panel
 */
export function A11yPanel({
  targetWindow,
  runOnMount = false,
  runTags,
}: A11yPanelProps) {
  const [isRunning, setIsRunning] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [violations, setViolations] = React.useState<AxeViolation[]>([]);
  const [announcement, setAnnouncement] = React.useState<string>('');

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

      // Announce results to screen readers
      const violationCount = v.length;
      if (violationCount === 0) {
        setAnnouncement('Accessibility check completed. No violations found.');
      } else {
        const criticalCount = v.filter(
          (violation) => violation.impact === 'critical'
        ).length;
        const seriousCount = v.filter(
          (violation) => violation.impact === 'serious'
        ).length;
        setAnnouncement(
          `Accessibility check completed. Found ${violationCount} violation${violationCount !== 1 ? 's' : ''}${
            criticalCount > 0 ? `, including ${criticalCount} critical` : ''
          }${seriousCount > 0 ? `, ${seriousCount} serious` : ''}.`
        );
      }
    } catch (e) {
      const errorMessage =
        e instanceof Error ? e.message : 'Failed to run accessibility checks';
      setError(errorMessage);
      setAnnouncement(`Accessibility check failed: ${errorMessage}`);
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
        border: '1px solid var(--semantic-color-border-subtle)',
        borderRadius: 'var(--semantic-border-radius-md, 8px)',
        padding: 'var(--semantic-spacing-md, 12px)',
      }}
    >
      {/* Screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        style={{
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: 0,
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0, 0, 0, 0)',
          whiteSpace: 'nowrap',
          border: 0,
        }}
      >
        {announcement}
      </div>
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
