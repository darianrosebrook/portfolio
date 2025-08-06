'use client';

import dynamic from 'next/dynamic';

// Dynamically import Blueprints for better performance
const Blueprints = dynamic(() => import('./heroes/blueprints'), {
  loading: () => (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'var(--color-background-primary)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        color: 'var(--color-foreground-secondary)',
      }}
    >
      <div>Loading...</div>
    </div>
  ),
  ssr: false, // Blueprints uses complex animations
});

export default function BlueprintsWrapper() {
  return <Blueprints />;
}
