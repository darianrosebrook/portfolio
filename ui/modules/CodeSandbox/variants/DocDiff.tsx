import * as React from 'react';
import { CodePreview } from '../primitives/CodePreview';
import { CodeWorkbench } from '../primitives/CodeWorkbench';
import { ErrorBoundary } from '../primitives/ErrorBoundary';
import type { VirtualProject } from '../types';

export type DocDiffProps = {
  left: VirtualProject;
  right: VirtualProject;
  view?: 'split' | 'unified';
  showPreviews?: boolean;
  syncScroll?: boolean;
  annotate?: boolean;
  height?: number | string;
};

type DiffPart = { type: 'same' | 'add' | 'del'; text: string };

function toFileMap(p: VirtualProject): Record<string, string> {
  const map: Record<string, string> = {};
  for (const f of p.files) map[f.path] = f.contents;
  return map;
}

// Simple LCS-based line diff for reasonable source sizes
function diffLines(a: string, b: string): DiffPart[] {
  const A = a.split(/\r?\n/);
  const B = b.split(/\r?\n/);
  const n = A.length,
    m = B.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    Array(m + 1).fill(0)
  );
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] =
        A[i] === B[j]
          ? dp[i + 1][j + 1] + 1
          : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const parts: DiffPart[] = [];
  let i = 0,
    j = 0;
  while (i < n && j < m) {
    if (A[i] === B[j]) {
      parts.push({ type: 'same', text: A[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      parts.push({ type: 'del', text: A[i] });
      i++;
    } else {
      parts.push({ type: 'add', text: B[j] });
      j++;
    }
  }
  while (i < n) {
    parts.push({ type: 'del', text: A[i++] });
  }
  while (j < m) {
    parts.push({ type: 'add', text: B[j++] });
  }
  return parts;
}

export function DocDiff({
  left,
  right,
  view = 'split',
  showPreviews = false,
  syncScroll = true,
  height = '70dvh',
}: DocDiffProps) {
  const leftMap = React.useMemo(() => toFileMap(left), [left]);
  const rightMap = React.useMemo(() => toFileMap(right), [right]);
  const fileList = React.useMemo(
    () =>
      Array.from(
        new Set([...Object.keys(leftMap), ...Object.keys(rightMap)])
      ).sort(),
    [leftMap, rightMap]
  );
  const [activeFile, setActiveFile] = React.useState(fileList[0] || '/App.tsx');
  const leftCode = leftMap[activeFile] ?? '';
  const rightCode = rightMap[activeFile] ?? '';
  const parts = React.useMemo(
    () => diffLines(leftCode, rightCode),
    [leftCode, rightCode]
  );

  const leftRef = React.useRef<HTMLDivElement>(null);
  const rightRef = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!syncScroll || !leftRef.current || !rightRef.current) return;
    const L = leftRef.current;
    const R = rightRef.current;
    let active: 'L' | 'R' | null = null;
    const onL = () => {
      if (active !== 'R') {
        active = 'L';
        R.scrollTop = L.scrollTop;
      }
    };
    const onR = () => {
      if (active !== 'L') {
        active = 'R';
        L.scrollTop = R.scrollTop;
      }
    };
    L.addEventListener('scroll', onL, { passive: true });
    R.addEventListener('scroll', onR, { passive: true });
    return () => {
      L.removeEventListener('scroll', onL);
      R.removeEventListener('scroll', onR);
    };
  }, [syncScroll]);

  // Create reset keys from project identifiers
  const leftKey = JSON.stringify(left.files.map((f) => f.path).sort());
  const rightKey = JSON.stringify(right.files.map((f) => f.path).sort());

  return (
    <ErrorBoundary
      resetKeys={[leftKey, rightKey, view || 'split']}
      onError={(error, errorInfo) => {
        console.error('DocDiff Error:', error, errorInfo);
      }}
    >
      <div style={{ display: 'grid', gap: 12 }}>
        {/* File selector */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {fileList.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFile(f)}
              aria-current={activeFile === f ? 'page' : undefined}
              style={{
                padding: '4px 8px',
                borderRadius: 6,
                border: '1px solid var(--border-subtle)',
                background:
                  activeFile === f
                    ? 'var(--surface-accent-subtle)'
                    : 'transparent',
                color:
                  activeFile === f
                    ? 'var(--text-accent)'
                    : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Diff view */}
        {view === 'unified' ? (
          <div
            style={{
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <pre
              style={{
                margin: 0,
                padding: 12,
                maxHeight: '40dvh',
                overflow: 'auto',
                lineHeight: 1.5,
                fontFamily:
                  'var(--semantic-typography-semantic-family-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
              }}
            >
              {parts.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    background:
                      p.type === 'add'
                        ? 'var(--surface-accent-subtle)'
                        : p.type === 'del'
                          ? 'var(--surface-tertiary)'
                          : 'transparent',
                    color:
                      p.type === 'del' ? 'var(--text-secondary)' : 'inherit',
                  }}
                >
                  {p.type === 'add' ? '+ ' : p.type === 'del' ? '- ' : '  '}
                  {p.text}
                </div>
              ))}
            </pre>
          </div>
        ) : (
          <div
            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}
          >
            <div
              ref={leftRef}
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                overflow: 'auto',
                maxHeight: '40dvh',
              }}
            >
              <pre
                style={{
                  margin: 0,
                  padding: 12,
                  lineHeight: 1.5,
                  fontFamily:
                    'var(--semantic-typography-semantic-family-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
                }}
              >
                {parts.map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      background:
                        p.type === 'del'
                          ? 'var(--surface-tertiary)'
                          : 'transparent',
                      color:
                        p.type === 'add' ? 'var(--text-tertiary)' : 'inherit',
                    }}
                  >
                    {p.type === 'add' ? '  ' : p.type === 'del' ? '- ' : '  '}
                    {p.type === 'add' ? '' : p.text}
                  </div>
                ))}
              </pre>
            </div>
            <div
              ref={rightRef}
              style={{
                border: '1px solid var(--border-subtle)',
                borderRadius: 8,
                overflow: 'auto',
                maxHeight: '40dvh',
              }}
            >
              <pre
                style={{
                  margin: 0,
                  padding: 12,
                  lineHeight: 1.5,
                  fontFamily:
                    'var(--semantic-typography-semantic-family-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
                }}
              >
                {parts.map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      background:
                        p.type === 'add'
                          ? 'var(--surface-accent-subtle)'
                          : 'transparent',
                      color:
                        p.type === 'del' ? 'var(--text-tertiary)' : 'inherit',
                    }}
                  >
                    {p.type === 'del' ? '  ' : p.type === 'add' ? '+ ' : '  '}
                    {p.type === 'del' ? '' : p.text}
                  </div>
                ))}
              </pre>
            </div>
          </div>
        )}

        {/* Optional dual preview */}
        {showPreviews && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 12,
              minHeight: 200,
              height,
            }}
          >
            <CodeWorkbench project={left} height="100%">
              <CodePreview height="100%" />
            </CodeWorkbench>
            <CodeWorkbench project={right} height="100%">
              <CodePreview height="100%" />
            </CodeWorkbench>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
}
