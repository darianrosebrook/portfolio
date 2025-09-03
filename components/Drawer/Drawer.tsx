import React, { useMemo, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import styles from './Drawer.module.scss';
import {
  DrawerProps,
  DrawerTheme,
  DEFAULT_DRAWER_TOKENS,
} from './Drawer.types';
import {
  mergeTokenSources,
  tokensToCSSProperties,
  safeTokenValue,
  TokenSource,
  TokenValue,
} from '@/utils/designTokens';
import defaultTokenConfig from './Drawer.tokens.json';

function useDrawerTokens(theme?: DrawerTheme) {
  return useMemo(() => {
    const sources: TokenSource[] = [{ type: 'json', data: defaultTokenConfig }];
    if (theme?.tokenConfig)
      sources.push({ type: 'json', data: theme.tokenConfig });
    if (theme?.tokens) {
      const inline: Record<string, TokenValue> = {};
      Object.entries(theme.tokens).forEach(([k, v]) => {
        inline[`drawer-${k}`] = v;
      });
      sources.push({ type: 'inline', tokens: inline });
    }
    const resolved = mergeTokenSources(sources, {
      fallbacks: (() => {
        const fb: Record<string, TokenValue> = {};
        Object.entries(DEFAULT_DRAWER_TOKENS).forEach(([k, v]) => {
          fb[`drawer-${k}`] = v;
        });
        return fb;
      })(),
    });
    const cssProperties = tokensToCSSProperties(resolved, 'drawer');
    if (theme?.cssProperties) Object.assign(cssProperties, theme.cssProperties);
    return { tokens: resolved, cssProperties };
  }, [theme]);
}

function useFocusTrap(
  isOpen: boolean,
  trapFocus: boolean,
  returnFocusOnClose: boolean
) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen || !trapFocus) return;

    // Store the currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus the drawer
    if (drawerRef.current) {
      drawerRef.current.focus();
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        const focusableElements = drawerRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, trapFocus]);

  useEffect(() => {
    if (!isOpen && returnFocusOnClose && previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [isOpen, returnFocusOnClose]);

  return drawerRef;
}

function usePreventScroll(isOpen: boolean, preventScroll: boolean) {
  useEffect(() => {
    if (!isOpen || !preventScroll) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [isOpen, preventScroll]);
}

function useEscapeKey(isOpen: boolean, closeOnEscape: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, closeOnEscape, onClose]);
}

const DrawerOverlay: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  closeOnOverlayClick?: boolean;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}> = ({ isOpen, onClose, closeOnOverlayClick = true, className = '', style, children }) => {
  const handleOverlayClick = useCallback(
    (event: React.MouseEvent) => {
      if (closeOnOverlayClick && event.target === event.currentTarget) {
        onClose();
      }
    },
    [closeOnOverlayClick, onClose]
  );

  const overlayClasses = [
    styles.drawerOverlay,
    isOpen ? styles['drawerOverlay--open'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={overlayClasses} style={style} onClick={handleOverlayClick}>
      {children}
    </div>
  );
};

const DrawerContent: React.FC<{
  placement: string;
  size: string;
  variant: string;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}> = ({ placement, size, variant, children, className = '', style }) => {
  const contentClasses = [
    styles.drawerContent,
    styles[`drawerContent--${placement}`] || '',
    styles[`drawerContent--${size}`] || '',
    styles[`drawerContent--${variant}`] || '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={contentClasses} style={style}>
      {children}
    </div>
  );
};

const DrawerHeader: React.FC<{
  title?: ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  closeButtonAriaLabel?: string;
  children?: ReactNode;
  className?: string;
  size: string;
}> = ({ title, onClose, showCloseButton = true, closeButtonAriaLabel = 'Close drawer', children, className = '', size }) => {
  const headerClasses = [
    styles.drawerHeader,
    styles[`drawerHeader--${size}`] || '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={headerClasses}>
      {title && <h2 className={styles.drawerTitle}>{title}</h2>}
      {children}
      {showCloseButton && onClose && (
        <button
          type="button"
          className={styles.drawerCloseButton}
          onClick={onClose}
          aria-label={closeButtonAriaLabel}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 4L4 12M4 4L12 12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
    </div>
  );
};

const DrawerBody: React.FC<{
  children: ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const bodyClasses = [styles.drawerBody, className].filter(Boolean).join(' ');

  return <div className={bodyClasses}>{children}</div>;
};

const DrawerFooter: React.FC<{
  children: ReactNode;
  className?: string;
  size: string;
}> = ({ children, className = '', size }) => {
  const footerClasses = [
    styles.drawerFooter,
    styles[`drawerFooter--${size}`] || '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={footerClasses}>{children}</div>;
};

const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  placement = 'right',
  size = 'medium',
  variant = 'default',
  title,
  children,
  theme,
  className = '',
  overlayClassName = '',
  contentClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  preventScroll = true,
  trapFocus = true,
  autoFocus = true,
  returnFocusOnClose = true,
  showCloseButton = true,
  closeButtonAriaLabel = 'Close drawer',
  header,
  footer,
  testId,
}) => {
  const { cssProperties } = useDrawerTokens(theme);
  const drawerRef = useFocusTrap(isOpen, trapFocus, returnFocusOnClose);

  usePreventScroll(isOpen, preventScroll);
  useEscapeKey(isOpen, closeOnEscape, onClose);

  const safePlacement = safeTokenValue(placement, 'right', (v) =>
    ['left', 'right', 'top', 'bottom'].includes(v as string)
  ) as string;
  const safeSize = safeTokenValue(size, 'medium', (v) =>
    ['small', 'medium', 'large', 'full'].includes(v as string)
  ) as string;
  const safeVariant = safeTokenValue(variant, 'default', (v) =>
    ['default', 'bordered', 'elevated'].includes(v as string)
  ) as string;

  const overlayClasses = [
    styles.drawerOverlay,
    styles[`drawerOverlay--${safePlacement}`] || '',
    overlayClassName,
  ]
    .filter(Boolean)
    .join(' ');

  if (!isOpen) return null;

  const drawerContent = (
    <DrawerOverlay
      isOpen={isOpen}
      onClose={onClose}
      closeOnOverlayClick={closeOnOverlayClick}
      className={overlayClasses}
      style={cssProperties}
    >
      <DrawerContent
        placement={safePlacement}
        size={safeSize}
        variant={safeVariant}
        className={contentClassName}
      >
        {(title || header || showCloseButton) && (
          <DrawerHeader
            title={title}
            onClose={onClose}
            showCloseButton={showCloseButton}
            closeButtonAriaLabel={closeButtonAriaLabel}
            className={headerClassName}
            size={safeSize}
          >
            {header}
          </DrawerHeader>
        )}

        <DrawerBody className={bodyClassName}>{children}</DrawerBody>

        {footer && (
          <DrawerFooter className={footerClassName} size={safeSize}>
            {footer}
          </DrawerFooter>
        )}
      </DrawerContent>
    </DrawerOverlay>
  );

  return createPortal(drawerContent, document.body);
};

// Sub-component exports
Drawer.Overlay = DrawerOverlay;
Drawer.Content = DrawerContent;
Drawer.Header = DrawerHeader;
Drawer.Body = DrawerBody;
Drawer.Footer = DrawerFooter;

export default Drawer;
export type { DrawerProps, DrawerTheme } from './Drawer.types';
