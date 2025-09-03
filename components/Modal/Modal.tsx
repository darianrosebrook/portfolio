import React, {
  useMemo,
  useEffect,
  useRef,
  useCallback,
  useId,
  createPortal,
} from 'react';
import styles from './Modal.module.scss';
import {
  ModalProps,
  ModalOverlayProps,
  ModalContainerProps,
  ModalHeaderProps,
  ModalBodyProps,
  ModalFooterProps,
  ModalCloseButtonProps,
  ModalTheme,
  DEFAULT_MODAL_TOKENS,
} from './Modal.types';
import {
  mergeTokenSources,
  tokensToCSSProperties,
  safeTokenValue,
  TokenSource,
  TokenValue,
} from '@/utils/designTokens';

// Import the default token configuration
import defaultTokenConfig from './Modal.tokens.json';

/**
 * Custom hook for managing Modal design tokens
 * Supports multiple token sources with smart defaults and BYODS patterns
 */
function useModalTokens(
  theme?: ModalTheme,
  _size = 'medium',
  _animation = 'fade'
) {
  return useMemo(() => {
    const tokenSources: TokenSource[] = [];

    // 1. Start with JSON token configuration
    tokenSources.push({
      type: 'json',
      data: defaultTokenConfig,
    });

    // 2. Add external token config if provided
    if (theme?.tokenConfig) {
      tokenSources.push({
        type: 'json',
        data: theme.tokenConfig,
      });
    }

    // 3. Add inline token overrides
    if (theme?.tokens) {
      const inlineTokens: Record<string, TokenValue> = {};
      Object.entries(theme.tokens).forEach(([key, value]) => {
        inlineTokens[`modal-${key}`] = value;
      });

      tokenSources.push({
        type: 'inline',
        tokens: inlineTokens,
      });
    }

    // Merge all token sources with fallbacks
    const resolvedTokens = mergeTokenSources(tokenSources, {
      fallbacks: (() => {
        const fallbacks: Record<string, TokenValue> = {};
        Object.entries(DEFAULT_MODAL_TOKENS).forEach(([key, value]) => {
          fallbacks[`modal-${key}`] = value;
        });
        return fallbacks;
      })(),
    });

    // Generate CSS custom properties
    const cssProperties = tokensToCSSProperties(resolvedTokens, 'modal');

    // Add any direct CSS property overrides
    if (theme?.cssProperties) {
      Object.assign(cssProperties, theme.cssProperties);
    }

    return {
      tokens: resolvedTokens,
      cssProperties,
    };
  }, [theme]);
}

/**
 * Custom hook for focus management
 */
function useFocusManagement(
  isOpen: boolean,
  trapFocus: boolean,
  restoreFocus: boolean,
  initialFocus?: string,
  returnFocus?: string
) {
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Set initial focus
      if (initialFocus) {
        const element = document.querySelector(initialFocus) as HTMLElement;
        if (element) {
          element.focus();
        }
      } else if (modalRef.current) {
        // Focus the modal container by default
        modalRef.current.focus();
      }
    } else if (restoreFocus && previousActiveElement.current) {
      // Restore focus when modal closes
      if (returnFocus) {
        const element = document.querySelector(returnFocus) as HTMLElement;
        if (element) {
          element.focus();
        }
      } else {
        previousActiveElement.current.focus();
      }
    }
  }, [isOpen, initialFocus, returnFocus, restoreFocus]);

  // Focus trap functionality
  useEffect(() => {
    if (!isOpen || !trapFocus || !modalRef.current) return;

    const modal = modalRef.current;
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    };

    modal.addEventListener('keydown', handleTabKey);
    return () => modal.removeEventListener('keydown', handleTabKey);
  }, [isOpen, trapFocus]);

  return modalRef;
}

/**
 * Custom hook for body scroll prevention
 */
function useBodyScrollLock(isOpen: boolean, preventBodyScroll: boolean) {
  useEffect(() => {
    if (!preventBodyScroll) return;

    if (isOpen) {
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen, preventBodyScroll]);
}

/**
 * Modal Overlay Component
 */
const ModalOverlay: React.FC<ModalOverlayProps> = ({
  children,
  isOpen,
  onClose,
  closeOnOverlayClick = true,
  className = '',
  theme,
}) => {
  const { cssProperties } = useModalTokens(theme);

  const handleOverlayClick = (event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      onClose?.();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className={`${styles.modalOverlay} ${className}`}
      style={cssProperties}
      onClick={handleOverlayClick}
    >
      {children}
    </div>
  );
};

/**
 * Modal Container Component
 */
const ModalContainer: React.FC<ModalContainerProps> = ({
  children,
  size = 'medium',
  animation = 'fade',
  className = '',
  theme,
  ...ariaProps
}) => {
  const { cssProperties } = useModalTokens(theme, size, animation);

  const containerClasses = [
    styles.modalContainer,
    styles[`modalContainer--${size}`] || '',
    styles[`modalContainer--${animation}`] || '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={containerClasses}
      style={cssProperties}
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      {...ariaProps}
    >
      {children}
    </div>
  );
};

/**
 * Modal Header Component
 */
const ModalHeader: React.FC<ModalHeaderProps> = ({
  children,
  title,
  showCloseButton = true,
  onClose,
  closeButtonContent,
  className = '',
}) => (
  <div className={`${styles.modalHeader} ${className}`}>
    <div className={styles.modalHeaderContent}>
      {title && <h2 className={styles.modalTitle}>{title}</h2>}
      {children}
    </div>
    {showCloseButton && onClose && (
      <ModalCloseButton onClose={onClose}>
        {closeButtonContent}
      </ModalCloseButton>
    )}
  </div>
);

/**
 * Modal Body Component
 */
const ModalBody: React.FC<ModalBodyProps> = ({ children, className = '' }) => (
  <div className={`${styles.modalBody} ${className}`}>{children}</div>
);

/**
 * Modal Footer Component
 */
const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  className = '',
}) => <div className={`${styles.modalFooter} ${className}`}>{children}</div>;

