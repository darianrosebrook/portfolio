/**
 * Focus Management Utilities
 *
 * Shared utilities for managing focus, focus traps, and keyboard navigation
 * across components for consistent accessibility.
 */

import { useEffect, useRef, useCallback } from 'react';

/**
 * Get all focusable elements within a container
 */
export function getFocusableElements(container: Element): HTMLElement[] {
  const focusableSelectors = [
    'button',
    '[href]',
    'input',
    'select',
    'textarea',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors))
    .filter((el): el is HTMLElement => el instanceof HTMLElement)
    .filter(
      (el) => !el.hasAttribute('disabled') && !el.getAttribute('aria-disabled')
    );
}

/**
 * Create a focus trap within a container
 * Handles Tab key navigation to keep focus within the container
 */
export function useFocusTrap(
  containerRef: React.RefObject<Element>,
  options: {
    active?: boolean;
    initialFocusRef?: React.RefObject<HTMLElement>;
    restoreFocus?: boolean;
    onEscape?: () => void;
  } = {}
) {
  const {
    active = true,
    initialFocusRef,
    restoreFocus = true,
    onEscape,
  } = options;

  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !active) return;

    // Store the currently focused element for restoration
    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    // Get focusable elements
    const focusableElements = getFocusableElements(container);
    if (focusableElements.length === 0) return;

    // Set initial focus
    const initialFocusElement =
      initialFocusRef?.current || focusableElements[0];

    if (
      initialFocusElement &&
      typeof initialFocusElement.focus === 'function'
    ) {
      // Small delay to ensure DOM is ready
      setTimeout(() => initialFocusElement.focus(), 10);
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onEscape) {
        e.preventDefault();
        onEscape();
        return;
      }

      if (e.key !== 'Tab') return;

      // Update focusable elements in case DOM changed
      const currentFocusable = getFocusableElements(container);
      if (currentFocusable.length === 0) return;

      const firstElement = currentFocusable[0];
      const lastElement = currentFocusable[currentFocusable.length - 1];

      if (e.shiftKey) {
        // Shift+Tab: move to previous element
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: move to next element
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      // Restore focus if requested
      if (restoreFocus && previousFocusRef.current) {
        // Small delay to ensure cleanup is complete
        setTimeout(() => {
          if (
            previousFocusRef.current &&
            document.contains(previousFocusRef.current)
          ) {
            previousFocusRef.current.focus();
          }
        }, 10);
      }
    };
  }, [containerRef, active, initialFocusRef, restoreFocus, onEscape]);
}

/**
 * Hook for managing focus restoration
 */
export function useFocusRestoration() {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const saveFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restoreFocus = useCallback(() => {
    if (
      previousFocusRef.current &&
      document.contains(previousFocusRef.current)
    ) {
      previousFocusRef.current.focus();
    }
  }, []);

  return { saveFocus, restoreFocus };
}

/**
 * Create arrow key navigation for lists/grids
 */
export function useArrowNavigation(
  items: HTMLElement[],
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
    onNavigate?: (index: number, element: HTMLElement) => void;
  } = {}
) {
  const { orientation = 'vertical', loop = false, onNavigate } = options;

  return useCallback(
    (e: KeyboardEvent) => {
      const currentIndex = items.findIndex(
        (item) => item === document.activeElement
      );
      if (currentIndex === -1) return;

      let nextIndex = currentIndex;

      switch (e.key) {
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            nextIndex =
              loop && currentIndex === 0
                ? items.length - 1
                : Math.max(0, currentIndex - 1);
          }
          break;

        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            nextIndex =
              loop && currentIndex === items.length - 1
                ? 0
                : Math.min(items.length - 1, currentIndex + 1);
          }
          break;

        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            nextIndex =
              loop && currentIndex === 0
                ? items.length - 1
                : Math.max(0, currentIndex - 1);
          }
          break;

        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            nextIndex =
              loop && currentIndex === items.length - 1
                ? 0
                : Math.min(items.length - 1, currentIndex + 1);
          }
          break;

        case 'Home':
          nextIndex = 0;
          break;

        case 'End':
          nextIndex = items.length - 1;
          break;

        default:
          return;
      }

      e.preventDefault();
      const nextElement = items[nextIndex];
      if (nextElement) {
        nextElement.focus();
        onNavigate?.(nextIndex, nextElement);
      }
    },
    [items, orientation, loop, onNavigate]
  );
}

