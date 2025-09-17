/**
 * Details component - Compositional approach to reduce boolean prop explosion
 *
 * Before: 6 boolean props (inline, multipleOpen, defaultOpen, showIcon, disabled)
 * After: Composition with data attributes and cleaner prop API
 */
'use client';
import * as React from 'react';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import styles from './Details.module.scss';

// Simplified props - removed boolean explosion
export interface DetailsProps {
  /**
   * Whether the details section is open (controlled)
   */
  open?: boolean;
  /**
   * Default open state (uncontrolled)
   */
  defaultOpen?: boolean;
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
   * Variant styling - replaces boolean props
   */
  variant?: 'default' | 'inline' | 'compact';
  /**
   * Icon configuration - replaces showIcon + iconPosition booleans
   */
  icon?: 'left' | 'right' | 'none';
  /**
   * Disabled state
   */
  disabled?: boolean;
  /**
   * For accessibility
   */
  id?: string;
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
      variant = 'default',
      icon = 'left',
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
        handleToggle();
      },
      [handleToggle, disabled]
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

    const iconElement = isOpen ? (
      <ChevronDownIcon className={styles.icon} />
    ) : (
      <ChevronRightIcon className={styles.icon} />
    );

    return (
      <details
        ref={detailsRef}
        id={uniqueId}
        open={isOpen}
        className={[styles.details, className].filter(Boolean).join(' ')}
        onToggle={handleDetailsToggle}
        aria-disabled={disabled || undefined}
        // Use data attributes instead of boolean prop classes
        data-variant={variant}
        data-icon={icon}
        data-state={isOpen ? 'open' : 'closed'}
        data-disabled={disabled || undefined}
        {...rest}
      >
        <summary className={styles.summary} onKeyDown={handleKeyDownInternal}>
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

// Composition components for common patterns
export const DetailsInline = React.forwardRef<
  HTMLDetailsElement,
  Omit<DetailsProps, 'variant'>
>((props, ref) => <Details {...props} ref={ref} variant="inline" />);
DetailsInline.displayName = 'Details.Inline';

export const DetailsCompact = React.forwardRef<
  HTMLDetailsElement,
  Omit<DetailsProps, 'variant'>
>((props, ref) => (
  <Details {...props} ref={ref} variant="compact" icon="none" />
));
DetailsCompact.displayName = 'Details.Compact';

// Group component for coordinating multiple Details
export interface DetailsGroupProps {
  children: React.ReactNode;
  className?: string;
  /**
   * Allow multiple details to be open simultaneously
   */
  allowMultiple?: boolean;
}

export const DetailsGroup: React.FC<DetailsGroupProps> = ({
  children,
  className = '',
  allowMultiple = false,
}) => {
  const [openItems, setOpenItems] = React.useState<Set<string>>(new Set());

  const handleToggle = React.useCallback(
    (id: string, isOpen: boolean) => {
      setOpenItems((prev) => {
        const newSet = new Set(prev);
        if (isOpen) {
          if (!allowMultiple) {
            newSet.clear();
          }
          newSet.add(id);
        } else {
          newSet.delete(id);
        }
        return newSet;
      });
    },
    [allowMultiple]
  );

  return (
    <div className={className} data-allow-multiple={allowMultiple}>
      {React.Children.map(children, (child, index) => {
        if (React.isValidElement(child) && child.type === Details) {
          const childId = child.props.id || `details-group-${index}`;
          return React.cloneElement(child, {
            id: childId,
            open: openItems.has(childId),
            onToggle: (isOpen: boolean) => {
              handleToggle(childId, isOpen);
              child.props.onToggle?.(isOpen);
            },
          });
        }
        return child;
      })}
    </div>
  );
};

export default Details;
