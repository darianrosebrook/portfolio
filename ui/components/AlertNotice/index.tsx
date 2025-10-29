/**
 * @deprecated AlertNotice has been consolidated into Alert component.
 * Use Alert with level="inline|section|page" instead.
 * This alias will be removed in a future version.
 */

// Re-export Alert as AlertNotice for backwards compatibility
export { default } from '../Alert';
export { Alert as AlertNotice } from '../Alert';
export type { AlertProps as AlertNoticeProps } from '../Alert/Alert';
