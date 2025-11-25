'use client';

import { dateFormattingExampleInteractive } from '../../_lib/examples/i18n/date-formatting.playground';
import { DocInteractive } from '@/ui/modules/CodeSandbox';

export default function DateFormattingExamplePage() {
  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Date & Number Formatting Example</h1>
      <p>
        This example demonstrates locale-aware formatting using the Intl API for
        dates, numbers, and currencies.
      </p>
      <DocInteractive {...dateFormattingExampleInteractive} height="600px" />
    </div>
  );
}
