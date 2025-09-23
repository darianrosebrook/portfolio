import { SandpackPreview } from '@codesandbox/sandpack-react';
import * as React from 'react';

export type CodePreviewProps = {
  runtime?: 'iframe' | 'inline';
  height?: number | string;
};

export const CodePreview = React.memo(function CodePreview({
  runtime = 'iframe',
  height = '100%',
}: CodePreviewProps) {
  // SandpackPreview defaults to iframe; inline not supported directly here.
  return <SandpackPreview style={{ height }} />;
});
