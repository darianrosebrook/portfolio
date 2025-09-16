/**
 * Image (Primitive)
 * Generated via scaffold CLI.
 */
'use client';
import * as React from 'react';
import styles from './Image.module.scss';

export interface ImageProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Image: React.FC<ImageProps> = ({ className = '', children, ...rest }) => {
  return (
    <div className={[styles.image, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </div>
  );
};
Image.displayName = 'Image';

export default Image;
