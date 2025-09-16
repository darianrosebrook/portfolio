/** Anchor helper for Walkthrough */
'use client';
import * as React from 'react';

export interface WalkthroughAnchorProps {
  children: React.ReactNode;
  onRef?(el: HTMLElement): void;
}

/** Wraps a child to expose a stable element for `target: HTMLElement` steps */
export const WalkthroughAnchor: React.FC<WalkthroughAnchorProps> = ({
  children,
  onRef,
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (ref.current) {
      onRef?.(ref.current);
    }
  }, [onRef]);

  return <div ref={ref}>{children}</div>;
};
