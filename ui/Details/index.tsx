/**
 * Details component exports
 *
 * @author @darianrosebrook
 */

export { default as Details } from './Details';
export type { DetailsProps } from './Details';

// Re-export as default for convenience
export { default } from './Details';

// Group utility to coordinate multiple Details
import * as React from 'react';
import DetailsComp from './Details';

export const DetailsGroup = ({
  children,
  multipleOpen = false,
  className = '',
}: {
  children: React.ReactNode;
  multipleOpen?: boolean;
  className?: string;
}) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === DetailsComp) {
          return React.cloneElement(child, {
            multipleOpen,
          } as React.ComponentProps<typeof DetailsComp>);
        }
        return child;
      })}
    </div>
  );
};
