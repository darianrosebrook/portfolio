'use client';

import { longTextExampleInteractive } from '@/docs/examples/i18n/long-text-example.playground';
import { DocInteractive } from '@/ui/modules/CodeSandbox';

export default function LongTextExamplePage() {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Text Expansion Example</h1>
      <p>
        This example demonstrates how components handle text expansion in
        different languages, ensuring proper layout and truncation.
      </p>
      <DocInteractive {...longTextExampleInteractive} height="600px" />
    </div>
  );
}
