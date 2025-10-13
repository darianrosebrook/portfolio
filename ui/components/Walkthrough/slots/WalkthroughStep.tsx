/** Declarative Step API for Walkthrough */
'use client';
import * as React from 'react';
import { useWalkthrough } from '../WalkthroughProvider';
import type { WalkthroughStepSpec } from '../types';

export interface WalkthroughStepProps extends WalkthroughStepSpec {
  index: number;
}

export const WalkthroughStep: React.FC<WalkthroughStepProps> = (props) => {
  const { index, ...spec } = props;
  const { index: active } = useWalkthrough();

  // No rendering; declarative wrapper can be used for editor tooling later
  React.useEffect(() => {
    // Could register metadata with analytics/editor
  }, []);

  return null;
};
