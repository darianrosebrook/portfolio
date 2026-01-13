declare module '@codesandbox/sandpack-react' {
  import * as React from 'react';

  // Sandpack files can be strings or objects with code and hidden properties
  export type SandpackFileContent = string | { code: string; hidden?: boolean };
  export type SandpackFiles = Record<string, SandpackFileContent>;

  export interface SandpackTheme {
    colors?: Record<string, unknown>;
    syntax?: Record<string, unknown>;
    font?: Record<string, unknown>;
  }

  export interface SandpackProviderProps {
    template?: string;
    files?: SandpackFiles;
    /** Sandpack UI options accepted by current version we use */
    options?: {
      showLineNumbers?: boolean;
      showInlineErrors?: boolean;
      wrapContent?: boolean;
      readOnly?: boolean;
      editorHeight?: number | string;
      activeFile?: string;
      visibleFiles?: string[];
      showTabs?: boolean;
      closableTabs?: boolean;
      /** Custom addition used in our docs to highlight a line range like "10-20" */
      highlightedLines?: string;
      /** Sandpack initialization and execution options */
      initMode?: 'lazy' | 'immediate' | 'user-visible';
      autorun?: boolean;
      recompileMode?: 'lazy' | 'immediate';
      autoReload?: boolean;
    };
    customSetup?: {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
      entry?: string;
    };
    children?: React.ReactNode;
    /** Theme can be one of the exported themes or a custom theme object */
    theme?: SandpackTheme | Record<string, unknown> | unknown;
  }

  export const SandpackProvider: React.FC<SandpackProviderProps>;
  export const SandpackThemeProvider: React.FC<{
    theme: SandpackTheme;
    children?: React.ReactNode;
  }>;
  export const SandpackLayout: React.FC<React.HTMLAttributes<HTMLDivElement>>;

  export const Sandpack: React.FC<SandpackProviderProps>;

  export interface UseSandpackReturn {
    sandpack: {
      files: Record<string, unknown>;
      activeFile: string;
      openFile: (path: string) => void;
      updateFile?: (path: string, code: string) => void;
    };
  }
  export function useSandpack(): UseSandpackReturn;

  export interface SandpackCodeEditorProps {
    showLineNumbers?: boolean;
    showInlineErrors?: boolean;
    wrapContent?: boolean;
    readOnly?: boolean;
    style?: React.CSSProperties;
    decorators?: Array<{ file: string; line: number; className?: string }>;
  }
  export const SandpackCodeEditor: React.FC<SandpackCodeEditorProps>;

  export interface SandpackPreviewProps {
    style?: React.CSSProperties;
  }
  export const SandpackPreview: React.FC<SandpackPreviewProps>;
}
