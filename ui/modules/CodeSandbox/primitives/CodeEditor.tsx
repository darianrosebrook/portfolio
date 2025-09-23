import { SandpackCodeEditor } from '@codesandbox/sandpack-react';
import * as React from 'react';

export type CodeEditorProps = {
  engine?: 'sandpack' | 'codemirror' | 'monaco';
  readOnly?: boolean;
  showLineNumbers?: boolean;
  wrap?: boolean;
  height?: number | string;
  decorators?: Array<{ file: string; line: number; className?: string }>;
};

export const CodeEditor = React.memo(function CodeEditor({
  engine = 'sandpack',
  readOnly,
  showLineNumbers = true,
  wrap = true,
  height = '100%',
  decorators,
}: CodeEditorProps) {
  if (engine !== 'sandpack') return null;
  return (
    <SandpackCodeEditor
      showLineNumbers={showLineNumbers}
      showInlineErrors
      wrapContent={wrap}
      readOnly={readOnly}
      style={{ height }}
      decorators={decorators}
    />
  );
});
