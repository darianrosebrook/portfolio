import { useSandpack } from '@codesandbox/sandpack-react';
import * as React from 'react';
import { CodeEditor } from '../primitives/CodeEditor';
import { CodePreview } from '../primitives/CodePreview';
import { CodeWorkbench } from '../primitives/CodeWorkbench';
import { ErrorBoundary } from '../primitives/ErrorBoundary';
import { SectionSync } from '../primitives/SectionSync';
import '../styles/highlight.scss';
import type { Decoration, SectionSpec, VirtualProject } from '../types';

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
      if (decos.length) {
        const newFile = decos[0].file;
        setActiveFile((currentFile) =>
          currentFile !== newFile ? newFile : currentFile
        );
      }

      const lines = decos.map((d) => d.line);
      if (lines.length) {
        const newHighlight: [number, number] = [
          Math.min(...lines),
          Math.max(...lines),
        ];
        setHighlight((currentHighlight) => {
          // Only update if the highlight has actually changed
          if (
            !currentHighlight ||
            currentHighlight[0] !== newHighlight[0] ||
            currentHighlight[1] !== newHighlight[1]
          ) {
            return newHighlight;
          }
          return currentHighlight;
        });
      }
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
  const currentSectionId = React.useMemo(() => {
    return sections.find(
      (s) =>
        s.code?.file === activeFile &&
        s.code?.lines[0] === highlight?.[0] &&
        s.code?.lines[1] === highlight?.[1]
    )?.id;
  }, [sections, activeFile, highlight]);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!currentSectionId) return;
    if (window.location.hash.slice(1) === currentSectionId) return;

    if (hashUpdateRef.current) window.clearTimeout(hashUpdateRef.current);
    hashUpdateRef.current = window.setTimeout(() => {
      try {
        window.history.replaceState(null, '', `#${currentSectionId}`);
      } catch {}
      hashUpdateRef.current = null;
    }, 150);
  }, [currentSectionId]);

  const themeClassName =
    preview?.theme && preview.theme !== 'system' ? preview.theme : undefined;

  // Create reset keys from project and sections identifiers
  const projectKey = JSON.stringify(project.files.map((f) => f.path).sort());
  const sectionsKey = JSON.stringify(sections?.map((s) => s.id) || []);

  return (
    <ErrorBoundary
      resetKeys={[projectKey, sectionsKey]}
      onError={(error, errorInfo) => {
        console.error('DocInteractive Error:', error, errorInfo);
        onEvent?.({ type: 'compileError', payload: { error: error.message } });
      }}
    >
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
            onActiveSection={React.useCallback(
              (id: string) => {
                onEvent?.({ type: 'sectionChange', id });
              },
              [onEvent]
            )}
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
    </ErrorBoundary>
  );
}

function SectionDriver({
  rootRef,
  activeFile,
}: {
  rootRef: React.RefObject<HTMLDivElement | null>;
  activeFile?: string;
}) {
  const { sandpack } = useSandpack();
  const sandpackRef = React.useRef(sandpack);
  const lastActiveFileRef = React.useRef<string | undefined>(undefined);

  // Update the ref when sandpack changes, but only if it's actually different
  React.useEffect(() => {
    if (sandpack && sandpack !== sandpackRef.current) {
      sandpackRef.current = sandpack;
    }
  }, [sandpack]);

  React.useEffect(() => {
    // Only update if the activeFile has actually changed and sandpack is available
    if (
      activeFile &&
      activeFile !== lastActiveFileRef.current &&
      sandpackRef.current
    ) {
      lastActiveFileRef.current = activeFile;
      try {
        // Add a small delay to ensure sandpack is fully initialized
        setTimeout(() => {
          if (sandpackRef.current) {
            sandpackRef.current.openFile(activeFile);
          }
        }, 0);
      } catch (error) {
        console.warn('Failed to open file in sandpack:', error);
      }
    }
  }, [activeFile]);

  return null;
}
