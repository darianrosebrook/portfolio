/**
 * Toast Composer - Notification system with queue management
 *
 * Layer: Composer
 * Meta-patterns: Context provider, slotting, headless logic (useToastLogic)
 *
 * Usage:
 * 1. Wrap your app with <Toast.Provider>
 * 2. Place <Toast.Viewport /> where toasts should appear
 * 3. Use the useToast() hook to show toasts
 *
 * Example:
 * ```tsx
 * function App() {
 *   return (
 *     <Toast.Provider>
 *       <YourApp />
 *       <Toast.Viewport />
 *     </Toast.Provider>
 *   );
 * }
 *
 * function YourComponent() {
 *   const { enqueue } = useToast();
 *
 *   const showSuccess = () => {
 *     enqueue({
 *       title: 'Success!',
 *       description: 'Your changes have been saved.',
 *       variant: 'success',
 *     });
 *   };
 * }
 * ```
 */
'use client';
import * as React from 'react';
import { ToastProvider } from './ToastProvider';
import { ToastViewport, ToastViewportProps } from './ToastViewport';
import { ToastItem, ToastItemProps } from './ToastItem';
import { ToastTitle } from './slots/ToastTitle';
import { ToastDescription } from './slots/ToastDescription';
import { ToastAction } from './slots/ToastAction';
import { ToastClose } from './slots/ToastClose';

export interface ToastProps extends ToastViewportProps {}

/**
 * Toast component - Main export for convenience.
 * For full control, use the individual components (Provider, Viewport, Item, etc.)
 */
export const ToastRoot: React.FC<ToastProps> = ({
  politeness = 'polite',
  ...rest
}) => {
  return <ToastViewport politeness={politeness} {...rest} />;
};

ToastRoot.displayName = 'Toast';

// Compound component pattern
export const Toast = Object.assign(ToastRoot, {
  /** Provider - Wrap your app to enable toast notifications */
  Provider: ToastProvider,
  /** Viewport - Where toasts are rendered (usually at app root) */
  Viewport: ToastViewport,
  /** Item - Individual toast component (usually auto-rendered) */
  Item: ToastItem,
  /** Title - Toast title slot */
  Title: ToastTitle,
  /** Description - Toast description slot */
  Description: ToastDescription,
  /** Action - Toast action button slot */
  Action: ToastAction,
  /** Close - Toast close button slot */
  Close: ToastClose,
});

export default Toast;