/**
 * Modal Close Button Component
 */
const ModalCloseButton: React.FC<ModalCloseButtonProps> = ({
  onClose,
  children,
  className = '',
  'aria-label': ariaLabel = 'Close modal',
}) => (
  <button
    type="button"
    className={`${styles.modalCloseButton} ${className}`}
    onClick={onClose}
    aria-label={ariaLabel}
  >
    {children || (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 6L6 18M6 6L18 18"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )}
  </button>
);

/**
 * Modal Component with Design Token Support
 *
 * Features:
 * - Smart defaults with fallback values
 * - Bring-your-own-design-system (BYODS) support
 * - Multiple token sources (JSON, CSS, inline)
 * - Type-safe token management
 * - Multiple sizes and animation variants
 * - Focus management and trapping
 * - Body scroll prevention
 * - Portal rendering for proper z-index
 * - Keyboard navigation (Escape to close)
 * - Overlay click to close
 * - Accessibility-first design with ARIA
 * - Lifecycle callbacks for advanced control
 */
const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  size = 'medium',
  animation = 'fade',
  theme,
  className = '',
  overlayClassName = '',
  title,
  showHeader = true,
  showCloseButton = true,
  showFooter = false,
  footer,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  trapFocus = true,
  restoreFocus = true,
  preventBodyScroll = true,
  closeButtonContent,
  portalContainer,
  initialFocus,
  returnFocus,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy,
  'data-testid': testId,
  onOpen,
  onAfterOpen,
  onBeforeClose,
  onAfterClose,
}) => {
  // Generate unique IDs
  const modalId = useId();
  const titleId = `${modalId}-title`;
  const bodyId = `${modalId}-body`;

  // Safe validation for props
  const safeSize = safeTokenValue(size, 'medium', (val) =>
    ['small', 'medium', 'large', 'fullscreen'].includes(val as string)
  ) as string;

  const safeAnimation = safeTokenValue(animation, 'fade', (val) =>
    ['fade', 'scale', 'slide-up', 'slide-down'].includes(val as string)
  ) as string;

  // Focus management
  const modalRef = useFocusManagement(
    isOpen,
    trapFocus,
    restoreFocus,
    initialFocus,
    returnFocus
  );

  // Body scroll lock
  useBodyScrollLock(isOpen, preventBodyScroll);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onBeforeClose?.();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose, onBeforeClose]);

  // Lifecycle callbacks
  useEffect(() => {
    if (isOpen) {
      onOpen?.();
      // Use setTimeout to ensure DOM is updated
      setTimeout(() => onAfterOpen?.(), 0);
    } else {
      onAfterClose?.();
    }
  }, [isOpen, onOpen, onAfterOpen, onAfterClose]);

  // Handle close with before callback
  const handleClose = useCallback(() => {
    onBeforeClose?.();
    onClose();
  }, [onClose, onBeforeClose]);

  // Determine portal container
  const container = portalContainer || document.body;

  // Render modal content
  const modalContent = (
    <ModalOverlay
      isOpen={isOpen}
      onClose={handleClose}
      closeOnOverlayClick={closeOnOverlayClick}
      className={overlayClassName}
      theme={theme}
    >
      <ModalContainer
        ref={modalRef}
        size={safeSize as any}
        animation={safeAnimation as any}
        className={className}
        theme={theme}
        aria-label={ariaLabel}
        aria-labelledby={title ? titleId : ariaLabelledBy}
        aria-describedby={ariaDescribedBy || bodyId}
        data-testid={testId}
      >
        {(showHeader || title) && (
          <ModalHeader
            title={title}
            showCloseButton={showCloseButton}
            onClose={handleClose}
            closeButtonContent={closeButtonContent}
          />
        )}

        <ModalBody>{children}</ModalBody>

        {showFooter && footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContainer>
    </ModalOverlay>
  );

  // Render through portal
  return createPortal(modalContent, container);
};

// Export sub-components for advanced usage
export {
  ModalOverlay,
  ModalContainer,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
};
export default Modal;
export type { ModalProps, ModalTheme } from './Modal.types';
