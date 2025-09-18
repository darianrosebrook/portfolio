/**
 * Details Composer - Provider-based orchestration with slots
 *
 * Layer: Composer
 * Meta-patterns: Context provider, slotting & substitution, headless logic
 *
 * Before: 6 boolean props (inline, multipleOpen, defaultOpen, showIcon, disabled)
 * After: Provider pattern with context orchestration and slots
 *
 * @author @darianrosebrook
 */
'use client';
import React, { useEffect, useCallback } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { useDetails, type UseDetailsOptions } from './useDetails';
import { useDetailsContext } from './DetailsProvider';
import styles from './Details.module.scss';

export interface DetailsProps extends UseDetailsOptions {
  /** The summary text displayed in the toggle button */
  summary: string;
  /** The content to be displayed when expanded */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Visual variant - replaces boolean props */
  variant?: 'default' | 'inline' | 'compact';
  /** Icon configuration - replaces showIcon + iconPosition booleans */
  icon?: 'left' | 'right' | 'none';
  /** Custom keyboard handler */
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const Details = React.forwardRef<HTMLDetailsElement, DetailsProps>(
  (props, ref) => {
    const {
      summary,
      children,
      className = '',
      variant = 'default',
      icon = 'left',
      onKeyDown,
      ...detailsOptions
    } = props;

    const detailsApi = useDetails(detailsOptions);
    const { isOpen, id, toggle, disabled, ariaAttributes } = detailsApi;

    // Try to get group context (optional)
    let groupContext;
    try {
      groupContext = useDetailsContext();
    } catch {
      // Not in a provider, that's fine
      groupContext = null;
    }

    // Register with group if in a provider
    useEffect(() => {
      if (groupContext) {
        groupContext.registerDetails(id, isOpen);
        return () => groupContext.unregisterDetails(id);
      }
    }, [groupContext, id, isOpen]);

    // Handle toggle with group coordination
    const handleToggle = useCallback(() => {
      if (disabled) return;

      const newOpen = !isOpen;

      if (groupContext) {
        groupContext.handleToggle(id, newOpen);
      }

      // Always call the local toggle for state management
      toggle();
    }, [disabled, isOpen, groupContext, id, toggle]);

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleToggle();
        }
        onKeyDown?.(e);
      },
      [handleToggle, onKeyDown]
    );

    const iconElement = isOpen ? (
      <ChevronDownIcon className={styles.icon} />
    ) : (
      <ChevronRightIcon className={styles.icon} />
    );

    return (
      <details
        ref={ref}
        id={id}
        open={isOpen}
        className={[styles.details, className].filter(Boolean).join(' ')}
        data-variant={variant}
        data-icon={icon}
        data-state={isOpen ? 'open' : 'closed'}
        data-disabled={disabled || undefined}
        {...ariaAttributes}
      >
        <summary className={styles.summary} onKeyDown={handleKeyDown}>
          <span className={styles.summaryContent}>
            {icon === 'left' ? iconElement : null}
            <span className={styles.summaryText}>{summary}</span>
            {icon === 'right' ? iconElement : null}
          </span>
        </summary>
        <div className={styles.content}>{children}</div>
      </details>
    );
  }
);

Details.displayName = 'Details';

// Slot components for composition
export const DetailsInline = React.forwardRef<
  HTMLDetailsElement,
  Omit<DetailsProps, 'variant'>
>((props, ref) => <Details {...props} ref={ref} variant="inline" />);
DetailsInline.displayName = 'Details.Inline';

export const DetailsCompact = React.forwardRef<
  HTMLDetailsElement,
  Omit<DetailsProps, 'variant' | 'icon'>
>((props, ref) => (
  <Details {...props} ref={ref} variant="compact" icon="none" />
));
DetailsCompact.displayName = 'Details.Compact';

export { Details };
export default Details;
