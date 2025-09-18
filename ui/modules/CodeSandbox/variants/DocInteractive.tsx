import * as React from 'react';
import type { VirtualProject, SectionSpec, Decoration } from '../types';
import { CodeWorkbench } from '../primitives/CodeWorkbench';
import { CodeEditor } from '../primitives/CodeEditor';
import { CodePreview } from '../primitives/CodePreview';
import { useSandpack } from '@codesandbox/sandpack-react';
import { SectionSync } from '../primitives/SectionSync';
import '../styles/highlight.scss';

export type DocInteractiveProps = {
  project: VirtualProject;
  initialFile?: string;
  sections: SectionSpec[];
  height?: string | number;
  preview?: {
    runtime: 'iframe' | 'inline';
    device?: 'desktop' | 'tablet' | 'phone' | 'none';
    reducedMotion?: 'system' | 'on' | 'off';
    theme?: 'system' | 'light' | 'dark' | string;
  };
  editor?: {
    engine?: 'monaco' | 'codemirror' | 'sandpack';
    readOnly?: boolean;
    showLineNumbers?: boolean;
    wrap?: boolean;
    onDecorate?: (d: Decoration[]) => void;
  };
  onEvent?: (
    e:
      | { type: 'sectionChange'; id: string }
      | { type: 'fileChange'; path: string }
      | { type: 'compileStart' | 'compileDone' | 'compileError'; payload?: any }
      | { type: 'previewError'; error: Error }
  ) => void;
};

export function DocInteractive({
  project,
  sections,
  height = '60dvh',
  preview,
  onEvent,
}: DocInteractiveProps) {
  // MVP: vertically stacked editor + preview using Sandpack-backed workbench
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [rootEl, setRootEl] = React.useState<HTMLDivElement | null>(null);
  const [activeFile, setActiveFile] = React.useState<string | undefined>(
    undefined
  );
  const [highlight, setHighlight] = React.useState<[number, number] | null>(
    null
  );

  const handleDecorate = React.useCallback(
    (decos: { file: string; line: number }[]) => {
      if (decos.length) setActiveFile(decos[0].file);
      const lines = decos.map((d) => d.line);
      if (lines.length)
        setHighlight([Math.min(...lines), Math.max(...lines)] as [
          number,
          number,
        ]);
    },
    []
  );

  const decorators = React.useMemo(() => {
    if (!activeFile || !highlight) return undefined;
    const [start, end] = highlight;
    const list: Array<{ file: string; line: number; className?: string }> = [];
    for (let i = start; i <= end; i++) {
      list.push({ file: activeFile, line: i, className: 'highlighted-line' });
    }
    return list;
  }, [activeFile, highlight]);

  // Debounce URL hash updates when active section changes
  const hashUpdateRef = React.useRef<number | null>(null);
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const id = sections.find(
      (s) =>
        s.code?.file === activeFile &&
        s.code?.lines[0] === highlight?.[0] &&
        s.code?.lines[1] === highlight?.[1]
    )?.id;
    if (!id) return;
    if (window.location.hash.slice(1) === id) return;
    if (hashUpdateRef.current) window.clearTimeout(hashUpdateRef.current);
    hashUpdateRef.current = window.setTimeout(() => {
      try {
        window.history.replaceState(null, '', `#${id}`);
      } catch {}
      hashUpdateRef.current = null;
    }, 150);
  }, [sections, activeFile, highlight]);

  const themeClassName =
    preview?.theme && preview.theme !== 'system' ? preview.theme : undefined;

  return (
    <CodeWorkbench
      project={project}
      engine="sandpack"
      height={height}
      themeClassName={`docs-workbench ${themeClassName || ''}`.trim()}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateRows: '1fr 1fr',
          height: '100%',
          minHeight: 320,
        }}
        ref={setRootEl as unknown as React.Ref<HTMLDivElement>}
      >
        <SectionSync
          sections={sections}
          root={rootEl}
          onActiveSection={(id) => {
            onEvent?.({ type: 'sectionChange', id });
          }}
          onDecorate={handleDecorate as any}
        />
        <SectionDriver rootRef={containerRef} activeFile={activeFile} />
        <CodeEditor
          height="100%"
          showLineNumbers
          wrap
          decorators={decorators}
        />
        <CodePreview height="100%" />
      </div>
    </CodeWorkbench>
  );
}

function SectionDriver({
  rootRef,
  activeFile,
}: {
  rootRef: React.RefObject<HTMLDivElement>;
  activeFile?: string;
}) {
  const { sandpack } = useSandpack();

  React.useEffect(() => {
    if (activeFile) {
      try {
        sandpack.openFile(activeFile);
      } catch {}
    }
  }, [activeFile, sandpack]);

  return null;
}
