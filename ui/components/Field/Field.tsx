import React from 'react';
import { useFieldCtx } from './FieldProvider';
import styles from './Field.module.scss';
import { Label } from './Label';
import { HelpText } from './HelpText';
import { ErrorText } from './ErrorText';
import Spinner from '@/ui/components/Spinner';

export interface FieldComponentProps {
  children: React.ReactNode;
  className?: string;
}

const FieldComponent = React.forwardRef<HTMLDivElement, FieldComponentProps>(
  ({ children, className }, ref) => {
    const f = useFieldCtx();
    const cls = [styles.root, f.status === 'invalid' && styles.invalid, className]
      .filter(Boolean)
      .join(' ');
    return (
      <div
        ref={ref}
        className={cls}
        role="group"
        aria-labelledby={f.labelId}
        data-status={f.status}
      >
        <div className={styles.header}>
          <Label />
        </div>
        <div className={styles.control}>
          {children}
          {f.status === 'validating' ? (
            <span aria-live="polite" className={styles.validatingIndicator}>
              <Spinner size="sm" ariaHidden />
            </span>
          ) : null}
        </div>
        <div className={styles.meta}>
          <ErrorText />
          <HelpText />
        </div>
      </div>
    );
  }
);

FieldComponent.displayName = 'Field';

// Create compound component type
export const Field = Object.assign(FieldComponent, {
  Label,
  Error: ErrorText,
  Help: HelpText,
}) as typeof FieldComponent & {
  Label: typeof Label;
  Error: typeof ErrorText;
  Help: typeof HelpText;
};

// Slot components for explicit composition
Field.Label.displayName = 'Field.Label';
Field.Error.displayName = 'Field.Error';
Field.Help.displayName = 'Field.Help';

export default Field;
