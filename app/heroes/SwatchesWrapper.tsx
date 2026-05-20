'use client';

import React from 'react';
import { Swatches } from './swatches';
import { useIsMounted } from '@/utils/hooks';

const LoadingPlaceholder = () => (
  <div
    style={{ height: '400px', background: 'transparent' }}
    aria-hidden="true"
  >
    {/* Placeholder to prevent layout shift while Swatches loads */}
  </div>
);

/**
 * Client-side wrapper for the Swatches component
 * Uses static import with mounted state to avoid webpack chunk loading issues
 * and prevent hydration mismatch
 */
const SwatchesWrapper: React.FC = () => {
  const mounted = useIsMounted();

  if (!mounted) {
    return <LoadingPlaceholder />;
  }

  return <Swatches />;
};

export default SwatchesWrapper;
