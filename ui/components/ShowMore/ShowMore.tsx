/**
 * ShowMore (Compound)
 * Generated via scaffold CLI.
 */
'use client';
import * as React from 'react';
import styles from './ShowMore.module.scss';

export interface ShowMoreProps extends React.HTMLAttributes<HTMLDivElement> {}

// ShowMore Context
interface ShowMoreContextValue {
  isOpen: boolean;
  toggle: () => void;
}

const ShowMoreContext = React.createContext<ShowMoreContextValue | null>(null);

const useShowMoreContext = () => {
  const context = React.useContext(ShowMoreContext);
  if (!context) {
    throw new Error(
      'ShowMore compound components must be used within ShowMore'
    );
  }
  return context;
};

// Root ShowMore Component
const ShowMoreComponent = React.forwardRef<HTMLDivElement, ShowMoreProps>(
  ({ className = '', children, ...rest }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const toggle = React.useCallback(() => {
      setIsOpen((prev) => !prev);
    }, []);

    const contextValue = React.useMemo(
      () => ({
        isOpen,
        toggle,
      }),
      [isOpen, toggle]
    );

    return (
      <ShowMoreContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={[styles.showmore, className].filter(Boolean).join(' ')}
          {...rest}
        >
          {children}
        </div>
      </ShowMoreContext.Provider>
    );
  }
);

// Create compound component type
export const ShowMore = ShowMoreComponent as typeof ShowMoreComponent & {
  Trigger: typeof ShowMoreTrigger;
  Content: typeof ShowMoreContent;
};

// Trigger Component
export interface ShowMoreTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const ShowMoreTrigger = React.forwardRef<
  HTMLButtonElement,
  ShowMoreTriggerProps
>(({ className = '', children, ...rest }, ref) => {
  const { toggle } = useShowMoreContext();

  return (
    <button
      ref={ref}
      type="button"
      role="button"
      className={[styles.trigger, className].filter(Boolean).join(' ')}
      onClick={toggle}
      {...rest}
    >
      {children}
    </button>
  );
});

// Content Component
export interface ShowMoreContentProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const ShowMoreContent = React.forwardRef<
  HTMLDivElement,
  ShowMoreContentProps
>(({ className = '', children, ...rest }, ref) => {
  const { isOpen } = useShowMoreContext();

  return (
    <div
      ref={ref}
      className={[styles.content, className].filter(Boolean).join(' ')}
      hidden={!isOpen}
      {...rest}
    >
      {children}
    </div>
  );
});

// Add compound component properties
ShowMore.Trigger = ShowMoreTrigger;
ShowMore.Content = ShowMoreContent;

ShowMore.displayName = 'ShowMore';
ShowMoreTrigger.displayName = 'ShowMore.Trigger';
ShowMoreContent.displayName = 'ShowMore.Content';

export default ShowMore;
