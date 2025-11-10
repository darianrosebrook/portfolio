/**
 * Sheet (Composer)
 * A slide-out panel component that can appear from any side of the screen.
 * Supports both modal and non-modal modes with proper accessibility.
 */
'use client';
import * as React from 'react';
import { createPortal } from 'react-dom';
import styles from './Sheet.module.scss';
import {
  SheetProvider,
  SheetProviderProps,
  useSheetContext,
} from './SheetProvider';
import { SheetSide } from './useSheet';

// X Icon component (replacing Lucide dependency)
const XIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 6L6 18M6 6L18 18" />
  </svg>
);

// Root Sheet Component
export interface SheetProps
  extends Omit<
      React.HTMLAttributes<HTMLDivElement>,
      'defaultValue' | 'children'
    >,
    Omit<SheetProviderProps, 'children'> {
  children: React.ReactNode;
}

const SheetRoot: React.FC<SheetProps> = ({
  className = '',
  children,
  ...sheetOptions
}) => {
  return (
    <SheetProvider {...sheetOptions}>
      <div
        className={[styles.root, className].filter(Boolean).join(' ')}
        data-slot="sheet"
      >
        {children}
      </div>
    </SheetProvider>
  );
};

// Sheet Trigger Component
export interface SheetTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const SheetTrigger = React.forwardRef<HTMLButtonElement, SheetTriggerProps>(
  ({ className = '', children, ...rest }, ref) => {
    const { open, triggerRef } = useSheetContext();

    const combinedRef = React.useCallback(
      (node: HTMLButtonElement) => {
        if (triggerRef) {
          triggerRef.current = node;
        }
        if (ref) {
          if (typeof ref === 'function') {
            ref(node);
          } else {
            ref.current = node;
          }
        }
      },
      [triggerRef, ref]
    );

    return (
      <button
        ref={combinedRef}
        type="button"
        className={[styles.trigger, className].filter(Boolean).join(' ')}
        data-slot="sheet-trigger"
        onClick={open}
        {...rest}
      >
        {children}
      </button>
    );
  }
);

// Sheet Portal Component
export interface SheetPortalProps {
  children: React.ReactNode;
  container?: HTMLElement;
}

const SheetPortal: React.FC<SheetPortalProps> = ({
  children,
  container = typeof document !== 'undefined' ? document.body : undefined,
}) => {
  if (!container) return null;
  return createPortal(children, container);
};

// Sheet Overlay Component
export interface SheetOverlayProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const SheetOverlay = React.forwardRef<HTMLDivElement, SheetOverlayProps>(
  ({ className = '', ...rest }, ref) => {
    const { close, modal } = useSheetContext();

    const handleClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        close();
      }
    };

    return (
      <div
        ref={ref}
        className={[styles.overlay, modal ? styles.modal : '', className]
          .filter(Boolean)
          .join(' ')}
        data-slot="sheet-overlay"
        onClick={modal ? handleClick : undefined}
        {...rest}
      />
    );
  }
);

// Sheet Content Component
export interface SheetContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  side?: SheetSide;
  closeOnEscape?: boolean;
  closeOnOverlayClick?: boolean;
}

const SheetContent = React.forwardRef<HTMLDivElement, SheetContentProps>(
  (
    {
      className = '',
      children,
      side: propSide,
      closeOnEscape = true,
      closeOnOverlayClick = true,
      ...rest
    },
    ref
  ) => {
    const {
      isOpen,
      close,
      side: contextSide,
      modal,
      contentRef,
      triggerRef,
    } = useSheetContext();
    const side = propSide || contextSide;

    const combinedRef = React.useCallback(
      (node: HTMLDivElement) => {
        if (contentRef) {
          contentRef.current = node;
        }
        if (ref) {
          if (typeof ref === 'function') {
            ref(node);
          } else {
            ref.current = node;
          }
        }
      },
      [contentRef, ref]
    );

    // Keyboard event handling
    React.useEffect(() => {
      if (!isOpen || !closeOnEscape) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          close();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, closeOnEscape, close]);

    // Focus management
    React.useEffect(() => {
      if (!isOpen) return;

      const content = contentRef?.current;
      if (!content) return;

      // Store previously focused element for return focus
      const previousFocusedElement = document.activeElement as HTMLElement;

      // Focus first focusable element
      const focusableElement = content.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;

      if (focusableElement) {
        focusableElement.focus();
      }

      // Focus trap for modal sheets
      let focusTrapCleanup: (() => void) | undefined;
      if (modal) {
        const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'Tab') {
            const focusableElements = content.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );

            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0] as HTMLElement;
            const lastElement = focusableElements[
              focusableElements.length - 1
            ] as HTMLElement;

            if (e.shiftKey) {
              if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
              }
            } else {
              if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
              }
            }
          }
        };

        document.addEventListener('keydown', handleKeyDown);
        focusTrapCleanup = () =>
          document.removeEventListener('keydown', handleKeyDown);
      }

      return () => {
        // Cleanup focus trap
        focusTrapCleanup?.();

        // Return focus to trigger when sheet closes
        if (triggerRef?.current && document.contains(triggerRef.current)) {
          triggerRef.current.focus();
        } else if (
          previousFocusedElement &&
          document.contains(previousFocusedElement)
        ) {
          previousFocusedElement.focus();
        }
      };
    }, [isOpen, modal, contentRef, triggerRef]);

    // Body scroll lock for modal sheets
    React.useEffect(() => {
      if (!modal || !isOpen) return;

      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }, [modal, isOpen]);

    if (!isOpen) return null;

    return (
      <SheetPortal>
        <SheetOverlay />
        <div
          ref={combinedRef}
          className={[styles.content, styles[side], className]
            .filter(Boolean)
            .join(' ')}
          data-slot="sheet-content"
          data-side={side}
          data-state={isOpen ? 'open' : 'closed'}
          role="dialog"
          aria-modal={modal}
          {...rest}
        >
          {children}
        </div>
      </SheetPortal>
    );
  }
);