/**
 * Create a skip link for keyboard navigation
 */
export function createSkipLink(
  targetId: string,
  label: string,
  options: {
    className?: string;
    position?: 'top-left' | 'top-right';
  } = {}
): HTMLAnchorElement {
  const { className = '', position = 'top-left' } = options;

  const link = document.createElement('a');
  link.href = `#${targetId}`;
  link.textContent = label;
  link.className = `skip-link ${className}`.trim();

  // Base styles
  Object.assign(link.style, {
    position: 'absolute',
    zIndex: '9999',
    padding: '0.5rem 1rem',
    background: '#000',
    color: '#fff',
    textDecoration: 'none',
    fontWeight: 'bold',
    borderRadius: '4px',
    transition: 'transform 0.2s ease',
  });

  // Position styles
  if (position === 'top-left') {
    Object.assign(link.style, {
      top: '10px',
      left: '10px',
      transform: 'translateY(-100%)',
    });
  } else {
    Object.assign(link.style, {
      top: '10px',
      right: '10px',
      transform: 'translateY(-100%)',
    });
  }

  // Focus behavior
  link.addEventListener('focus', () => {
    link.style.transform =
      position === 'top-left' ? 'translateY(0)' : 'translateY(0)';
  });

  link.addEventListener('blur', () => {
    link.style.transform =
      position === 'top-left' ? 'translateY(-100%)' : 'translateY(-100%)';
  });

  return link;
}

/**
 * Hook for managing focus within a modal/overlay
 */
export function useModalFocus(
  modalRef: React.RefObject<Element>,
  options: {
    active?: boolean;
    autoFocus?: boolean;
    restoreFocus?: boolean;
  } = {}
) {
  const { active = true, autoFocus = true, restoreFocus = true } = options;
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active || !modalRef.current) return;

    if (restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    // Auto-focus first focusable element if requested
    if (autoFocus) {
      const focusableElements = getFocusableElements(modalRef.current);
      if (focusableElements.length > 0) {
        setTimeout(() => focusableElements[0].focus(), 10);
      }
    }
  }, [active, modalRef, autoFocus, restoreFocus]);

  useEffect(() => {
    if (!active || !modalRef.current) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        // Let parent component handle the escape
        // This just ensures focus management
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('keydown', handleEscape);

      if (restoreFocus && previousFocusRef.current) {
        setTimeout(() => {
          if (
            previousFocusRef.current &&
            document.contains(previousFocusRef.current)
          ) {
            previousFocusRef.current.focus();
          }
        }, 10);
      }
    };
  }, [active, restoreFocus]);

  return {
    focusableElements: modalRef.current
      ? getFocusableElements(modalRef.current)
      : [],
  };
}

/**
 * Focus scope utilities for managing focus within a specific area
 */
export const focusScope = {
  /**
   * Check if an element is within the focus scope
   */
  contains: (scope: Element, element: Element): boolean => {
    return scope.contains(element);
  },

  /**
   * Get the first focusable element within a scope
   */
  getFirstFocusable: (scope: Element): HTMLElement | null => {
    const elements = getFocusableElements(scope);
    return elements.length > 0 ? elements[0] : null;
  },

  /**
   * Get the last focusable element within a scope
   */
  getLastFocusable: (scope: Element): HTMLElement | null => {
    const elements = getFocusableElements(scope);
    return elements.length > 0 ? elements[elements.length - 1] : null;
  },

  /**
   * Move focus to the next element within scope
   */
  focusNext: (scope: Element, current?: Element): boolean => {
    const elements = getFocusableElements(scope);
    if (elements.length === 0) return false;

    const currentIndex = current
      ? elements.indexOf(current as HTMLElement)
      : -1;

    const nextIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : 0;

    elements[nextIndex].focus();
    return true;
  },

  /**
   * Move focus to the previous element within scope
   */
  focusPrevious: (scope: Element, current?: Element): boolean => {
    const elements = getFocusableElements(scope);
    if (elements.length === 0) return false;

    const currentIndex = current
      ? elements.indexOf(current as HTMLElement)
      : elements.length;

    const prevIndex = currentIndex > 0 ? currentIndex - 1 : elements.length - 1;

    elements[prevIndex].focus();
    return true;
  },
};
