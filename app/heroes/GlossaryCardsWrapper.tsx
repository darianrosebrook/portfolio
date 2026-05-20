'use client';

import React from 'react';
import GlossaryCards from './glossaryCards';
import { useIsMounted } from '@/utils/hooks';

const LoadingPlaceholder = () => (
  <div
    style={{ height: '400px', background: 'transparent' }}
    aria-hidden="true"
  >
    {/* Placeholder to prevent layout shift while GlossaryCards loads */}
  </div>
);

/**
 * Client-side wrapper for the GlossaryCards component
 * Uses static import with mounted state to avoid webpack chunk loading issues
 * and prevent hydration mismatch
 */
const GlossaryCardsWrapper: React.FC = () => {
  const mounted = useIsMounted();

  if (!mounted) {
    return <LoadingPlaceholder />;
  }

  return <GlossaryCards />;
};

export default GlossaryCardsWrapper;
