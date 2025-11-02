/**
 * Type augmentations for experimental browser APIs
 */

/**
 * View Transitions API type augmentation
 * @see https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API
 */
interface ViewTransition {
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
  ready: Promise<void>;
  skipTransition: () => void;
}

interface Document {
  startViewTransition?: (callback: () => void) => ViewTransition;
}

export {};
