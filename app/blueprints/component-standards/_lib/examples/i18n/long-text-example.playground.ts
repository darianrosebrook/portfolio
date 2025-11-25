/**
 * Long Text Example Playground
 * @author @darianrosebrook
 *
 * Interactive example demonstrating how components handle text expansion
 * in different languages.
 */

import type { DocInteractiveProps } from '@/ui/modules/CodeSandbox/variants/DocInteractive';

export const longTextExampleInteractive: DocInteractiveProps = {
  project: {
    files: [
      {
        path: '/App.tsx',
        contents: `import React, { useState } from 'react';

const translations = {
  en: {
    button: 'Submit',
    title: 'Welcome',
    description: 'This is a short description.',
  },
  de: {
    button: 'Einreichen',
    title: 'Willkommen',
    description: 'Dies ist eine kurze Beschreibung des Inhalts.',
  },
  fr: {
    button: 'Soumettre',
    title: 'Bienvenue',
    description: 'Ceci est une courte description du contenu.',
  },
  ru: {
    button: 'Отправить',
    title: 'Добро пожаловать',
    description: 'Это краткое описание содержимого данного раздела.',
  },
  ja: {
    button: '送信',
    title: 'ようこそ',
    description: 'これはコンテンツの簡単な説明です。',
  },
};

type Locale = keyof typeof translations;

export default function LongTextExample() {
  const [locale, setLocale] = useState<Locale>('en');
  const t = translations[locale];

  return (
    <div style={{ padding: '24px', fontFamily: 'system-ui' }}>
      <h2>Text Expansion Demo</h2>
      
      <label style={{ display: 'block', marginBottom: '16px' }}>
        Select Language:
        <select
          value={locale}
          onChange={(e) => setLocale(e.target.value as Locale)}
          style={{ marginLeft: '8px', padding: '4px 8px' }}
        >
          <option value="en">English</option>
          <option value="de">German</option>
          <option value="fr">French</option>
          <option value="ru">Russian</option>
          <option value="ja">Japanese</option>
        </select>
      </label>

      <div style={{ display: 'grid', gap: '16px', maxWidth: '300px' }}>
        {/* Fixed-width button - may truncate or overflow */}
        <div>
          <h3 style={{ margin: '0 0 8px' }}>Fixed Width Button</h3>
          <button
            style={{
              width: '100px',
              padding: '8px 16px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {t.button}
          </button>
        </div>

        {/* Flexible button - grows with content */}
        <div>
          <h3 style={{ margin: '0 0 8px' }}>Flexible Button</h3>
          <button
            style={{
              padding: '8px 16px',
              whiteSpace: 'nowrap',
            }}
          >
            {t.button}
          </button>
        </div>

        {/* Card with text */}
        <div
          style={{
            padding: '16px',
            background: '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ margin: '0 0 8px' }}>{t.title}</h3>
          <p style={{ margin: 0, lineHeight: 1.5 }}>{t.description}</p>
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
      id: 'translations',
      title: 'Translation Strings',
      code: {
        file: '/App.tsx',
        lines: [3, 27],
      },
    },
    {
      id: 'fixed-width',
      title: 'Fixed Width Elements',
      code: {
        file: '/App.tsx',
        lines: [54, 66],
      },
    },
    {
      id: 'flexible-width',
      title: 'Flexible Elements',
      code: {
        file: '/App.tsx',
        lines: [69, 79],
      },
    },
  ],
  preview: {
    runtime: 'iframe',
    device: 'desktop',
    theme: 'system',
  },
};
