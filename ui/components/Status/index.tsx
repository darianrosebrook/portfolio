/**
 * @deprecated Status has been consolidated into Badge component.
 * Use Badge with variant="status" instead.
 * This alias will be removed in a future version.
 */
import React from 'react';
import Badge, { BadgeProps } from '../Badge';
import { Intent } from '@/types/ui';

export interface StatusProps extends Omit<BadgeProps, 'variant' | 'intent'> {
  /**
   * Status type (maps to Badge intent)
   */
  status: Intent | 'error';
}

const Status: React.FC<StatusProps> = ({ status, ...props }) => {
  // Normalize 'error' to 'danger' for consistency
  const intent: Intent = status === 'error' ? 'danger' : (status as Intent);

  return <Badge variant="status" intent={intent} {...props} />;
};

export default Status;
