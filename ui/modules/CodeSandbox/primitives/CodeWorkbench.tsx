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

function toSandpackFiles(project: VirtualProject): SandpackFiles {
  const out: SandpackFiles = {};
  for (const f of project.files) {
    out[f.path] =
      typeof f.contents === 'string' ? f.contents : String(f.contents);
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

  React.useEffect(() => {
    // Check if Sandpack is ready
    const checkReady = () => {
      // Use sandpack.files to check if it's initialized instead of status
      if (sandpack.files && Object.keys(sandpack.files).length > 0) {
        setIsInitializing(false);
      }
    };

    checkReady();

    // Set a timeout to stop showing loading after a reasonable time
    const timeout = setTimeout(() => {
      setIsInitializing(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, [sandpack.files]);

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

  const files = React.useMemo(() => toSandpackFiles(project), [project]);

  return (
    <SandpackProvider
      template="react-ts"
      files={files}
      customSetup={{
        dependencies: project.dependencies,
        devDependencies: project.devDependencies,
        entry: project.entry,
      }}
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
