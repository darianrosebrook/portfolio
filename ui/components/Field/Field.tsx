import React from 'react';
import { useFieldCtx } from './FieldProvider';
import styles from './Field.module.scss';
import { Label } from './Label';
import { HelpText } from './HelpText';
import { ErrorText } from './ErrorText';
import Spinner from '@/ui/components/Spinner';

export function Field({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const f = useFieldCtx();
  const cls = [styles.root, f.status === 'invalid' && styles.invalid, className]
    .filter(Boolean)
    .join(' ');
  return (
    <div
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

// Slot components for explicit composition
Field.Label = Label;
Field.Label.displayName = 'Field.Label';

Field.Error = ErrorText;
Field.Error.displayName = 'Field.Error';

Field.Help = HelpText;
Field.Help.displayName = 'Field.Help';

export default Field;
