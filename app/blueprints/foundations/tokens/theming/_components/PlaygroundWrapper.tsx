'use client';

import { useEffect } from 'react';
import { useBrand } from '@/context';

export function PlaygroundWrapper({ children }: { children: React.ReactNode }) {
  const { resetBrand } = useBrand();

  useEffect(() => {
    return () => {
      resetBrand();
    };
  }, [resetBrand]);

  return <>{children}</>;
}
