'use client';

import React, { useEffect, useState } from 'react';
import GlossaryCards from './glossaryCards';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <LoadingPlaceholder />;
  }

  return <GlossaryCards />;
};

export default GlossaryCardsWrapper;
