'use client';

import React from 'react';
import dynamic from 'next/dynamic';

// Dynamic import for the Blueprints component to reduce initial bundle size
const Blueprints = dynamic(() => import('@/app/heroes/blueprints'), {
  loading: () => (
    <div style={{ height: '400px', background: 'transparent' }}>
      {/* Placeholder to prevent layout shift */}
    </div>
  ),
  ssr: false,
});

/**
 * Client-side wrapper for dynamically importing the Blueprints component
 * This optimization was part of the performance improvements to reduce initial bundle size
 */
const BlueprintsWrapper: React.FC = () => {
  return <Blueprints />;
};

export default BlueprintsWrapper;
