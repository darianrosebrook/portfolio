import { Database } from './supabase';
import { JSONContent } from '@tiptap/core';

export type Article = Database['public']['Tables']['articles']['Row'];
export type CaseStudy = Database['public']['Tables']['case_studies']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];

export type ArticleBody = JSONContent;

// UI component types
export type {
  Intent,
  ErrorIntent,
  StatusIntent,
  ControlSize,
  EmphasisVariant,
  Placement,
  TriggerStrategy,
  AriaPoliteness,
  DismissibleProps,
  OpenStateProps,
  Option,
  OptionGroup,
  FieldMeta,
  IconName,
} from './ui';

export { normalizeStatusIntent } from './ui';

// Component types
export type {
  BaseComponentProps,
  InteractiveComponentProps,
  FormFieldProps,
  ComponentSize,
  ComponentVariant,
  ComponentIntent,
  Orientation,
  Alignment,
  PolymorphicRef,
  ChangeHandler,
  ClickHandler,
  FocusHandler,
  KeyboardHandler,
  MouseHandler,
  TouchHandler,
  EventHandler,
  LoadingState,
  ErrorState,
  ValidationState,
  AriaAttributes,
  SelectOption,
  CheckboxOption,
  RadioOption,
  ModalState,
  DialogProps,
  Position,
  PositioningOptions,
  AnimationConfig,
  TransitionConfig,
  ComponentMetrics,
  ComponentWithRef,
  MergeProps,
  DistributiveOmit,
  UseToggleReturn,
  UseDisclosureReturn,
  UseControllableStateReturn,
  ThemeColors,
  ThemeSpacing,
  ThemeTypography,
  Theme,
  ButtonProps,
  InputProps,
  SelectProps,
} from './components';

// Bluesky types
export type {
  BlueskyProfile,
  BlueskyAuthor,
  BlueskyPostRecord,
  BlueskyPost,
  BlueskyFeedResponse,
  BlueskyEmbed,
  BlueskyVideoEmbed,
  BlueskyImageEmbed,
  BlueskyExternalEmbed,
} from './bluesky';
