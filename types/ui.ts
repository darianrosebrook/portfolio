import { LocalIcons } from '@/ui/components/Icon/LocalIcons';

// Canonical, shared UI types for components

// Intents
export type Intent = 'info' | 'success' | 'warning' | 'danger';
export type ErrorIntent = 'error';
export type StatusIntent = Intent | ErrorIntent;

// Control sizing aligned to semantic tokens
export type ControlSize = 'sm' | 'md' | 'lg';

// Emphasis/appearance variants
export type EmphasisVariant = 'primary' | 'secondary' | 'tertiary';

// Overlay behaviors
export type Placement = 'top' | 'bottom' | 'left' | 'right' | 'auto';
export type TriggerStrategy = 'click' | 'hover';

// ARIA politeness (for live regions, e.g., Toast)
export type AriaPoliteness = 'polite' | 'assertive';

// Common props patterns
export interface DismissibleProps {
  dismissible?: boolean;
  onDismiss?: (event: React.MouseEvent) => void;
}

export interface OpenStateProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

// Option models for selection controls
export interface Option<TValue extends string = string> {
  id: TValue; // or "value"
  title: string; // or "label"
  group?: string;
  disabled?: boolean;
}

export interface OptionGroup<TValue extends string = string> {
  label: string;
  options: Option<TValue>[];
}

// Form field metadata
export interface FieldMeta {
  id?: string;
  label?: string;
  description?: string;
  error?: string;
  required?: boolean;
  invalid?: boolean;
}

// Local icon registry name type
export type IconName = keyof typeof LocalIcons;

// Helpers
export function normalizeStatusIntent(intent: StatusIntent): Intent {
  return intent === 'error' ? 'danger' : intent;
}
