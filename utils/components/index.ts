/**
 * Shared Component Utilities
 *
 * Reusable component patterns and utilities for building
 * reliable, accessible, and performant React components.
 */

// Error handling
export {
  ErrorBoundary,
  useErrorHandler,
  withErrorBoundary,
  DefaultErrorFallback,
  type ErrorBoundaryProps,
} from './ErrorBoundary';

// Form field abstraction
export {
  FormField,
  type FormFieldProps,
} from './FormField';

// Re-export performance monitoring for component use
export { performanceMonitor } from '../performance/monitor';
