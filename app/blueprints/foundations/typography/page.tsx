'use client';

import dynamic from 'next/dynamic';
import { InteractiveErrorBoundary } from '@/modules/ErrorBoundary';

// Dynamically import FontInspector for better performance
const FontInspector = dynamic(
  () =>
    import('@/modules/FontInspector').then((mod) => ({
      default: mod.FontInspector,
    })),
  {
    loading: () => (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
          color: 'var(--semantic-color-foreground-secondary)',
        }}
      >
        <div>Loading typography inspector...</div>
      </div>
    ),
    ssr: false, // FontInspector uses Canvas API and complex calculations
  }
);

export default function Page() {
  return (
    <InteractiveErrorBoundary>
      <FontInspector />
    </InteractiveErrorBoundary>
  );
}
