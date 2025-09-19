import { useSandpack } from '@codesandbox/sandpack-react';
import { CodeEditor } from '../primitives/CodeEditor';
import { CodePreview } from '../primitives/CodePreview';
import { CodeWorkbench } from '../primitives/CodeWorkbench';
import { ErrorBoundary } from '../primitives/ErrorBoundary';
import { FileTabs } from '../primitives/FileTabs';
import type { VirtualProject } from '../types';

export type DocSandboxProps = {
  project: VirtualProject;
  initialOpenFiles?: string[];
  previewRuntime?: 'iframe' | 'inline';
  resizable?: boolean;
  tools?: { console?: boolean; perf?: boolean; a11y?: boolean };
  toolbar?: {
    copy?: boolean;
    reset?: boolean;
    exportZip?: boolean;
    openExternal?: ('codesandbox' | 'stackblitz')[];
    permalink?: boolean;
  };
  height?: number | string;
  theme?: 'system' | 'light' | 'dark' | string;
};

function SandboxBody() {
  const { sandpack } = useSandpack();
  const files = Object.keys(sandpack.files || {});
  const active = sandpack.activeFile;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateRows: 'auto 1fr 1fr',
        height: '100%',
      }}
    >
      <FileTabs
        files={files}
        active={active}
        onChange={(f) => sandpack.openFile(f)}
      />
      <CodeEditor height="100%" showLineNumbers wrap />
      <CodePreview height="100%" />
    </div>
  );
}

export function DocSandbox({
  project,
  height = '70dvh',
  theme,
}: DocSandboxProps) {
  const themeClassName = theme && theme !== 'system' ? theme : undefined;
  // Create reset key from project identifier
  const projectKey = JSON.stringify(project.files.map((f) => f.path).sort());

  return (
    <ErrorBoundary
      resetKeys={[projectKey]}
      onError={(error, errorInfo) => {
        console.error('DocSandbox Error:', error, errorInfo);
      }}
    >
      <CodeWorkbench
        project={project}
        engine="sandpack"
        height={height}
        themeClassName={themeClassName}
      >
        <SandboxBody />
      </CodeWorkbench>
    </ErrorBoundary>
  );
}
