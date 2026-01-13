'use client';

import dynamic from 'next/dynamic';
import { InteractiveErrorBoundary } from '@/ui/modules/ErrorBoundary';

// Dynamically import FontInspector for better performance
const FontInspector = dynamic(
  () =>
    import('@/ui/modules/FontInspector')
      .then((mod) => ({
        default: mod.FontInspector,
      }))
      .catch((error) => {
        console.error('Failed to load FontInspector:', error);
        throw error;
      }),
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
