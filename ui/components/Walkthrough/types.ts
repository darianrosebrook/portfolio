/** Types for Walkthrough (Coachmark / Feature Tour) Composer */
import * as React from 'react';

export type StepId = string;

export interface WalkthroughStepSpec {
  /** Stable identifier (analytics, persistence) */
  id: StepId;
  /** Optional: DOM anchor target — selector or element */
  target?: string | HTMLElement | null;
  /** Optional: Popover placement; falls back to Popover default */
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto' | string;
  /** Optional: preferred offset in px */
  offset?: number;
  /** Optional: when true, step is skippable by validator (e.g., target missing) */
  optional?: boolean;
  /** Content hints used by default slots */
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Optional: per-step onEnter/onExit hooks */
  onEnter?(index: number): void | Promise<void>;
  onExit?(index: number): void | Promise<void>;
}

export interface WalkthroughProps {
  /** Steps can be declared or discovered via <WalkthroughStep/> children */
  steps?: WalkthroughStepSpec[];
  /** Start index (0-based) if uncontrolled */
  defaultIndex?: number;
  /** Controlled index (0-based) */
  index?: number;
  /** Called whenever index changes (controlled or uncontrolled) */
  onIndexChange?(next: number, prev: number): void;
  /** Persist progress with this key (localStorage); omit to disable */
  storageKey?: string;
  /** Autostart when mounted if true and not previously completed */
  autoStart?: boolean;
  /** If true, allow multiple coachmarks concurrently across pages (multi-root) */
  allowConcurrent?: boolean;
  /** Close behavior when clicking target or outside */
  closeOnOutsideClick?: boolean;
  /** Lifecycle */
  onStart?(): void;
  onComplete?(): void;
  onCancel?(): void;
}

export interface WalkthroughContextValue {
  steps: WalkthroughStepSpec[];
  count: number;
  index: number;
  /** Equivalent to "currentVal" in your prompt */
  current: number;
  started: boolean;
  completed: boolean;
  open: boolean;
  next(): void;
  prev(): void;
  goTo(i: number): void;
  start(i?: number): void;
  cancel(): void;
  complete(): void;
  /** Active anchor element (resolved from step.target) */
  anchorEl: HTMLElement | null;
  /** Recompute anchor (e.g., after layout changes) */
  resolveAnchor(): void;
  /** Whether to close on outside click */
  closeOnOutsideClick?: boolean;
}

export interface WalkthroughUIProps {
  className?: string;
  /** Custom content render; default uses step.title/description */
  children?: React.ReactNode;
  /** When target missing, choose behavior */
  onMissingTarget?: 'skip' | 'pin-to-center' | 'hide';
}
