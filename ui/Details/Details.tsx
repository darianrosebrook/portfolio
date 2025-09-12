/**
 * Details component for creating collapsible content sections
 * Perfect for case studies with Problem/Solution/Results sections
 *
 * @author @darianrosebrook
 */
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
  /**
   * Inline vs block display
   */
  inline?: boolean;
  /**
   * Allow multiple to be open
   */
  multipleOpen?: boolean;
  /**
   * Alias for open prop
   */
  defaultOpen?: boolean;
  /**
   * Icon placement
   */
  iconPosition?: 'left' | 'right';
  /**
   * Toggle icon visibility
   */
  showIcon?: boolean;
  /**
   * Disable interaction
   */
  disabled?: boolean;
  /**
   * For accessibility
   */
  id?: string; // For accessibility
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const Details = React.forwardRef<HTMLDetailsElement, DetailsProps>(
  (
    {
      open,
      defaultOpen = false,
      summary,
      children,
      className = '',
      onToggle,
      inline = false,
      multipleOpen = false,
      iconPosition = 'left',
      showIcon = true,
      disabled = false,
      id,
      onKeyDown,
      ...rest
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = React.useState(() => {
      if (open !== undefined) return open;
      return defaultOpen;
    });
    const detailsRef = React.useRef<HTMLDetailsElement>(null);

    // Combine refs
    React.useImperativeHandle(ref, () => detailsRef.current!);

    // Keep internal state in sync when controlled
    React.useEffect(() => {
      if (open !== undefined && detailsRef.current) {
        detailsRef.current.open = open;
        setIsOpen(open);
      }
    }, [open]);

    const handleToggle = React.useCallback(() => {
      if (disabled) return;
      const newOpen = !isOpen;
      setIsOpen(newOpen);
      onToggle?.(newOpen);
    }, [isOpen, onToggle, disabled]);

    const handleDetailsToggle = React.useCallback(
      (e: React.SyntheticEvent) => {
        if (disabled) {
          e.preventDefault();
          return;
        }
        if (!multipleOpen) {
          const detailsElements = document.querySelectorAll('details');
          detailsElements.forEach((el) => {
            if (el !== detailsRef.current && el.open) {
              (el as HTMLDetailsElement).open = false;
            }
          });
        }
        handleToggle();
      },
      [multipleOpen, handleToggle, disabled]
    );

    const uniqueId = React.useMemo(
      () => id || `details-${Math.random().toString(36).slice(2, 11)}`,
      [id]
    );

    const handleKeyDownInternal = React.useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggle();
        }
        onKeyDown?.(e);
      },
      [handleToggle, onKeyDown]
    );

    const icon = isOpen ? (
      <ChevronDownIcon className={styles.icon} />
    ) : (
      <ChevronRightIcon className={styles.icon} />
    );

    return (
      <details
        ref={detailsRef}
        id={uniqueId}
        open={isOpen}
        className={[
          styles.details,
          inline ? styles.inline : '',
          disabled ? styles.disabled : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        onToggle={handleDetailsToggle}
        aria-disabled={disabled || undefined}
        {...rest}
      >
        <summary className={styles.summary} onKeyDown={handleKeyDownInternal}>
          <span className={styles.summaryContent}>
            {iconPosition === 'left' && showIcon ? icon : null}
            <span className={styles.summaryText}>{summary}</span>
            {iconPosition === 'right' && showIcon ? icon : null}
          </span>
        </summary>
        <div className={styles.content}>{children}</div>
      </details>
    );
  }
);

Details.displayName = 'Details';

export default Details;
