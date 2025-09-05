'use client';
import * as React from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import styles from './Details.module.scss';

export interface DetailsProps {
  /**
   * Whether the details section is open by default
   */
  open?: boolean;
  /**
   * The summary text displayed in the toggle button
   */
  summary: string;
  /**
   * The content to be displayed when expanded
   */
  children: React.ReactNode;
  /**
   * Additional CSS class names
   */
  className?: string;
  /**
   * Callback when the open state changes
   */
  onToggle?: (open: boolean) => void;
}

/**
 * Details component for creating collapsible content sections
 * Perfect for case studies with Problem/Solution/Results sections
 *
 * @author @darianrosebrook
 */
const Details = React.forwardRef<HTMLDetailsElement, DetailsProps>(
  ({ open = false, summary, children, className = '', onToggle }, ref) => {
    const [isOpen, setIsOpen] = React.useState(open);
    const detailsRef = React.useRef<HTMLDetailsElement>(null);

    // Combine refs
    React.useImperativeHandle(ref, () => detailsRef.current!);

    const handleToggle = React.useCallback(() => {
      const newOpen = !isOpen;
      setIsOpen(newOpen);
      onToggle?.(newOpen);
    }, [isOpen, onToggle]);

    return (
      <details
        ref={detailsRef}
        open={isOpen}
        className={`${styles.details} ${className}`}
        onToggle={handleToggle}
      >
        <summary className={styles.summary}>
          <span className={styles.summaryContent}>
            {isOpen ? (
              <ChevronDownIcon className={styles.icon} />
            ) : (
              <ChevronRightIcon className={styles.icon} />
            )}
            <span className={styles.summaryText}>{summary}</span>
          </span>
        </summary>
        <div className={styles.content}>{children}</div>
      </details>
    );
  }
);

Details.displayName = 'Details';

export default Details;
