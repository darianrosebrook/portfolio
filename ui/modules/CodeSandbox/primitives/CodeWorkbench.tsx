import type { SandpackFiles, SandpackTheme } from '@codesandbox/sandpack-react';
import {
  SandpackLayout,
  SandpackProvider,
  SandpackThemeProvider,
  useSandpack,
} from '@codesandbox/sandpack-react';
import * as React from 'react';
import type { VirtualProject } from '../types';
import { LoadingState } from './LoadingSpinner';

export type CodeWorkbenchProps = {
  project: VirtualProject;
  engine?: 'sandpack' | 'codemirror' | 'monaco';
  height?: number | string;
  children?: React.ReactNode;
  themeClassName?: string;
};

/**
 * Converts a VirtualProject to Sandpack's file format.
 * Ensures all file contents are strings as required by Sandpack.
 * Automatically adds /props.json if any file imports it.
 * Creates /index.tsx to render the App component if entry is /App.tsx.
 *
 * @param project - The virtual project containing files and metadata
 * @returns Sandpack-compatible file object
 */
function toSandpackFiles(project: VirtualProject): SandpackFiles {
  const out: SandpackFiles = {};
  let needsPropsJson = false;
  const entry = project.entry || '/index.tsx';

  // Check if any file imports /props.json
  for (const f of project.files) {
    const contents =
      typeof f.contents === 'string' ? f.contents : String(f.contents);
    out[f.path] = contents;

    // Check for imports of /props.json
    if (
      contents.includes("from '/props.json'") ||
      contents.includes('from "/props.json"')
    ) {
      needsPropsJson = true;
    }
  }

  // Add /props.json if needed and not already present
  if (needsPropsJson && !out['/props.json']) {
    out['/props.json'] = '{}';
  }

  // If entry is /App.tsx, create /index.tsx to render it
  // Sandpack's react-ts template expects index.tsx to be the entry point
  if (entry === '/App.tsx' && !out['/index.tsx']) {
    out['/index.tsx'] = `import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}`;
  }

  return out;
}

const tokenTheme: SandpackTheme = {
  colors: {
    surface1: 'var(--semantic-components-editor-background)',
    surface2: 'var(--semantic-color-background-secondary)',
    surface3: 'var(--semantic-color-background-tertiary)',
    disabled: 'var(--semantic-color-foreground-disabled)',
    base: 'var(--semantic-color-foreground-primary)',
    clickable: 'var(--semantic-color-foreground-link)',
    hover: 'var(--semantic-color-foreground-hover)',
    accent: 'var(--semantic-color-status-highlight)',
    error: 'var(--semantic-color-status-danger)',
    errorSurface: 'var(--semantic-color-background-danger-subtle)',
    warning: 'var(--semantic-color-status-warning)',
    warningSurface: 'var(--semantic-color-background-warning-subtle)',
  },
  syntax: {
    plain: 'var(--semantic-color-foreground-syntax-plain)',
    comment: {
      color: 'var(--semantic-color-foreground-syntax-comment-color)',
      fontStyle: 'italic',
    },
    keyword: 'var(--semantic-color-foreground-syntax-keyword)',
    definition: 'var(--semantic-color-foreground-syntax-definition)',
    punctuation: 'var(--semantic-color-foreground-syntax-punctuation)',
    property: 'var(--semantic-color-foreground-syntax-property)',
    tag: 'var(--semantic-color-foreground-syntax-tag)',
    static: 'var(--semantic-color-foreground-syntax-static)',
    string: 'var(--semantic-color-foreground-syntax-string)',
  },
  font: {
    body: 'var(--semantic-typography-body-default-font-family)',
    mono: 'var(--core-typography-font-family-monaspace)',
    size: 'var(--semantic-typography-body-default-font-size)',
    lineHeight: 'var(--semantic-typography-line-height-normal)',
  },
};