// Sheet Header Component
export interface SheetHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const SheetHeader: React.FC<SheetHeaderProps> = ({
  className = '',
  children,
  ...rest
}) => (
  <div
    className={[styles.header, className].filter(Boolean).join(' ')}
    data-slot="sheet-header"
    {...rest}
  >
    {children}
  </div>
);

// Sheet Title Component
export interface SheetTitleProps
  extends React.HTMLAttributes<HTMLHeadingElement> {}

const SheetTitle: React.FC<SheetTitleProps> = ({
  className = '',
  children,
  ...rest
}) => (
  <h2
    className={[styles.title, className].filter(Boolean).join(' ')}
    data-slot="sheet-title"
    {...rest}
  >
    {children}
  </h2>
);

// Sheet Description Component
export interface SheetDescriptionProps
  extends React.HTMLAttributes<HTMLParagraphElement> {}

const SheetDescription: React.FC<SheetDescriptionProps> = ({
  className = '',
  children,
  ...rest
}) => (
  <p
    className={[styles.description, className].filter(Boolean).join(' ')}
    data-slot="sheet-description"
    {...rest}
  >
    {children}
  </p>
);

// Sheet Body Component
export interface SheetBodyProps extends React.HTMLAttributes<HTMLDivElement> {}

const SheetBody: React.FC<SheetBodyProps> = ({
  className = '',
  children,
  ...rest
}) => (
  <div
    className={[styles.body, className].filter(Boolean).join(' ')}
    data-slot="sheet-body"
    {...rest}
  >
    {children}
  </div>
);

// Sheet Footer Component
export interface SheetFooterProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const SheetFooter: React.FC<SheetFooterProps> = ({
  className = '',
  children,
  ...rest
}) => (
  <div
    className={[styles.footer, className].filter(Boolean).join(' ')}
    data-slot="sheet-footer"
    {...rest}
  >
    {children}
  </div>
);

// Sheet Close Button Component
export interface SheetCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

const SheetClose = React.forwardRef<HTMLButtonElement, SheetCloseProps>(
  ({ className = '', children, ...rest }, ref) => {
    const { close } = useSheetContext();

    return (
      <button
        ref={ref}
        type="button"
        className={[styles.close, className].filter(Boolean).join(' ')}
        data-slot="sheet-close"
        onClick={close}
        aria-label="Close sheet"
        {...rest}
      >
        {children || <XIcon />}
      </button>
    );
  }
);

// Compound export
export const Sheet = Object.assign(SheetRoot, {
  Trigger: SheetTrigger,
  Portal: SheetPortal,
  Overlay: SheetOverlay,
  Content: SheetContent,
  Header: SheetHeader,
  Title: SheetTitle,
  Description: SheetDescription,
  Body: SheetBody,
  Footer: SheetFooter,
  Close: SheetClose,
});

// Set display names
SheetRoot.displayName = 'Sheet';
SheetTrigger.displayName = 'Sheet.Trigger';
SheetPortal.displayName = 'Sheet.Portal';
SheetOverlay.displayName = 'Sheet.Overlay';
SheetContent.displayName = 'Sheet.Content';
SheetHeader.displayName = 'Sheet.Header';
SheetTitle.displayName = 'Sheet.Title';
SheetDescription.displayName = 'Sheet.Description';
SheetBody.displayName = 'Sheet.Body';
SheetFooter.displayName = 'Sheet.Footer';
SheetClose.displayName = 'Sheet.Close';

export default Sheet;
