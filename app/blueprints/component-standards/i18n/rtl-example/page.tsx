'use client';

import { rtlExampleInteractive } from '../../_lib/examples/i18n/rtl-example.playground';
import { DocInteractive } from '@/ui/modules/CodeSandbox';

export default function RTLExamplePage() {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>RTL Layout Example</h1>
      <p>
        This example demonstrates how components adapt to right-to-left (RTL)
        text direction for languages like Arabic and Hebrew.
      </p>
      <DocInteractive
        {...rtlExampleInteractive}
        height="600px"
        preview={{
          ...rtlExampleInteractive.preview,
          runtime: rtlExampleInteractive.preview?.runtime || 'inline',
          dir: 'ltr', // Can be toggled via PreviewControls
        }}
      />
    </div>
  );
}
