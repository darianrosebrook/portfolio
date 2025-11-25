/**
 * RTL Layout Example Playground
 * @author @darianrosebrook
 *
 * Interactive example demonstrating how components adapt to right-to-left
 * text direction for languages like Arabic and Hebrew.
 */

import type { DocInteractiveProps } from '@/ui/modules/CodeSandbox/variants/DocInteractive';

export const rtlExampleInteractive: DocInteractiveProps = {
  project: {
    files: [
      {
        path: '/App.tsx',
        contents: `import React, { useState } from 'react';

const content = {
  ltr: {
    title: 'Welcome to Our App',
    description: 'This is a left-to-right layout example.',
    button: 'Get Started',
    items: ['First item', 'Second item', 'Third item'],
  },
  rtl: {
    title: 'مرحبا بكم في تطبيقنا',
    description: 'هذا مثال على تخطيط من اليمين إلى اليسار.',
    button: 'ابدأ الآن',
    items: ['العنصر الأول', 'العنصر الثاني', 'العنصر الثالث'],
  },
};

type Direction = 'ltr' | 'rtl';

export default function RTLExample() {
  const [dir, setDir] = useState<Direction>('ltr');
  const t = content[dir];

  return (
    <div
      dir={dir}
      style={{
        padding: '24px',
        fontFamily: dir === 'rtl' ? 'system-ui, Arial' : 'system-ui',
      }}
    >
      <h2>RTL Layout Demo</h2>
      
      <label style={{ display: 'block', marginBottom: '16px' }}>
        Text Direction:
        <select
          value={dir}
          onChange={(e) => setDir(e.target.value as Direction)}
          style={{ marginInlineStart: '8px', padding: '4px 8px' }}
        >
          <option value="ltr">Left-to-Right (English)</option>
          <option value="rtl">Right-to-Left (Arabic)</option>
        </select>
      </label>

      <div style={{ display: 'grid', gap: '16px', maxWidth: '400px' }}>
        {/* Card with logical properties */}
        <div
          style={{
            padding: '16px',
            background: '#f5f5f5',
            borderRadius: '8px',
            borderInlineStart: '4px solid #0066cc',
          }}
        >
          <h3 style={{ margin: '0 0 8px' }}>{t.title}</h3>
          <p style={{ margin: '0 0 16px' }}>{t.description}</p>
          <button
            style={{
              padding: '8px 16px',
              background: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            {t.button} →
          </button>
        </div>

        {/* List with inline layout */}
        <div
          style={{
            padding: '16px',
            background: '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ margin: '0 0 12px' }}>
            {dir === 'ltr' ? 'Items' : 'العناصر'}
          </h3>
          <ul
            style={{
              margin: 0,
              paddingInlineStart: '20px',
              listStyle: 'disc',
            }}
          >
            {t.items.map((item, i) => (
              <li key={i} style={{ marginBottom: '4px' }}>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Icon + text alignment */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            background: '#e8f4ff',
            borderRadius: '8px',
          }}
        >
          <span style={{ fontSize: '24px' }}>📧</span>
          <span>{dir === 'ltr' ? 'Email notifications enabled' : 'تم تفعيل إشعارات البريد'}</span>
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
      id: 'direction-toggle',
      title: 'Direction Toggle',
      prose: 'The dir attribute controls the text direction for the entire container.',
      code: {
        file: '/App.tsx',
        lines: [24, 30],
      },
    },
    {
      id: 'logical-properties',
      title: 'Logical Properties',
      prose: 'CSS logical properties like margin-inline-start adapt to text direction automatically.',
      code: {
        file: '/App.tsx',
        lines: [46, 52],
      },
    },
    {
      id: 'border-inline',
      title: 'Directional Borders',
      prose: 'border-inline-start creates a border on the starting edge regardless of direction.',
      code: {
        file: '/App.tsx',
        lines: [57, 61],
      },
    },
  ],
  preview: {
    runtime: 'inline',
    device: 'desktop',
    theme: 'system',
    dir: 'ltr',
  },
};