function SandpackLoadingWrapper({ children }: { children: React.ReactNode }) {
  const { sandpack } = useSandpack();
  const [isInitializing, setIsInitializing] = React.useState(true);
  const sandpackRef = React.useRef(sandpack);

  // Update ref when sandpack changes
  React.useEffect(() => {
    if (sandpack && sandpack !== sandpackRef.current) {
      sandpackRef.current = sandpack;
    }
  }, [sandpack]);

  React.useEffect(() => {
    // Check if Sandpack is ready
    const checkReady = () => {
      // Use ref to access files without dependency on object reference
      if (
        sandpackRef.current.files &&
        Object.keys(sandpackRef.current.files).length > 0
      ) {
        setIsInitializing(false);
      }
    };

    checkReady();

    // Set a timeout to stop showing loading after a reasonable time
    const timeout = setTimeout(() => {
      setIsInitializing(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []); // Empty deps - we use ref to access sandpack

  return (
    <LoadingState
      isLoading={isInitializing}
      message="Initializing sandbox..."
      overlay={true}
    >
      {children}
    </LoadingState>
  );
}

/**
 * Main orchestrator component for code editing and preview functionality.
 * Wraps the selected editor engine (currently Sandpack) with theme integration
 * and loading states.
 *
 * Features:
 * - Engine abstraction (currently supports Sandpack, designed for Monaco/CodeMirror)
 * - Design token integration for theming
 * - Loading state management
 * - Virtual file system support
 *
 * @example
 * ```tsx
 * <CodeWorkbench
 *   project={{
 *     files: [{ path: '/App.tsx', contents: 'export default function App() { return <div>Hello</div>; }' }],
 *     dependencies: { react: '^18.0.0' }
 *   }}
 *   engine="sandpack"
 *   themeClassName="dark-theme"
 * >
 *   <CodeEditor />
 *   <CodePreview />
 * </CodeWorkbench>
 * ```
 *
 * @param props - Configuration options for the code workbench
 */
export function CodeWorkbench({
  project,
  engine = 'sandpack',
  children,
  themeClassName,
}: CodeWorkbenchProps) {
  if (engine !== 'sandpack') {
    // Future: support monaco/codemirror engines
    return <>{children}</>;
  }

  // Simple hash function for content comparison
  const simpleHash = React.useCallback((str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }, []);

  // Stabilize files reference to prevent unnecessary SandpackProvider re-renders
  // Compare by file paths and content hash to detect actual changes
  const filesKey = React.useMemo(
    () =>
      JSON.stringify(
        project.files.map((f) => ({
          path: f.path,
          hash: simpleHash(String(f.contents)),
        }))
      ),
    [project.files, simpleHash]
  );
  const files = React.useMemo(() => toSandpackFiles(project), [filesKey]);

  // Stabilize customSetup to prevent SandpackProvider re-renders
  // Note: When using a template, Sandpack uses its default entry point
  // For react-ts template, that's /index.tsx, which we create automatically
  const customSetupKey = React.useMemo(
    () =>
      JSON.stringify({
        dependencies: project.dependencies,
        devDependencies: project.devDependencies,
      }),
    [project.dependencies, project.devDependencies]
  );
  const customSetup = React.useMemo(
    () => ({
      dependencies: project.dependencies,
      devDependencies: project.devDependencies,
      // Don't set entry when using template - let Sandpack use its default
    }),
    [customSetupKey]
  );

  return (
    <SandpackProvider
      template="react-ts"
      files={files}
      customSetup={customSetup}
    >
      <div className={themeClassName} style={{ height: '100%' }}>
        <SandpackThemeProvider theme={tokenTheme}>
          <SandpackLayout style={{ height: '100%', borderRadius: 0 }}>
            <SandpackLoadingWrapper>{children}</SandpackLoadingWrapper>
          </SandpackLayout>
        </SandpackThemeProvider>
      </div>
    </SandpackProvider>
  );
}
