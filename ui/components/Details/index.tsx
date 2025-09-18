/**
 * Details Composer - Provider-based orchestration exports
 *
 * Layer: Composer
 * Meta-patterns: Context provider, slotting & substitution, headless logic
 *
 * @author @darianrosebrook
 */

// Main composer components
export {
  Details as default,
  Details,
  DetailsInline,
  DetailsCompact,
} from './Details';
export type { DetailsProps } from './Details';

// Provider for group orchestration
export { DetailsProvider } from './DetailsProvider';
export type {
  DetailsProviderProps,
  DetailsContextValue,
} from './DetailsProvider';

// Headless logic hook
export { useDetails } from './useDetails';
export type { UseDetailsOptions, UseDetailsReturn } from './useDetails';
