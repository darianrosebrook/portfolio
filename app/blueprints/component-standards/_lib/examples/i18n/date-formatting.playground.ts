/**
 * Date Formatting Playground
 * @author @darianrosebrook
 *
 * Interactive example demonstrating locale-aware date and number formatting
 * using the Intl API.
 */

import type { DocInteractiveProps } from '@/ui/modules/CodeSandbox/variants/DocInteractive';

export const dateFormattingExampleInteractive: DocInteractiveProps = {
  project: {
    files: [
      {
        path: '/App.tsx',
        contents: `import React, { useState } from 'react';

const locales = ['en-US', 'de-DE', 'ja-JP', 'ar-SA', 'fr-FR'];

export default function DateFormattingExample() {
  const [locale, setLocale] = useState('en-US');
  const now = new Date();
  const amount = 1234567.89;

  const dateFormatter = new Intl.DateTimeFormat(locale, {
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const numberFormatter = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: locale === 'ja-JP' ? 'JPY' : locale === 'de-DE' || locale === 'fr-FR' ? 'EUR' : 'USD',
  });

  const relativeFormatter = new Intl.RelativeTimeFormat(locale, {
    numeric: 'auto',
  });

  return (
    <div style={{ padding: '24px', fontFamily: 'system-ui' }}>
      <h2>Locale-Aware Formatting</h2>
      
      <label style={{ display: 'block', marginBottom: '16px' }}>
        Select Locale:
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value)}
          style={{ marginLeft: '8px', padding: '4px 8px' }}
        >
          {locales.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
      </label>

      <div style={{ display: 'grid', gap: '16px' }}>
        <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 8px' }}>Date & Time</h3>
          <p style={{ margin: 0, fontSize: '18px' }}>{dateFormatter.format(now)}</p>
        </div>

        <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 8px' }}>Currency</h3>
          <p style={{ margin: 0, fontSize: '18px' }}>{numberFormatter.format(amount)}</p>
        </div>

        <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
          <h3 style={{ margin: '0 0 8px' }}>Relative Time</h3>
          <p style={{ margin: 0, fontSize: '18px' }}>{relativeFormatter.format(-1, 'day')}</p>
          <p style={{ margin: '4px 0 0', fontSize: '18px' }}>{relativeFormatter.format(2, 'week')}</p>
        </div>
      </div>
    </div>
  );
}`,
      },
    ],
    entry: '/App.tsx',
  },
  sections: [
    {
      id: 'locale-selection',
      title: 'Locale Selection',
      prose: 'Users can select different locales to see how formatting changes.',
      code: {
        file: '/App.tsx',
        lines: [6, 6],
      },
    },
    {
      id: 'date-formatting',
      title: 'Date Formatting',
      prose: 'Intl.DateTimeFormat provides locale-aware date and time formatting.',
      code: {
        file: '/App.tsx',
        lines: [10, 13],
      },
    },
    {
      id: 'number-formatting',
      title: 'Number & Currency',
      prose: 'Intl.NumberFormat handles numbers, percentages, and currencies.',
      code: {
        file: '/App.tsx',
        lines: [15, 18],
      },
    },
  ],
  preview: {
    runtime: 'iframe',
    device: 'desktop',
    theme: 'system',
  },
};

