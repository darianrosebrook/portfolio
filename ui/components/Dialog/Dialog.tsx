/**
 * Dialog - Modal and non-modal dialog component
 * Supports both blocking modal dialogs and non-blocking overlays
 */
'use client';
import React, {
  useRef,
  useId,
  useEffect,
  useCallback,
  forwardRef,
  createContext,
  useContext,
} from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { OpenStateProps, DismissibleProps } from '@/types/ui';
import styles from './Dialog.module.scss';

export type DialogSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface DialogProps extends OpenStateProps, DismissibleProps {
  /**
   * Whether dialog is modal (blocks interaction with background)
   */
  modal?: boolean;
  /**
   * Dialog size
   */
  size?: DialogSize;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Dialog content
   */
  children: React.ReactNode;
  /**
   * Callback when dialog should close (escape key, backdrop click)
   */
  onClose?: () => void;
  /**
   * Whether to close on backdrop click (modal only)
   */
  closeOnBackdropClick?: boolean;
  /**
   * Whether to close on escape key
   */
  closeOnEscape?: boolean;
  /**
   * Initial focus element selector
   */
  initialFocus?: string;
  /**
   * Return focus element selector
   */
  returnFocus?: string;
}

interface DialogContextType {
  dialogId: string;
  close: () => void;
}

const DialogContext = createContext<DialogContextType | null>(null);

const Dialog = forwardRef<HTMLDivElement, DialogProps>(
  (
    {
      open = false,
      defaultOpen = false,
      onOpenChange,
      modal = true,
      size = 'md',
      className = '',
      children,
      onClose,
      closeOnBackdropClick = true,
      closeOnEscape = true,
      initialFocus,
      returnFocus,
      dismissible = true,
      onDismiss,
    },
    forwardedRef
  ) => {
    const dialogId = `dialog-${useId()}`;
    const dialogRef = useRef<HTMLDivElement | null>(null);
    const backdropRef = useRef<HTMLDivElement | null>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);
    const animationRef = useRef<gsap.core.Timeline | null>(null);

    const isControlled = typeof open === 'boolean';
    const [internalOpen, setInternalOpen] = React.useState(defaultOpen);
    const isOpen = isControlled ? open : internalOpen;

    const close = useCallback(() => {
      if (isControlled) {
        onOpenChange?.(false);
      } else {
        setInternalOpen(false);
      }
      onClose?.();
      onDismiss?.({} as React.MouseEvent<HTMLButtonElement>);
    }, [isControlled, onOpenChange, onClose, onDismiss]);

    // Focus management
    useEffect(() => {
      if (!isOpen) return;

      // Store currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Set initial focus
      const focusElement = initialFocus
        ? (document.querySelector(initialFocus) as HTMLElement)
        : (dialogRef.current?.querySelector('[autofocus]') as HTMLElement) ||
          (dialogRef.current?.querySelector(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          ) as HTMLElement);

      if (focusElement) {
        focusElement.focus();
      }

      return () => {
        // Return focus when dialog closes
        const returnElement = returnFocus
          ? (document.querySelector(returnFocus) as HTMLElement)
          : previousActiveElement.current;

        if (returnElement && document.contains(returnElement)) {
          returnElement.focus();
        }
      };
    }, [isOpen, initialFocus, returnFocus]);

    // Keyboard event handling
    useEffect(() => {
      if (!isOpen) return;

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && closeOnEscape) {
          e.preventDefault();
          close();
        }

        // Trap focus for modal dialogs
        if (modal && e.key === 'Tab') {
          const focusableElements = dialogRef.current?.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );

          if (!focusableElements || focusableElements.length === 0) return;

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
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, modal, closeOnEscape, close]);

    // Backdrop click handling
    const handleBackdropClick = useCallback(
      (e: React.MouseEvent) => {
        if (modal && closeOnBackdropClick && e.target === backdropRef.current) {
          close();
        }
      },
      [modal, closeOnBackdropClick, close]
    );

    // Animation effects
    useEffect(() => {
      if (!dialogRef.current || !backdropRef.current) return;

      const dialogElement = dialogRef.current;
      const backdropElement = backdropRef.current;

      if (isOpen) {
        // Show animation
        backdropElement.style.opacity = '0';
        dialogElement.style.opacity = '0';
        dialogElement.style.transform = 'translateY(-20px) scale(0.95)';

        animationRef.current = gsap
          .timeline()
          .to(backdropElement, {
            duration: 0.2,
            opacity: 1,
            ease: 'power2.out',
          })
          .to(
            dialogElement,
            {
              duration: 0.3,
              opacity: 1,
              y: 0,
              scale: 1,
              ease: 'back.out(1.7)',
            },
            '-=0.1'
          );
      } else {
        // Hide animation
        if (animationRef.current) {
          animationRef.current.kill();
        }

        animationRef.current = gsap
          .timeline()
          .to(dialogElement, {
            duration: 0.2,
            opacity: 0,
            y: -10,
            scale: 0.95,
            ease: 'power2.in',
          })
          .to(
            backdropElement,
            {
              duration: 0.15,
              opacity: 0,
              ease: 'power2.in',
            },
            '-=0.1'
          );
      }

      return () => {
        if (animationRef.current) {
          animationRef.current.kill();
        }
      };
    }, [isOpen]);

    // Body scroll lock for modal dialogs
    useEffect(() => {
      if (!modal || !isOpen) return;

      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }, [modal, isOpen]);

    if (!isOpen) return null;

    const dialogClassName = [
      styles.dialog,
      styles[size],
      modal && styles.modal,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const dialogNode = (
      <div
        ref={backdropRef}
        className={`${styles.backdrop} ${modal ? styles.modal : ''}`}
        onClick={handleBackdropClick}
      >
        <div
          ref={(node) => {
            dialogRef.current = node;
            if (forwardedRef) {
              if (typeof forwardedRef === 'function') {
                forwardedRef(node);
              } else {
                forwardedRef.current = node;
              }
            }
          }}
          id={dialogId}
          role="dialog"
          aria-modal={modal}
          className={dialogClassName}
          onClick={(e) => e.stopPropagation()}
        >
          <DialogContext.Provider value={{ dialogId, close }}>
            {children}
          </DialogContext.Provider>
        </div>
      </div>
    );

    return typeof document !== 'undefined'
      ? createPortal(dialogNode, document.body)
      : dialogNode;
  }
);

Dialog.displayName = 'Dialog';

// Dialog subcomponents
const Header = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`${styles.header} ${className}`}>{children}</div>;
Header.displayName = 'Dialog.Header';

const Title = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <h2 className={`${styles.title} ${className}`}>{children}</h2>;
Title.displayName = 'Dialog.Title';

const Body = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`${styles.body} ${className}`}>{children}</div>;
Body.displayName = 'Dialog.Body';

const Footer = ({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) => <div className={`${styles.footer} ${className}`}>{children}</div>;
Footer.displayName = 'Dialog.Footer';

const CloseButton = ({
  children = '×',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const context = useContext(DialogContext);

  return (
    <button
      type="button"
      className={`${styles.close} ${className}`}
      onClick={context?.close}
      aria-label="Close dialog"
      {...props}
    >
      {children}
    </button>
  );
};
CloseButton.displayName = 'Dialog.CloseButton';

// Compound component
const DialogCompound = Object.assign(Dialog, {
  Header,
  Title,
  Body,
  Footer,
  CloseButton,
});

export { Header, Title, Body, Footer, CloseButton };
export default DialogCompound;
