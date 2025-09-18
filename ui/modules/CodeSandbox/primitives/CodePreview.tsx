import * as React from 'react';
import { SandpackPreview } from '@codesandbox/sandpack-react';

export type CodePreviewProps = {
  runtime?: 'iframe' | 'inline';
  height?: number | string;
};

export function CodePreview({
  runtime = 'iframe',
  height = '100%',
}: CodePreviewProps) {
  // SandpackPreview defaults to iframe; inline not supported directly here.
  return <SandpackPreview style={{ height }} />;
}
