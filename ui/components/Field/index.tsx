export { default } from './Field';
export { Field } from './Field';
export { FieldProvider, useFieldCtx } from './FieldProvider';
export { useField } from './useField';
export { useFieldControl } from './useFieldControl';
export { Label } from './Label';
export { HelpText } from './HelpText';
export { ErrorText } from './ErrorText';
export type { FieldProps, FieldStatus, FieldApi } from './Types.js';

// Import Field to access its sub-components
import { Field as FieldComponent } from './Field';

// Re-export slot components for convenience
export const FieldLabel = FieldComponent.Label;
export const FieldError = FieldComponent.Error;
export const FieldHelp = FieldComponent.Help;
