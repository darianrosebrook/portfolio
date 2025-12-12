'use client';

import React, { useEffect, useState } from 'react';
import Blueprints from '@/app/heroes/blueprints';

const LoadingPlaceholder = () => (
  <div
    style={{ height: '400px', background: 'transparent' }}
    aria-hidden="true"
  >
    {/* Placeholder to prevent layout shift while Blueprints loads */}
  </div>
);

/**
 * Client-side wrapper for the Blueprints component
 * Uses static import instead of dynamic to avoid webpack chunk loading issues
 * The mounted state ensures we only render on the client to prevent hydration mismatch
 */
const BlueprintsWrapper: React.FC = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render Blueprints on the client to avoid hydration mismatch
  if (!mounted) {
    return <LoadingPlaceholder />;
  }

  return <Blueprints />;
};

export default BlueprintsWrapper;
