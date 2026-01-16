'use client';

import { useState, useCallback } from 'react';
import { rtlExampleInteractive } from '../../_lib/examples/i18n/rtl-example.playground';
import { DocInteractive } from '@/ui/modules/CodeSandbox';
import { PreviewControls } from '@/ui/modules/CodeSandbox/primitives';
import { trackRTLToggle, trackThemeChange } from '../../_lib/analytics';

export default function RTLExamplePage() {
  const [isRTL, setIsRTL] = useState(false);
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');

  const handleRTLChange = useCallback((newIsRTL: boolean) => {
    setIsRTL(newIsRTL);
    trackRTLToggle('RTLExample', newIsRTL);
  }, []);

  const handleThemeChange = useCallback((newTheme: 'system' | 'light' | 'dark' | string) => {
    setTheme(newTheme as 'system' | 'light' | 'dark');
    trackThemeChange('RTLExample', newTheme as 'light' | 'dark' | 'system');
  }, []);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>RTL Layout Example</h1>
      <p>
        This example demonstrates how components adapt to right-to-left (RTL)
        text direction for languages like Arabic and Hebrew.
      </p>

      <div style={{ marginBottom: '16px' }}>
        <PreviewControls
          theme={theme}
          onThemeChange={handleThemeChange}
          isRTL={isRTL}
          onRTLChange={handleRTLChange}
          showRTLToggle={true}
          showThemeSwitcher={true}
        />
      </div>

      <DocInteractive
        {...rtlExampleInteractive}
        height="600px"
        preview={{
          ...rtlExampleInteractive.preview,
          runtime: rtlExampleInteractive.preview?.runtime || 'inline',
          theme: theme,
          dir: isRTL ? 'rtl' : 'ltr',
        }}
      />

      <div style={{ marginTop: '24px' }}>
        <h2>Best Practices for RTL Support</h2>
        <ul style={{ lineHeight: 1.6 }}>
          <li>Use CSS logical properties (<code>margin-inline-start</code>, <code>padding-inline-end</code>) instead of physical properties</li>
          <li>Use <code>flexbox</code> and <code>grid</code> which automatically handle RTL layouts</li>
          <li>Avoid hardcoded directional icons - use mirrored versions for RTL</li>
          <li>Test your components with actual RTL content, not just the <code>dir</code> attribute</li>
          <li>Consider text expansion - Arabic text is often 20-30% longer than English</li>
        </ul>
      </div>
    </div>
  );
}
